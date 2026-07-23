'use client'

import { useState } from 'react'
import { FinanceEntry, Note, TodoItem } from '../types'
import { formatDate, formatTime, getCategoryPastel } from '../lib/utils'
import { LordIcon } from './LordIcon'
import {
  COLOR_DANGER,
  COLOR_GREEN,
  COLOR_MUTED,
  COLOR_PRIMARY,
  COLOR_WHITE,
  ICONS,
} from '../lib/icons'

interface NoteDetailProps {
  note: Note
  onClose: () => void
  onEdit: (note: Note) => void
  onToggleDone: (id: string) => Promise<unknown>
  onToggleItem: (noteId: string, itemId: string) => Promise<void>
}

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

function formatActivity(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NoteDetail({
  note,
  onClose,
  onEdit,
  onToggleDone,
  onToggleItem,
}: NoteDetailProps) {
  const [pendingItem, setPendingItem] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const color = note.category?.color || '#9CA3AF'
  const background = getCategoryPastel(color)
  const rawItems = Array.isArray(note.items) ? note.items : []
  const todoItems =
    note.type === 'todo'
      ? rawItems.filter((item): item is TodoItem => !isFinanceEntry(item))
      : []
  const financeItems = note.type === 'finance' ? rawItems.filter(isFinanceEntry) : []
  const income = financeItems
    .filter((item) => item.kind === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
  const expense = financeItems
    .filter((item) => item.kind === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
  const typeLabel =
    note.type === 'todo' ? 'To-do list' : note.type === 'finance' ? 'Keuangan' : 'Catatan'
  const typeIcon =
    note.type === 'todo' ? ICONS.list : note.type === 'finance' ? ICONS.wallet : ICONS.note

  const handleToggleItem = async (itemId: string) => {
    setPendingItem(itemId)
    try {
      await onToggleItem(note.id, itemId)
    } finally {
      setPendingItem(null)
    }
  }

  const handleToggleDone = async () => {
    setStatusLoading(true)
    try {
      await onToggleDone(note.id)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col sm:min-h-0">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <LordIcon src={typeIcon} colors={`primary:${color},secondary:${color}`} size={20} />
          <span className="text-sm font-bold text-text-primary">Detail catatan</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-background"
          aria-label="Tutup detail"
        >
          <LordIcon src={ICONS.close} colors={COLOR_MUTED} size={21} />
        </button>
      </header>

      <div className="flex-1 px-5 py-5">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-chip px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: background, color }}
          >
            {typeLabel}
          </span>
          {note.category && (
            <span
              className="rounded-chip border px-2.5 py-1 text-[11px] font-semibold"
              style={{ borderColor: `${color}40`, color }}
            >
              {note.category.name}
            </span>
          )}
          {note.isDone && (
            <span className="rounded-chip bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Selesai
            </span>
          )}
        </div>

        <h1
          className={`mb-4 text-2xl font-bold leading-tight text-text-primary ${
            note.isDone ? 'line-through opacity-60' : ''
          }`}
        >
          {note.title}
        </h1>

        {note.scheduledAt && (
          <div className="mb-6 flex items-center gap-3 rounded-card bg-primary-light px-4 py-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white">
              <LordIcon src={ICONS.bell} colors={COLOR_PRIMARY} size={18} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase text-primary">Pengingat</p>
              <p className="text-sm font-semibold text-text-primary">
                {formatDate(note.scheduledAt)}
                {formatTime(note.scheduledAt) ? `, ${formatTime(note.scheduledAt)}` : ''}
              </p>
            </div>
          </div>
        )}

        {(note.type === 'text' || !note.type) && (
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-text-primary">
            {note.note || <span className="text-text-secondary">Tidak ada isi catatan.</span>}
          </div>
        )}

        {note.type === 'todo' && (
          <div className="space-y-2">
            {todoItems.length > 0 ? (
              todoItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  disabled={pendingItem === item.id}
                  className="flex w-full items-start gap-3 rounded-input border border-border px-3 py-3 text-left transition-colors hover:border-primary/40 disabled:opacity-60"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border"
                    style={{
                      borderColor: item.done ? color : '#9CA3AF',
                      backgroundColor: item.done ? color : '#FFFFFF',
                    }}
                  >
                    {item.done && (
                      <LordIcon src={ICONS.check} colors={COLOR_WHITE} size={13} />
                    )}
                  </span>
                  <span
                    className={`text-sm leading-5 ${
                      item.done ? 'text-text-secondary line-through' : 'text-text-primary'
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-text-secondary">Belum ada item dalam daftar ini.</p>
            )}
          </div>
        )}

        {note.type === 'finance' && (
          <div>
            <div className="mb-5 grid grid-cols-3 gap-2">
              <div className="col-span-3 rounded-card bg-background p-3">
                <p className="text-[11px] text-text-secondary">Saldo</p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    income - expense >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {rupiah(income - expense)}
                </p>
              </div>
              <div className="rounded-card bg-emerald-50 p-3">
                <p className="text-[10px] text-emerald-700">Masuk</p>
                <p className="mt-1 truncate text-xs font-bold text-emerald-700">
                  {rupiah(income)}
                </p>
              </div>
              <div className="col-span-2 rounded-card bg-red-50 p-3">
                <p className="text-[10px] text-red-600">Keluar</p>
                <p className="mt-1 truncate text-xs font-bold text-red-600">
                  {rupiah(expense)}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {financeItems.length > 0 ? (
                financeItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LordIcon
                        src={item.kind === 'income' ? ICONS.income : ICONS.expense}
                        colors={item.kind === 'income' ? COLOR_GREEN : COLOR_DANGER}
                        size={18}
                      />
                      <span className="truncate text-sm text-text-primary">
                        {item.description}
                      </span>
                    </div>
                    <span
                      className={`flex-shrink-0 text-sm font-semibold ${
                        item.kind === 'income' ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {item.kind === 'income' ? '+' : '-'} {rupiah(item.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary">Belum ada transaksi.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-4 text-[11px] leading-5 text-text-secondary">
          <p>Dibuat {formatActivity(note.createdAt)}</p>
          <p>Terakhir diubah {formatActivity(note.updatedAt)}</p>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 flex gap-2 border-t border-border bg-white/95 px-5 py-4 backdrop-blur">
        {note.type !== 'finance' && (
          <button
            type="button"
            onClick={handleToggleDone}
            disabled={statusLoading}
            className="flex min-h-11 flex-1 items-center justify-center rounded-chip border border-border px-4 text-sm font-semibold text-text-secondary disabled:opacity-60"
          >
            {statusLoading ? 'Memproses...' : note.isDone ? 'Buka lagi' : 'Tandai selesai'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(note)}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-chip bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <LordIcon src={ICONS.edit} colors={COLOR_WHITE} size={18} />
          Edit
        </button>
      </footer>
    </div>
  )
}
