'use client'

interface CategoryChipProps {
  name: string
  color?: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function CategoryChip({
  name,
  color = '#9CA3AF',
  selected,
  onClick,
  size = 'md',
}: CategoryChipProps) {
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-chip font-medium transition-all
        ${sizes[size]}
        ${
          selected
            ? 'text-white shadow-sm'
            : 'text-text-secondary bg-gray-100 hover:bg-gray-200'
        }
      `}
      style={selected ? { backgroundColor: color } : {}}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: selected ? 'rgba(255,255,255,0.7)' : color }}
      />
      {name}
    </button>
  )
}
