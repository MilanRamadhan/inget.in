'use client'

import { useState } from 'react'
import { Category } from '../types'
import { LordIcon } from './LordIcon'
import {
  COLOR_DANGER,
  COLOR_MUTED,
  COLOR_PRIMARY,
  ICONS,
} from '../lib/icons'

interface CategoryManagerProps {
  categories: Category[]
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DEFAULT_NAMES = new Set(['kerja', 'kuliah', 'pribadi'])

export function CategoryManager({
  categories,
  onClose,
  onDelete,
}: CategoryManagerProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const customCategories = categories.filter(
    (category) => !DEFAULT_NAMES.has(category.name.toLowerCase()),
  )

  const handleDelete = async (category: Category) => {
    setDeletingId(category.id)
    setError('')
    try {
      await onDelete(category.id)
      setConfirmingId(null)
    } catch {
      setError(`Kategori "${category.name}" gagal dihapus. Coba lagi.`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex min-h-full flex-col sm:min-h-0">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <LordIcon src={ICONS.settings} colors={COLOR_PRIMARY} size={20} />
          <span className="text-sm font-bold text-text-primary">Kelola kategori</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-background"
          aria-label="Tutup pengelolaan kategori"
        >
          <LordIcon src={ICONS.close} colors={COLOR_MUTED} size={21} />
        </button>
      </header>

      <div className="flex-1 px-5 py-5">
        <div className="mb-6 flex items-start gap-3 rounded-card bg-primary-light px-4 py-3">
          <LordIcon
            src={ICONS.info}
            colors={COLOR_PRIMARY}
            size={18}
            className="mt-0.5 flex-shrink-0"
          />
          <p className="text-xs leading-5 text-text-secondary">
            Menghapus kategori tidak menghapus catatan. Catatan terkait akan tetap tersimpan
            tanpa kategori.
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">
            Kategori bawaan
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Kerja', color: '#3B82F6' },
              { name: 'Kuliah', color: '#8B5CF6' },
              { name: 'Pribadi', color: '#10B981' },
            ].map((category) => (
              <span
                key={category.name}
                className="inline-flex items-center gap-2 rounded-chip bg-gray-100 px-3 py-2 text-xs font-semibold text-text-secondary"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <LordIcon src={ICONS.lock} colors={COLOR_MUTED} size={13} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-text-secondary">
              Kategori buatanmu
            </p>
            <span className="text-xs text-text-secondary">{customCategories.length}</span>
          </div>

          {customCategories.length > 0 ? (
            <div className="divide-y divide-border border-y border-border">
              {customCategories.map((category) => (
                <div key={category.id} className="py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
                      {category.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmingId((current) =>
                          current === category.id ? null : category.id,
                        )
                      }
                      disabled={deletingId === category.id}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-danger hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Hapus kategori ${category.name}`}
                    >
                      <LordIcon src={ICONS.delete} colors={COLOR_DANGER} size={18} />
                    </button>
                  </div>

                  {confirmingId === category.id && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-input bg-red-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-red-700">Hapus kategori ini?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="rounded-chip px-3 py-1.5 text-xs font-semibold text-text-secondary"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                          className="rounded-chip bg-danger px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {deletingId === category.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm font-semibold text-text-primary">
                Belum ada kategori buatan
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Kategori yang kamu tambahkan akan muncul di sini.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-input bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-border bg-white/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 w-full rounded-chip bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Selesai
        </button>
      </footer>
    </div>
  )
}
