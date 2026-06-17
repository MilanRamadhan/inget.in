'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '../../hooks/useAuth'
import { useNotes } from '../../hooks/useNotes'
import { categoriesApi } from '../../lib/api'
import { Category, Note } from '../../types'
import { NoteCard } from '../../components/NoteCard'
import { NoteForm } from '../../components/NoteForm'
import { CategoryFilter } from '../../components/CategoryFilter'
import { SaveModal } from '../../components/SaveModal'
import { Modal } from '../../components/ui/Modal'
import { groupNotesByDate, savePendingNote } from '../../lib/utils'
import { LordIcon } from '../../components/LordIcon'
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
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteFormLoading, setNoteFormLoading] = useState(false)

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
            <span className="text-lg font-bold text-primary tracking-tight">inget.in</span>
            <div className="flex items-center gap-2">
              <span className="material-icons text-text-secondary text-lg">cloud_off</span>
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
            <span className="material-icons text-primary text-base leading-5 flex-shrink-0 mt-0.5">info</span>
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
  const grouped = groupNotesByDate(notes)
  const totalNotes = notes.length
  const doneNotes = notes.filter((n) => n.isDone).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-primary tracking-tight">inget.in</span>
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

            {/* New note button in sidebar */}
            <button
              onClick={() => setShowNewNote(true)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-chip hover:bg-[#EA6C0A] active:scale-95 transition-all shadow-md shadow-primary/30"
            >
              <LordIcon src={ICONS.edit} trigger="hover" colors={COLOR_WHITE} size={22} />
              Catatan Baru
            </button>
          </aside>

          {/* ── MAIN COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile greeting */}
            <div className="lg:hidden mb-5">
              <p className="text-xs text-text-secondary">{todayFull}</p>
              <h1 className="text-xl font-bold text-text-primary mt-1">
                Hei, {user.name.split(' ')[0]}
                <span className="ml-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                  <span className="material-icons text-sm leading-none text-primary">waving_hand</span>
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
                    <span className="material-icons text-sm leading-none text-primary">waving_hand</span>
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
                <p className="text-sm text-text-secondary mb-4">Tambah catatan pertamamu!</p>
                <button
                  onClick={() => setShowNewNote(true)}
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-chip hover:bg-[#EA6C0A] transition-all"
                >
                  <LordIcon src={ICONS.add} trigger="hover" colors={COLOR_WHITE} size={20} />
                  Catatan Baru
                </button>
              </div>
            ) : (
              <div className="space-y-7">
                {Object.entries(grouped).map(([date, dateNotes]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {date}
                      </h2>
                      <span className="text-xs bg-gray-200 text-text-secondary px-1.5 py-0.5 rounded-full font-medium">
                        {dateNotes.length}
                      </span>
                    </div>
                    {/* Sticky-note grid: 1 col → 2 col → 3 col */}
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-3 gap-3">
                      {dateNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onToggleDone={toggleDone}
                          onEdit={setEditingNote}
                          onDelete={deleteNote}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FAB (mobile only) ── */}
      <button
        onClick={() => setShowNewNote(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-[#EA6C0A] active:scale-95 transition-all z-30"
        aria-label="Catatan Baru"
      >
        <LordIcon src={ICONS.edit} trigger="hover" colors={COLOR_WHITE} size={30} />
      </button>

      {/* ── New Note Modal ── */}
      <Modal open={showNewNote} onClose={() => setShowNewNote(false)} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-text-primary">Catatan Baru</h2>
          <button onClick={() => setShowNewNote(false)} className="text-text-secondary hover:text-text-primary">
            <span className="material-icons">close</span>
          </button>
        </div>
        <NoteForm
          categories={categories}
          onSubmit={handleCreateNote}
          onCreateCategory={handleCreateCategory}
          loading={noteFormLoading}
        />
      </Modal>

      {/* ── Edit Note Modal ── */}
      <Modal open={!!editingNote} onClose={() => setEditingNote(null)} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-text-primary">Edit Catatan</h2>
          <button onClick={() => setEditingNote(null)} className="text-text-secondary hover:text-text-primary">
            <span className="material-icons">close</span>
          </button>
        </div>
        {editingNote && (
          <NoteForm
            categories={categories}
            initialData={{
              title: editingNote.title,
              note: editingNote.note,
              scheduledAt: editingNote.scheduledAt,
              categoryId: editingNote.categoryId,
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
