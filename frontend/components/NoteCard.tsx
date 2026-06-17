'use client'
import { useState, useRef, useEffect } from 'react'
import { Note } from '../types'
import { formatTime, formatShortDate, getCategoryPastel } from '../lib/utils'
import { LordIcon } from './LordIcon'
import { ICONS, COLOR_DANGER, COLOR_MUTED } from '../lib/icons'

interface NoteCardProps {
  note: Note
  onToggleDone: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, onToggleDone, onEdit, onDelete }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const color = note.category?.color || '#9CA3AF'
  const bg = getCategoryPastel(color)
  const time = formatTime(note.scheduledAt)
  const dateStr = note.scheduledAt ? formatShortDate(note.scheduledAt) : null

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  return (
    <div
      className="note-card relative rounded-[12px] p-4 flex flex-col min-h-[152px] cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
      style={{ backgroundColor: bg }}
      onClick={() => onEdit(note)}
    >
      {/* Top row: status toggle + three-dot menu */}
      <div className="flex items-center justify-between mb-3">
        {/* Done toggle — Lordicon triggers on ".note-card" hover */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleDone(note.id) }}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: note.isDone ? color : `${color}28` }}
          aria-label={note.isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          <LordIcon
            src={ICONS.check}
            trigger="hover"
            target=".note-card"
            colors={note.isDone ? 'primary:#ffffff,secondary:#f3f4f6' : `primary:${color},secondary:${color}`}
            size={20}
          />
        </button>

        {/* Three-dot menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="w-7 h-7 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-black/10 transition-all"
            aria-label="Opsi"
          >
            <span className="material-icons text-base leading-none" style={{ color }}>
              more_horiz
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-border py-1.5 min-w-[140px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { onEdit(note); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
              >
                <LordIcon src={ICONS.edit} trigger="hover" colors={COLOR_MUTED} size={20} />
                Edit catatan
              </button>
              <button
                onClick={() => { onDelete(note.id); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                <LordIcon src={ICONS.delete} trigger="hover" colors={COLOR_DANGER} size={20} />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {note.note && (
        <p className="text-xs leading-relaxed text-text-secondary line-clamp-2 flex-1 mb-2">
          {note.note}
        </p>
      )}

      {/* Bottom: title + date/time + category */}
      <div className="mt-auto">
        <h3
          className={`font-bold text-sm text-text-primary leading-snug ${
            note.isDone ? 'line-through opacity-40' : ''
          }`}
        >
          {note.title}
        </h3>

        {(dateStr || time) && (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-icons text-[11px] leading-none text-text-secondary">
              {time ? 'schedule' : 'calendar_today'}
            </span>
            <span className="text-[11px] text-text-secondary">
              {dateStr}
              {time && ` · ${time}`}
            </span>
          </div>
        )}

        {note.category && (
          <span
            className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {note.category.name}
          </span>
        )}
      </div>
    </div>
  )
}
