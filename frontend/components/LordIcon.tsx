'use client'
import {
  Pencil,
  Trash2,
  Check,
  Plus,
  Save,
  Search,
  LogOut,
  User,
  Home,
  Settings,
  Bell,
  NotebookPen,
  ListTodo,
  Folder,
  Calendar,
  Clock,
  Tag,
  Zap,
  Lock,
  Star,
  type LucideIcon,
} from 'lucide-react'

// Map of icon keys (from lib/icons.ts) to local lucide-react components.
const REGISTRY: Record<string, LucideIcon> = {
  edit: Pencil,
  delete: Trash2,
  check: Check,
  add: Plus,
  save: Save,
  search: Search,
  logout: LogOut,
  user: User,
  home: Home,
  settings: Settings,
  bell: Bell,
  note: NotebookPen,
  list: ListTodo,
  folder: Folder,
  calendar: Calendar,
  clock: Clock,
  tag: Tag,
  lightning: Zap,
  lock: Lock,
  star: Star,
}

// Pull the "primary" hex out of "primary:#F97316,secondary:#EA6C0A".
function primaryColor(colors?: string): string {
  if (!colors) return 'currentColor'
  const m = colors.match(/primary:(#[0-9a-fA-F]{3,8})/)
  return m ? m[1] : 'currentColor'
}

interface LordIconProps {
  src?: string // icon key, e.g. ICONS.edit
  trigger?: string // accepted for API compatibility (unused now)
  colors?: string
  stroke?: string
  state?: string
  target?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

// Drop-in replacement for the old Lordicon web-component wrapper. Renders a
// local lucide icon with a subtle hover animation — no network, never 404s.
export function LordIcon({ src, colors, size = 28, className, style }: LordIconProps) {
  const Icon = (src && REGISTRY[src]) || Pencil
  return (
    <Icon
      size={size}
      color={primaryColor(colors)}
      strokeWidth={2}
      className={`app-icon ${className ?? ''}`}
      style={style}
      aria-hidden
    />
  )
}
