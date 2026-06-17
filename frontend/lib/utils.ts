export function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return ''
  const part = dateStr.split('T')[0]
  const [year, month, day] = part.split('-')
  return `${day}/${month}/${year}`
}

export function formatTime(dateStr?: string): string {
  if (!dateStr) return ''
  const timePart = dateStr.split('T')[1]
  if (!timePart) return ''
  // Strip timezone suffix (Z, .000Z, +07:00, etc.) and take HH:MM
  const hhmm = timePart.replace(/[Z+.].*$/, '').slice(0, 5)
  return hhmm === '00:00' ? '' : hhmm
}

export function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return 'Tanpa jadwal'
  // Parse date part directly to avoid timezone conversion issues
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)
  const noteDate = new Date(year, month - 1, day)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (noteDate.getTime() === today.getTime()) return 'Hari ini'
  if (noteDate.getTime() === tomorrow.getTime()) return 'Besok'

  return noteDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function groupNotesByDate(notes: import('../types').Note[]) {
  const groups: Record<string, import('../types').Note[]> = {}
  for (const note of notes) {
    const label = formatDateLabel(note.scheduledAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(note)
  }
  return groups
}

export function savePendingNote(note: import('../types').PendingNote) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingNote', JSON.stringify(note))
  }
}

export function getPendingNote(): import('../types').PendingNote | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('pendingNote')
  return raw ? JSON.parse(raw) : null
}

export function clearPendingNote() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pendingNote')
  }
}

export function getCategoryColor(name: string): string {
  const lower = name.toLowerCase()
  if (lower === 'kerja') return '#3B82F6'
  if (lower === 'kuliah') return '#8B5CF6'
  if (lower === 'pribadi') return '#10B981'
  return '#9CA3AF'
}

/** Returns a soft pastel version of the given hex color (15% color + 85% white). */
export function getCategoryPastel(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const blend = (c: number) => Math.round(c * 0.18 + 255 * 0.82)
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`
}
