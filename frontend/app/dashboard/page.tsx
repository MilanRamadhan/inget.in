'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../hooks/useNotes'
import { categoriesApi } from '../../lib/api'
import { Category, Note, NoteType, TodoItem } from '../../types'
import { NoteCard } from '../../components/NoteCard'
import { NoteForm } from '../../components/NoteForm'
import { CategoryFilter } from '../../components/CategoryFilter'
import { SaveModal } from '../../components/SaveModal'
import { Modal } from '../../components/ui/Modal'
import { savePendingNote } from '../../lib/utils'
import { LordIcon } from '../../components/LordIcon'
import { Logo } from '../../components/Logo'
import { ICONS, COLOR_PRIMARY, COLOR_WHITE, COLOR_MUTED } from '../../lib/icons'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const { notes, loading: notesLoading, fetchNotes, createNote, updateNote, deleteNote, toggleDone } =
    useNotes()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteType, setNewNoteType] = useState<NoteType>('text')
  const [dialOpen, setDialOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteFormLoading, setNoteFormLoading] = useState(false)

  const openNewNote = (type: NoteType) => {
    setNewNoteType(type)
    setShowNewNote(true)
    setDialOpen(false)
  }

  const todayFull = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotes()
      loadCategories()
    }
  }, [authLoading, user, fetchNotes])

  const loadCategories = async () => {
    try {
      const res = await categoriesApi.getAll()
      setCategories(res.data.data)
    } catch {}
  }

  const handleCategoryChange = useCallback(
    (id: string) => {
      setSelectedCategory(id)
      if (user) {
        fetchNotes(id !== 'all' ? { category: id } : undefined)
      }
    },
    [user, fetchNotes],
  )

  const handleGuestSave = async (data: any) => {
    savePendingNote({ title: data.title, note: data.note, scheduledAt: data.scheduledAt })
  }

  const handleCreateNote = async (data: any) => {
    setNoteFormLoading(true)
    try {
      await createNote(data)
      setShowNewNote(false)
    } finally {
      setNoteFormLoading(false)
    }
  }

  const handleUpdateNote = async (data: any) => {
    if (!editingNote) return
    setNoteFormLoading(true)
    try {
      await updateNote(editingNote.id, data)
      setEditingNote(null)
    } finally {
      setNoteFormLoading(false)
    }
  }

  // Toggle a single checklist item directly from the card (Notion-style).
  const handleToggleItem = async (noteId: string, itemId: string) => {
    const target = notes.find((n) => n.id === noteId)
    if (!target || !Array.isArray(target.items)) return
    const items = target.items.map((item) => {
      if (!('done' in item)) return item
      const todo = item as TodoItem
      return todo.id === itemId ? { ...todo, done: !todo.done } : todo
    })
    await updateNote(noteId, { items })
  }

  const handleCreateCategory = async (name: string, color: string): Promise<Category | null> => {
    try {
      const res = await categoriesApi.create({ name, color })
      const cat = res.data.data as Category
      setCategories((prev) => [...prev, cat])
      return cat
    } catch {
      return null
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* ─────────────────────────────────────────────
     GUEST VIEW
  ───────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <LordIcon src={ICONS.cloudOff} colors={COLOR_MUTED} size={19} />
              <button
                onClick={() => router.push('/login')}
                className="text-sm font-semibold text-primary hover:text-[#EA6C0A] transition-colors"
              >
                Login / Daftar
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
          <div className="bg-primary-light border border-orange-200 rounded-card p-3 mb-6 flex items-start gap-2">
            <LordIcon src={ICONS.info} colors={COLOR_PRIMARY} size={18} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary leading-relaxed">
              Login untuk menyimpan catatanmu secara permanen dan akses di perangkat lain.
            </p>
          </div>

          <div className="bg-white rounded-card border border-border shadow-sm p-5">
            <NoteForm
              isGuest
              onSubmit={handleGuestSave}
              onSaveClick={() => setShowSaveModal(true)}
            />
          </div>
        </main>

        <SaveModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onContinueWithout={() => setShowSaveModal(false)}
        />
      </div>
    )
  }

  /* ─────────────────────────────────────────────
     LOGGED-IN VIEW
  ───────────────────────────────────────────── */
  const reminderNotes = notes
    .filter((note) => Boolean(note.scheduledAt))
    .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
  const recentNotes = notes
    .filter((note) => !note.scheduledAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const noteRows = [
    {
      id: 'reminders',
      title: 'Pengingat',
      description: 'Urut berdasarkan jadwal terdekat',
      icon: ICONS.bell,
      notes: reminderNotes,
      emptyMessage: 'Belum ada catatan dengan pengingat.',
    },
    {
      id: 'recent',
      title: 'Catatan terbaru',
      description: 'Terakhir dibuat atau diedit',
      icon: ICONS.note,
      notes: recentNotes,
      emptyMessage: 'Belum ada catatan tanpa pengingat.',
    },
  ]
  const totalNotes = notes.length
  const doneNotes = notes.filter((n) => n.isDone).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-text-primary">
              {user.name.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-danger transition-colors"
            >
              <LordIcon src={ICONS.logout} trigger="hover" colors={COLOR_MUTED} size={22} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content (sidebar + notes) ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── LEFT SIDEBAR (desktop only) ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0 sticky top-20">
            {/* User card */}
            <div className="bg-white rounded-card border border-border p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">{user.name.split(' ')[0]}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary">{todayFull}</p>
              {/* Mini stats */}
              <div className="mt-3 flex gap-3">
                <div className="flex-1 bg-background rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-text-primary">{totalNotes}</p>
                  <p className="text-[10px] text-text-secondary">Catatan</p>
                </div>
                <div className="flex-1 bg-background rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-success">{doneNotes}</p>
                  <p className="text-[10px] text-text-secondary">Selesai</p>
                </div>
              </div>
            </div>

            {/* Category nav */}
            <div className="bg-white rounded-card border border-border p-4 shadow-sm">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-1">
                Kategori
              </p>
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={handleCategoryChange}
                vertical
              />
            </div>

            {/* New note speed-dial in sidebar */}
            <div className="relative">
              {dialOpen && (
                <div className="absolute bottom-full mb-2 inset-x-0 space-y-2">
                  <button
                    onClick={() => openNewNote('text')}
                    className="dial-item flex items-center gap-2 w-full py-2.5 px-3 bg-white border border-border text-sm font-medium rounded-chip hover:border-primary hover:text-primary shadow-sm transition-colors"
                  >
                    <LordIcon src={ICONS.note} colors={COLOR_PRIMARY} size={20} />
                    Tulisan
                  </button>
                  <button
                    onClick={() => openNewNote('todo')}
                    className="dial-item flex items-center gap-2 w-full py-2.5 px-3 bg-white border border-border text-sm font-medium rounded-chip hover:border-primary hover:text-primary shadow-sm transition-colors"
                  >
                    <LordIcon src={ICONS.list} colors={COLOR_PRIMARY} size={20} />
                    To-do list
                  </button>
                  <button
                    onClick={() => openNewNote('finance')}
                    className="dial-item flex items-center gap-2 w-full py-2.5 px-3 bg-white border border-border text-sm font-medium rounded-chip hover:border-primary hover:text-primary shadow-sm transition-colors"
                  >
                    <LordIcon src={ICONS.wallet} colors={COLOR_PRIMARY} size={20} />
                    Keuangan
                  </button>
                </div>
              )}
              <button
                onClick={() => setDialOpen((v) => !v)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-chip hover:bg-[#EA6C0A] active:scale-95 transition-all shadow-md shadow-primary/30"
              >
                <span className={`inline-flex transition-transform ${dialOpen ? 'rotate-45' : ''}`}>
                  <LordIcon src={ICONS.add} colors={COLOR_WHITE} size={20} />
                </span>
                Catatan Baru
              </button>
            </div>
          </aside>

          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile greeting */}
            <div className="lg:hidden mb-5">
              <p className="text-xs text-text-secondary">{todayFull}</p>
              <h1 className="text-xl font-bold text-text-primary mt-1">
                Hei, {user.name.split(' ')[0]}
                <span className="ml-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                  <LordIcon src={ICONS.wave} colors={COLOR_PRIMARY} size={14} />
                </span>
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">Semoga harimu menyenangkan!</p>
            </div>

            {/* Desktop greeting (compact, no sidebar redundancy) */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Hei, {user.name.split(' ')[0]}
                  <span className="ml-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 align-middle">
                    <LordIcon src={ICONS.wave} colors={COLOR_PRIMARY} size={14} />
                  </span>
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">Semoga harimu menyenangkan!</p>
              </div>
            </div>

            {/* Mobile category filter (horizontal chips) */}
            <div className="lg:hidden mb-5">
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={handleCategoryChange}
              />
            </div>

            {/* ── Notes ── */}
            {notesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex justify-center mb-4">
                  <LordIcon src={ICONS.note} trigger="loop" colors={COLOR_PRIMARY} size={88} />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">Belum ada catatan</h3>
                <p className="text-sm text-text-secondary mb-4">Pilih format catatan yang kamu butuhkan.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => openNewNote('text')}
                    className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-chip hover:bg-[#EA6C0A] transition-all"
                  >
                    <LordIcon src={ICONS.note} colors={COLOR_WHITE} size={20} />
                    Tulisan
                  </button>
                  <button
                    onClick={() => openNewNote('todo')}
                    className="inline-flex items-center gap-2 bg-white border border-border text-text-primary text-sm font-semibold px-5 py-2.5 rounded-chip hover:border-primary hover:text-primary transition-colors"
                  >
                    <LordIcon src={ICONS.list} colors={COLOR_PRIMARY} size={20} />
                    To-do list
                  </button>
                  <button
                    onClick={() => openNewNote('finance')}
                    className="inline-flex items-center gap-2 bg-white border border-border text-text-primary text-sm font-semibold px-5 py-2.5 rounded-chip hover:border-primary hover:text-primary transition-colors"
                  >
                    <LordIcon src={ICONS.wallet} colors={COLOR_PRIMARY} size={20} />
                    Keuangan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {noteRows.map((row) => (
                  <section key={row.id} aria-labelledby={`${row.id}-title`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <LordIcon src={row.icon} colors={COLOR_PRIMARY} size={17} />
                        </span>
                        <div className="min-w-0">
                          <h2
                            id={`${row.id}-title`}
                            className="text-sm font-bold text-text-primary"
                          >
                            {row.title}
                          </h2>
                          <p className="truncate text-[11px] text-text-secondary">
                            {row.description}
                          </p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-text-secondary">
                        {row.notes.length}
                      </span>
                    </div>

                    {row.notes.length > 0 ? (
                      <div className="-mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:px-0">
                        {row.notes.map((note) => (
                          <div
                            key={note.id}
                            className="w-[76vw] max-w-[280px] flex-none snap-start self-stretch sm:w-[260px]"
                          >
                            <NoteCard
                              note={note}
                              onToggleDone={toggleDone}
                              onEdit={setEditingNote}
                              onDelete={deleteNote}
                              onToggleItem={handleToggleItem}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-card border border-dashed border-border px-4 py-5 text-sm text-text-secondary">
                        {row.emptyMessage}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Speed-dial FAB (mobile only) ── */}
      {dialOpen && (
        <div className="lg:hidden fixed inset-0 z-20" onClick={() => setDialOpen(false)} />
      )}
      <div className="lg:hidden fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
        {dialOpen && (
          <>
            <button onClick={() => openNewNote('finance')} className="dial-item flex items-center gap-2">
              <span className="bg-white text-text-primary text-xs font-medium px-2.5 py-1 rounded-lg shadow">
                Keuangan
              </span>
              <span className="w-12 h-12 bg-white border border-border rounded-full shadow-lg flex items-center justify-center">
                <LordIcon src={ICONS.wallet} colors={COLOR_PRIMARY} size={22} />
              </span>
            </button>
            <button onClick={() => openNewNote('todo')} className="dial-item flex items-center gap-2">
              <span className="bg-white text-text-primary text-xs font-medium px-2.5 py-1 rounded-lg shadow">
                To-do list
              </span>
              <span className="w-12 h-12 bg-white border border-border rounded-full shadow-lg flex items-center justify-center">
                <LordIcon src={ICONS.list} colors={COLOR_PRIMARY} size={22} />
              </span>
            </button>
            <button onClick={() => openNewNote('text')} className="dial-item flex items-center gap-2">
              <span className="bg-white text-text-primary text-xs font-medium px-2.5 py-1 rounded-lg shadow">
                Tulisan
              </span>
              <span className="w-12 h-12 bg-white border border-border rounded-full shadow-lg flex items-center justify-center">
                <LordIcon src={ICONS.note} colors={COLOR_PRIMARY} size={22} />
              </span>
            </button>
          </>
        )}
        <button
          onClick={() => setDialOpen((v) => !v)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-[#EA6C0A] active:scale-95 transition-all"
          aria-label="Buat catatan"
        >
          <span className={`inline-flex transition-transform duration-200 ${dialOpen ? 'rotate-45' : ''}`}>
            <LordIcon src={ICONS.add} colors={COLOR_WHITE} size={30} />
          </span>
        </button>
      </div>

      {/* ── New Note Modal ── */}
      <Modal open={showNewNote} onClose={() => setShowNewNote(false)} className="p-5">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="font-bold text-text-primary">
            {newNoteType === 'todo'
              ? 'To-do List Baru'
              : newNoteType === 'finance'
                ? 'Catatan Keuangan'
                : 'Catatan Baru'}
          </h2>
          <button onClick={() => setShowNewNote(false)} className="text-text-secondary hover:text-text-primary">
            <LordIcon src={ICONS.close} colors={COLOR_MUTED} size={22} />
          </button>
        </div>
        <NoteForm
          key={`${newNoteType}-${showNewNote}`}
          categories={categories}
          noteType={newNoteType}
          onSubmit={handleCreateNote}
          onCreateCategory={handleCreateCategory}
          loading={noteFormLoading}
        />
      </Modal>

      {/* ── Edit Note Modal ── */}
      <Modal open={!!editingNote} onClose={() => setEditingNote(null)} className="p-5">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="font-bold text-text-primary">
            {editingNote?.type === 'todo'
              ? 'Edit To-do List'
              : editingNote?.type === 'finance'
                ? 'Edit Keuangan'
                : 'Edit Catatan'}
          </h2>
          <button onClick={() => setEditingNote(null)} className="text-text-secondary hover:text-text-primary">
            <LordIcon src={ICONS.close} colors={COLOR_MUTED} size={22} />
          </button>
        </div>
        {editingNote && (
          <NoteForm
            key={editingNote.id}
            categories={categories}
            initialData={{
              title: editingNote.title,
              note: editingNote.note,
              scheduledAt: editingNote.scheduledAt,
              categoryId: editingNote.categoryId,
              type: editingNote.type,
              items: editingNote.items ?? undefined,
            }}
            onSubmit={handleUpdateNote}
            onCreateCategory={handleCreateCategory}
            loading={noteFormLoading}
          />
        )}
      </Modal>
    </div>
  )
}
