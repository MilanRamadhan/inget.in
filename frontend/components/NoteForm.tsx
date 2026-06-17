'use client'
import { useState, FormEvent } from 'react'
import { Category } from '../types'
import { Button } from './ui/Button'
import { CategoryChip } from './ui/CategoryChip'
import { getCategoryColor } from '../lib/utils'
import { LordIcon } from './LordIcon'
import { ICONS, COLOR_PRIMARY, COLOR_WHITE } from '../lib/icons'

interface NoteFormProps {
  categories?: Category[]
  initialData?: {
    title?: string
    note?: string
    scheduledAt?: string
    categoryId?: string
  }
  onSubmit: (data: {
    title: string
    note: string
    scheduledAt: string
    categoryId: string
  }) => Promise<void>
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

export function NoteForm({
  categories = [],
  initialData,
  onSubmit,
  onSaveClick,
  onCreateCategory,
  isGuest,
  loading,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [note, setNote] = useState(initialData?.note || '')
  const [date, setDate] = useState(
    initialData?.scheduledAt ? initialData.scheduledAt.split('T')[0] : '',
  )
  const [time, setTime] = useState(
    initialData?.scheduledAt ? initialData.scheduledAt.split('T')[1]?.replace(/[Z+.].*$/, '').slice(0, 5) : '',
  )
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '')

  // Inline new-category state
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#9CA3AF')
  const [newCatLoading, setNewCatLoading] = useState(false)
  // Local-only categories (created by guest or before DB save)
  const [localCats, setLocalCats] = useState<{ id: string; name: string; color: string }[]>([])

  const allCategories = [
    ...PRESET_CATEGORIES,
    ...categories.filter(
      (c) => !PRESET_CATEGORIES.map((p) => p.name.toLowerCase()).includes(c.name.toLowerCase()),
    ),
    ...localCats,
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let scheduledAt = ''
    if (date && time) {
      scheduledAt = `${date}T${time}:00.000Z`
    } else if (date) {
      scheduledAt = `${date}T00:00:00.000Z`
    }

    if (isGuest && onSaveClick) {
      await onSubmit({ title, note, scheduledAt, categoryId: selectedCategory })
      onSaveClick()
      return
    }

    await onSubmit({ title, note, scheduledAt, categoryId: selectedCategory })
  }

  const handleAddCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    setNewCatLoading(true)
    try {
      if (onCreateCategory) {
        const created = await onCreateCategory(name, newCatColor)
        if (created) {
          setSelectedCategory(created.id)
        } else {
          // Fallback to local if API failed
          const tmp = { id: `tmp-${Date.now()}`, name, color: newCatColor }
          setLocalCats((prev) => [...prev, tmp])
          setSelectedCategory(tmp.id)
        }
      } else {
        const tmp = { id: `tmp-${Date.now()}`, name, color: newCatColor }
        setLocalCats((prev) => [...prev, tmp])
        setSelectedCategory(tmp.id)
      }
      setNewCatName('')
      setShowNewCat(false)
    } finally {
      setNewCatLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-1.5">
          <span className="material-icons text-base leading-none text-primary">edit_note</span>
          Tulis catatanmu
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul catatan..."
          className="w-full rounded-input border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold"
          required
        />
      </div>

      {/* Description */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Tambah deskripsi (opsional)..."
        rows={3}
        className="w-full rounded-input border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
      />

      {/* Date & Time */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
            <span className="material-icons text-sm leading-none">calendar_today</span>
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
            <span className="material-icons text-sm leading-none">schedule</span>
            Jam
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Category chips */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
          <span className="material-icons text-sm leading-none">label</span>
          Kategori
        </label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              name={cat.name}
              color={cat.color || getCategoryColor(cat.name)}
              selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
            />
          ))}

          {!showNewCat && (
            <button
              type="button"
              onClick={() => setShowNewCat(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-chip text-sm text-text-secondary border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
            >
              <LordIcon src={ICONS.add} trigger="hover" colors="primary:#6B7280,secondary:#9CA3AF" size={18} />
              Kategori baru
            </button>
          )}
        </div>

        {/* Inline category creator */}
        {showNewCat && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-border space-y-3">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() }
                if (e.key === 'Escape') setShowNewCat(false)
              }}
              placeholder="Nama kategori..."
              className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {/* Color swatches */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-secondary">Warna:</span>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCatColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110 ring-offset-1"
                  style={{
                    backgroundColor: c,
                    boxShadow: newCatColor === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : undefined,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCatName.trim() || newCatLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary text-white text-sm font-medium rounded-chip hover:bg-[#EA6C0A] disabled:opacity-50 transition-colors"
              >
                {newCatLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LordIcon src={ICONS.add} trigger="hover" colors={COLOR_WHITE} size={18} />
                )}
                Tambah
              </button>
              <button
                type="button"
                onClick={() => { setShowNewCat(false); setNewCatName('') }}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border rounded-chip transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {!loading && (
          <LordIcon src={ICONS.save} trigger="hover" colors={COLOR_WHITE} size={22} />
        )}
        Simpan Catatan
      </Button>
    </form>
  )
}
