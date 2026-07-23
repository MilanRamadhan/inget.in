'use client'

import { useEffect, useRef, useState } from 'react'
import { FinanceEntry, Note, TodoItem } from '../types'
import { formatShortDate, formatTime, getCategoryPastel } from '../lib/utils'
import { LordIcon } from './LordIcon'
import { ICONS, COLOR_DANGER, COLOR_MUTED } from '../lib/icons'

interface NoteCardProps {
  note: Note
  onToggleDone: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleItem?: (noteId: string, itemId: string) => void
}

function isFinanceEntry(item: TodoItem | FinanceEntry): item is FinanceEntry {
  return 'amount' in item
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function NoteCard({
  note,
  onToggleDone,
  onEdit,
  onDelete,
  onToggleItem,
}: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const color = note.category?.color || '#9CA3AF'
  const background = getCategoryPastel(color)
  const time = formatTime(note.scheduledAt)
  const date = note.scheduledAt ? formatShortDate(note.scheduledAt) : ''
  const rawItems = Array.isArray(note.items) ? note.items : []
  const todoItems =
    note.type === 'todo'
      ? rawItems.filter((item): item is TodoItem => !isFinanceEntry(item))
      : []
  const financeItems =
    note.type === 'finance' ? rawItems.filter(isFinanceEntry) : []
  const doneCount = todoItems.filter((item) => item.done).length
  const income = financeItems
    .filter((item) => item.kind === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
  const expense = financeItems
    .filter((item) => item.kind === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <article
      className="note-card relative cursor-pointer break-inside-avoid rounded-card p-3 transition-transform active:scale-[0.98] sm:p-4"
      style={{ backgroundColor: background }}
      onClick={() => onEdit(note)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <LordIcon
              src={
                note.type === 'todo'
                  ? ICONS.list
                  : note.type === 'finance'
                    ? ICONS.wallet
                    : ICONS.note
              }
              colors={`primary:${color},secondary:${color}`}
              size={15}
            />
            <span className="text-[10px] font-semibold uppercase text-text-secondary">
              {note.type === 'todo'
                ? 'Daftar'
                : note.type === 'finance'
                  ? 'Keuangan'
                  : 'Catatan'}
            </span>
          </div>
          <h3
            className={`line-clamp-2 text-sm font-bold leading-snug text-text-primary ${
              note.isDone ? 'line-through opacity-50' : ''
            }`}
          >
            {note.title}
          </h3>
        </div>

        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((current) => !current)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-black/5"
            aria-label="Opsi catatan"
          >
            <LordIcon src={ICONS.more} colors={COLOR_MUTED} size={17} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-20 min-w-[136px] rounded-card border border-border bg-white py-1 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onEdit(note)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-primary"
              >
                <LordIcon src={ICONS.edit} colors={COLOR_MUTED} size={17} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(note.id)
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger"
              >
                <LordIcon src={ICONS.delete} colors={COLOR_DANGER} size={17} />
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      {note.type === 'todo' && (
        <div className="mb-2 space-y-1.5">
          {todoItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleItem?.(note.id, item.id)
              }}
              className="flex w-full items-start gap-1.5 text-left"
            >
              <span
                className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border"
                style={{
                  borderColor: item.done ? color : '#9CA3AF',
                  backgroundColor: item.done ? color : 'rgba(255,255,255,.65)',
                }}
              >
                {item.done && <LordIcon src={ICONS.check} colors="primary:#fff" size={10} />}
              </span>
              <span
                className={`line-clamp-2 text-[11px] leading-4 ${
                  item.done ? 'text-text-secondary line-through' : 'text-text-primary'
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
          {todoItems.length > 3 && (
            <p className="pl-5 text-[10px] text-text-secondary">+{todoItems.length - 3} item</p>
          )}
          <div className="h-1 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${todoItems.length ? (doneCount / todoItems.length) * 100 : 0}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <p className="text-[10px] text-text-secondary">{doneCount}/{todoItems.length} selesai</p>
        </div>
      )}

      {note.type === 'finance' && (
        <div className="mb-2 space-y-1.5">
          <div className="rounded-input bg-white/60 p-2">
            <p className="text-[10px] text-text-secondary">Saldo</p>
            <p className={`truncate text-sm font-bold ${income - expense >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {rupiah(income - expense)}
            </p>
          </div>
          <div className="flex gap-2 text-[10px]">
            <span className="truncate text-emerald-700">+ {rupiah(income)}</span>
            <span className="truncate text-red-600">- {rupiah(expense)}</span>
          </div>
        </div>
      )}

      {(note.type === 'text' || !note.type) && note.note && (
        <p className="mb-2 whitespace-pre-line text-xs leading-5 text-text-secondary line-clamp-4">
          {note.note}
        </p>
      )}

      <footer className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/5 pt-2">
        {(date || time) && (
          <span className="text-[10px] text-text-secondary">
            {date}{time ? ` · ${time}` : ''}
          </span>
        )}
        {note.category && (
          <span className="max-w-full truncate rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold" style={{ color }}>
            {note.category.name}
          </span>
        )}
        {note.type !== 'finance' && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleDone(note.id)
            }}
            className="ml-auto text-[10px] font-semibold text-text-secondary"
          >
            {note.isDone ? 'Buka lagi' : 'Selesai'}
          </button>
        )}
      </footer>
    </article>
  )
}
