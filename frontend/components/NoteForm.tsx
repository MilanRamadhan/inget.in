'use client'

import { FormEvent, KeyboardEvent, useLayoutEffect, useRef, useState } from 'react'
import { Category, FinanceEntry, NoteType, TodoItem } from '../types'
import { Button } from './ui/Button'
import { CategoryChip } from './ui/CategoryChip'
import { getCategoryColor } from '../lib/utils'
import { LordIcon } from './LordIcon'
import { ICONS, COLOR_PRIMARY, COLOR_WHITE } from '../lib/icons'

type NotePayload = {
  title: string
  note: string
  scheduledAt: string
  categoryId: string
  type: NoteType
  items?: TodoItem[] | FinanceEntry[]
}

interface NoteFormProps {
  categories?: Category[]
  noteType?: NoteType
  initialData?: {
    title?: string
    note?: string
    scheduledAt?: string
    categoryId?: string
    type?: NoteType
    items?: TodoItem[] | FinanceEntry[]
  }
  onSubmit: (data: NotePayload) => Promise<void>
  onSaveClick?: () => void
  onCreateCategory?: (name: string, color: string) => Promise<Category | null>
  isGuest?: boolean
  loading?: boolean
}

const PRESET_CATEGORIES = [
  { id: 'kerja', name: 'Kerja', color: '#3B82F6' },
  { id: 'kuliah', name: 'Kuliah', color: '#8B5CF6' },
  { id: 'pribadi', name: 'Pribadi', color: '#10B981' },
]

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F97316',
  '#EF4444', '#F59E0B', '#EC4899', '#9CA3AF',
]

const makeTodo = (): TodoItem => ({ id: crypto.randomUUID(), text: '', done: false })
const makeFinance = (kind: FinanceEntry['kind'] = 'expense'): FinanceEntry => ({
  id: crypto.randomUUID(),
  description: '',
  amount: 0,
  kind,
})

function isFinanceEntry(item: TodoItem | FinanceEntry): item is FinanceEntry {
  return 'amount' in item
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function resizeTodoTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

export function NoteForm({
  categories = [],
  noteType,
  initialData,
  onSubmit,
  onSaveClick,
  onCreateCategory,
  isGuest,
  loading,
}: NoteFormProps) {
  const mode: NoteType = initialData?.type || noteType || 'text'
  const initialItems = initialData?.items || []
  const [title, setTitle] = useState(initialData?.title || '')
  const [note, setNote] = useState(initialData?.note || '')
  const [date, setDate] = useState(initialData?.scheduledAt?.split('T')[0] || '')
  const [time, setTime] = useState(
    initialData?.scheduledAt?.split('T')[1]?.replace(/[Z+.].*$/, '').slice(0, 5) || '',
  )
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '')
  const [todoItems, setTodoItems] = useState<TodoItem[]>(() => {
    const current =
      mode === 'todo'
        ? initialItems.filter((item): item is TodoItem => !isFinanceEntry(item))
        : []
    return current.length ? current : [makeTodo()]
  })
  const [financeItems, setFinanceItems] = useState<FinanceEntry[]>(() => {
    const current = mode === 'finance' ? initialItems.filter(isFinanceEntry) : []
    return current.length ? current : [makeFinance()]
  })
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#9CA3AF')
  const [newCatLoading, setNewCatLoading] = useState(false)
  const [localCats, setLocalCats] = useState<{ id: string; name: string; color: string }[]>([])
  const todoRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  useLayoutEffect(() => {
    Object.values(todoRefs.current).forEach(resizeTodoTextarea)
  }, [todoItems])

  const allCategories = [
    ...PRESET_CATEGORIES,
    ...categories.filter(
      (c) => !PRESET_CATEGORIES.some((p) => p.name.toLowerCase() === c.name.toLowerCase()),
    ),
    ...localCats,
  ]

  const resolveCategoryId = async (): Promise<string> => {
    if (!selectedCategory) return ''
    if (categories.some((c) => c.id === selectedCategory)) return selectedCategory
    const source =
      PRESET_CATEGORIES.find((c) => c.id === selectedCategory) ||
      localCats.find((c) => c.id === selectedCategory)
    if (!source) return selectedCategory
    const existing = categories.find(
      (c) => c.name.toLowerCase() === source.name.toLowerCase(),
    )
    if (existing) return existing.id
    return (await onCreateCategory?.(source.name, source.color))?.id || ''
  }

  const addTodoAfter = (index: number) => {
    const item = makeTodo()
    setTodoItems((current) => {
      const next = [...current]
      next.splice(index + 1, 0, item)
      return next
    })
    requestAnimationFrame(() => todoRefs.current[item.id]?.focus())
  }

  const handleTodoKey = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    item: TodoItem,
    index: number,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      addTodoAfter(index)
    } else if (event.key === 'Backspace' && !item.text && todoItems.length > 1) {
      event.preventDefault()
      setTodoItems((current) => current.filter((entry) => entry.id !== item.id))
      requestAnimationFrame(() => todoRefs.current[todoItems[Math.max(0, index - 1)].id]?.focus())
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    const scheduledAt = date
      ? `${date}T${time || '00:00'}:00.000Z`
      : ''
    const categoryId = isGuest ? selectedCategory : await resolveCategoryId()
    const items =
      mode === 'todo'
        ? todoItems
            .map((item) => ({ ...item, text: item.text.trim() }))
            .filter((item) => item.text)
        : mode === 'finance'
          ? financeItems
              .map((item) => ({ ...item, description: item.description.trim() }))
              .filter((item) => item.description && item.amount > 0)
          : undefined

    await onSubmit({
      title: title.trim(),
      note: note.trim(),
      scheduledAt,
      categoryId,
      type: mode,
      items,
    })
    if (isGuest && onSaveClick) onSaveClick()
  }

  const handleAddCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    setNewCatLoading(true)
    try {
      const created = await onCreateCategory?.(name, newCatColor)
      if (created) {
        setSelectedCategory(created.id)
      } else {
        const local = { id: `tmp-${Date.now()}`, name, color: newCatColor }
        setLocalCats((current) => [...current, local])
        setSelectedCategory(local.id)
      }
      setNewCatName('')
      setShowNewCat(false)
    } finally {
      setNewCatLoading(false)
    }
  }

  const income = financeItems
    .filter((item) => item.kind === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
  const expense = financeItems
    .filter((item) => item.kind === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase text-text-secondary">
          Judul
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={
            mode === 'todo'
              ? 'Contoh: Belanja bulanan'
              : mode === 'finance'
                ? 'Contoh: Pengeluaran Juli'
                : 'Judul catatan'
          }
          className="w-full border-0 border-b border-border bg-transparent px-0 pb-3 text-xl font-bold text-text-primary outline-none placeholder:font-medium placeholder:text-gray-300 focus:border-primary"
          required
        />
      </div>

      {mode === 'text' && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase text-text-secondary">
            Isi catatan
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={'Tulis apa saja...\n\nTekan Enter untuk membuat paragraf baru.'}
            rows={12}
            className="min-h-[42dvh] w-full resize-none rounded-input border border-border bg-white px-4 py-3 text-base leading-7 text-text-primary outline-none placeholder:text-text-secondary focus:border-transparent focus:ring-2 focus:ring-primary sm:min-h-[260px]"
          />
        </div>
      )}

      {mode === 'todo' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-text-secondary">Daftar</label>
            <span className="text-xs text-text-secondary">
              {todoItems.filter((item) => item.done).length}/{todoItems.length} selesai
            </span>
          </div>
          <div className="divide-y divide-border rounded-input border border-border bg-white px-3">
            {todoItems.map((item, index) => (
              <div key={item.id} className="flex min-h-12 items-start gap-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setTodoItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                      ),
                    )
                  }
                  className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border ${
                    item.done ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                  aria-label={item.done ? 'Tandai belum selesai' : 'Tandai selesai'}
                >
                  {item.done && <LordIcon src={ICONS.check} colors={COLOR_WHITE} size={15} />}
                </button>
                <textarea
                  ref={(element) => {
                    todoRefs.current[item.id] = element
                    resizeTodoTextarea(element)
                  }}
                  rows={1}
                  value={item.text}
                  onChange={(event) => {
                    resizeTodoTextarea(event.currentTarget)
                    setTodoItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id ? { ...entry, text: event.target.value } : entry,
                      ),
                    )
                  }}
                  onKeyDown={(event) => handleTodoKey(event, item, index)}
                  placeholder={index === 0 ? 'Ketik item, lalu tekan Enter' : 'Item berikutnya'}
                  className={`min-h-8 min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-1.5 text-sm leading-5 outline-none ${
                    item.done ? 'text-text-secondary line-through' : 'text-text-primary'
                  }`}
                />
                {todoItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTodoItems((current) => current.filter((entry) => entry.id !== item.id))
                    }
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-text-secondary"
                    aria-label="Hapus item"
                  >
                    <LordIcon src={ICONS.close} size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addTodoAfter(todoItems.length - 1)}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <LordIcon src={ICONS.add} colors={COLOR_PRIMARY} size={18} />
            Tambah item
          </button>
        </div>
      )}

      {mode === 'finance' && (
        <div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-input bg-emerald-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-emerald-700">Masuk</p>
              <p className="truncate text-xs font-bold text-emerald-700">{rupiah(income)}</p>
            </div>
            <div className="rounded-input bg-red-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-red-600">Keluar</p>
              <p className="truncate text-xs font-bold text-red-600">{rupiah(expense)}</p>
            </div>
            <div className="rounded-input bg-gray-100 p-2.5">
              <p className="text-[10px] font-semibold uppercase text-text-secondary">Saldo</p>
              <p className="truncate text-xs font-bold text-text-primary">{rupiah(income - expense)}</p>
            </div>
          </div>

          <div className="space-y-2">
            {financeItems.map((item) => (
              <div key={item.id} className="rounded-input border border-border bg-white p-3">
                <div className="mb-2 flex gap-2">
                  {(['expense', 'income'] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() =>
                        setFinanceItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, kind } : entry,
                          ),
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.kind === kind
                          ? kind === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-text-secondary'
                      }`}
                    >
                      {kind === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={item.description}
                    onChange={(event) =>
                      setFinanceItems((current) =>
                        current.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, description: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Keterangan"
                    className="min-w-0 flex-1 border-b border-border py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex w-32 items-center border-b border-border focus-within:border-primary">
                    <span className="text-xs text-text-secondary">Rp</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={item.amount || ''}
                      onChange={(event) =>
                        setFinanceItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, amount: Number(event.target.value) }
                              : entry,
                          ),
                        )
                      }
                      placeholder="0"
                      className="w-full py-2 text-right text-sm font-semibold outline-none"
                    />
                  </div>
                  {financeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFinanceItems((current) =>
                          current.filter((entry) => entry.id !== item.id),
                        )
                      }
                      className="text-text-secondary"
                      aria-label="Hapus transaksi"
                    >
                      <LordIcon src={ICONS.close} size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFinanceItems((current) => [...current, makeFinance()])}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <LordIcon src={ICONS.add} colors={COLOR_PRIMARY} size={18} />
            Tambah transaksi
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-light">
            <LordIcon src={ICONS.bell} colors={COLOR_PRIMARY} size={17} />
          </span>
          <div>
            <p className="text-sm font-bold text-text-primary">Pengingat</p>
            <p className="text-[11px] text-text-secondary">
              Atur tanggal dan jam agar catatan muncul sebagai pengingat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-text-secondary">
            Tanggal
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1.5 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="text-xs font-medium text-text-secondary">
            Jam
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1.5 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">Kategori</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allCategories.map((category) => (
            <CategoryChip
              key={category.id}
              name={category.name}
              color={category.color || getCategoryColor(category.name)}
              selected={selectedCategory === category.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === category.id ? '' : category.id)
              }
            />
          ))}
          {!showNewCat && (
            <button
              type="button"
              onClick={() => setShowNewCat(true)}
              className="flex-shrink-0 rounded-chip border border-dashed border-border px-3 py-1.5 text-sm text-text-secondary"
            >
              + Kategori
            </button>
          )}
        </div>

        {showNewCat && (
          <div className="mt-3 space-y-3 rounded-input border border-border bg-gray-50 p-3">
            <input
              autoFocus
              value={newCatName}
              onChange={(event) => setNewCatName(event.target.value)}
              placeholder="Nama kategori"
              className="w-full rounded-input border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={`h-7 w-7 rounded-full ${newCatColor === color ? 'ring-2 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color, color }}
                  aria-label={`Pilih warna ${color}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCatName.trim() || newCatLoading}
                className="flex-1 rounded-chip bg-primary py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {newCatLoading ? 'Menyimpan...' : 'Tambah'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewCat(false)}
                className="rounded-chip border border-border px-4 text-sm text-text-secondary"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 border-t border-border bg-white/95 px-5 pb-1 pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:p-0">
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {!loading && <LordIcon src={ICONS.save} colors={COLOR_WHITE} size={21} />}
          Simpan
        </Button>
      </div>
    </form>
  )
}
