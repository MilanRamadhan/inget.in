'use client'
import Link from 'next/link'
import Image from 'next/image'
import { User } from '../types'
import { Button } from './ui/Button'

interface NavbarProps {
  user?: User | null
  onLogout?: () => void
  variant?: 'landing' | 'dashboard'
}

export function Navbar({ user, onLogout, variant = 'landing' }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary tracking-tight">
          inget.in
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-sm text-text-secondary hover:text-danger transition-colors"
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-icons text-text-secondary text-lg">cloud</span>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login / Daftar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
