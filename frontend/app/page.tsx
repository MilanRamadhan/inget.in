import Link from 'next/link'
import { LordIcon } from '../components/LordIcon'
import { ICONS } from '../lib/icons'
import { Logo } from '../components/Logo'

const FEATURES = [
  {
    src: ICONS.edit,
    colors: 'primary:#F97316,secondary:#EA6C0A',
    bg: '#FFF7ED',
    title: 'Catat Cepat',
    desc: 'Tulis catatan dalam hitungan detik tanpa ribet. Langsung aja!',
  },
  {
    src: ICONS.folder,
    colors: 'primary:#3B82F6,secondary:#1D4ED8',
    bg: '#EFF6FF',
    title: 'Terorganisir',
    desc: 'Atur catatan dengan kategori Kerja, Kuliah, dan Pribadi.',
  },
  {
    src: ICONS.check,
    colors: 'primary:#10B981,secondary:#059669',
    bg: '#F0FDF4',
    title: 'Tersimpan Aman',
    desc: 'Login untuk menyimpan catatan secara permanen di semua perangkat.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />
          <Link
            href="/login"
            className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 flex flex-col items-center text-center">
        {/* Hero icon — animated notepad */}
        <div className="mb-6">
          <LordIcon
            src={ICONS.note}
            trigger="loop"
            colors="primary:#F97316,secondary:#EA6C0A"
            size={80}
          />
        </div>

        <h1 className="text-3xl font-extrabold text-text-primary leading-tight mb-4">
          Ingetin kamu soal
          <br />
          <span className="text-primary">yang penting</span>
        </h1>

        <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-xs">
          Catat rencanamu berdasarkan waktu dan kategori. Simpel, cepat, dan selalu siap
          kapanpun kamu butuh.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3 rounded-chip text-sm hover:bg-[#EA6C0A] transition-all active:scale-95 shadow-md shadow-primary/30"
        >
          <LordIcon src={ICONS.edit} trigger="hover" colors="primary:#FFFFFF,secondary:#F3F4F6" size={20} />
          Mulai Catat
          <span className="material-icons text-base leading-none">arrow_forward</span>
        </Link>

        {/* Feature Cards */}
        <div className="mt-14 w-full grid grid-cols-1 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-card border border-border p-4 flex items-start gap-4 text-left"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: f.bg }}
              >
                <LordIcon src={f.src} trigger="hover" colors={f.colors} size={32} />
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-sm text-text-primary">{f.title}</h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-text-secondary border-t border-border">
        © 2026 inget.in — Semua hak dilindungi
      </footer>
    </div>
  )
}
