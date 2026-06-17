import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA6C0A',
          light: '#FFF7ED',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        border: '#E5E7EB',
        success: '#10B981',
        danger: '#EF4444',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        category: {
          kerja: '#3B82F6',
          kuliah: '#8B5CF6',
          pribadi: '#10B981',
          default: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '999px',
        input: '8px',
        modal: '16px',
      },
    },
  },
  plugins: [],
}
export default config
