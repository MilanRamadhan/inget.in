// Icon keys consumed by <LordIcon src={ICONS.x} />. These map to local
// lucide-react components inside LordIcon — bundled in the app, so no remote
// CDN and no chance of a 404 (the old Lordicon CDN ids were unreliable).
export const ICONS = {
  // Actions
  edit: 'edit',
  delete: 'delete',
  check: 'check',
  add: 'add',
  save: 'save',
  search: 'search',
  logout: 'logout',

  // UI / navigation
  user: 'user',
  home: 'home',
  settings: 'settings',
  bell: 'bell',

  // Content
  note: 'note',
  list: 'list',
  folder: 'folder',
  calendar: 'calendar',
  clock: 'clock',
  tag: 'tag',

  // Landing features
  lightning: 'lightning',
  lock: 'lock',
  star: 'star',
} as const

export type IconKey = (typeof ICONS)[keyof typeof ICONS]

/** Colors are kept in the original "primary:#hex,secondary:#hex" format;
 *  LordIcon parses the primary hex. */
export const COLOR_PRIMARY = 'primary:#F97316,secondary:#EA6C0A'
export const COLOR_BLUE = 'primary:#3B82F6,secondary:#1D4ED8'
export const COLOR_PURPLE = 'primary:#8B5CF6,secondary:#6D28D9'
export const COLOR_GREEN = 'primary:#10B981,secondary:#059669'
export const COLOR_DANGER = 'primary:#EF4444,secondary:#DC2626'
export const COLOR_MUTED = 'primary:#6B7280,secondary:#9CA3AF'
export const COLOR_WHITE = 'primary:#FFFFFF,secondary:#F3F4F6'
