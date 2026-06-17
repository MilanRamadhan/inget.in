'use client'
import { Category } from '../types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string
  onChange: (id: string) => void
  /** vertical = sidebar list mode; default = horizontal scroll chips */
  vertical?: boolean
}

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Semua', color: '#F97316', icon: 'grid_view' },
  { id: 'kerja', name: 'Kerja', color: '#3B82F6', icon: 'work_outline' },
  { id: 'kuliah', name: 'Kuliah', color: '#8B5CF6', icon: 'school' },
  { id: 'pribadi', name: 'Pribadi', color: '#10B981', icon: 'person_outline' },
]

export function CategoryFilter({ categories, selected, onChange, vertical = false }: CategoryFilterProps) {
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...categories
      .filter((c) => !DEFAULT_CATEGORIES.map((d) => d.name.toLowerCase()).includes(c.name.toLowerCase()))
      .map((c) => ({ id: c.id, name: c.name, color: c.color, icon: 'label_outline' })),
  ]

  if (vertical) {
    return (
      <div className="flex flex-col gap-0.5">
        {allCategories.map((cat) => {
          const isSelected = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full
                ${isSelected
                  ? 'text-white shadow-sm'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                }
              `}
              style={isSelected ? { backgroundColor: cat.color } : {}}
            >
              <span className="material-icons text-[18px] leading-none flex-shrink-0">{cat.icon}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {allCategories.map((cat) => {
        const isSelected = selected === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-chip text-sm font-medium transition-all
              ${isSelected
                ? 'text-white shadow-sm'
                : 'text-text-secondary bg-gray-100 hover:bg-gray-200'
              }
            `}
            style={isSelected ? { backgroundColor: cat.color } : {}}
          >
            <span className="material-icons text-sm leading-none">{cat.icon}</span>
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
