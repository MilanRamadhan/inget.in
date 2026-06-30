import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'inget.in — Catatan Cepat Berbasis Waktu',
  description: 'Catat rencanamu berdasarkan waktu dan kategori. Simpel, cepat, dan selalu siap kapanpun kamu butuh.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
