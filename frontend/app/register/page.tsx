'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getPendingNote, clearPendingNote } from '../../lib/utils'
import { notesApi } from '../../lib/api'
import { Logo } from '../../components/Logo'

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const labels = ['', 'Lemah', 'Sedang', 'Kuat']
  const colors = ['', 'bg-danger', 'bg-yellow-400', 'bg-success']
  return password ? (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary">{labels[strength]}</span>
    </div>
  ) : null
}

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(name, email, password)
      const pending = getPendingNote()
      if (pending) {
        await notesApi.create({
          title: pending.title,
          note: pending.note,
          scheduledAt: pending.scheduledAt,
        })
        clearPendingNote()
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat akun')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-modal border border-border shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Buat akun inget.in</h1>
            <p className="text-sm text-text-secondary mt-1">
              Mulai catat dengan mudah dan rapi
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-input text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              required
              leftIcon={<span className="material-icons text-base leading-none">person</span>}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              required
              leftIcon={<span className="material-icons text-base leading-none">mail</span>}
            />

            <div>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                required
                leftIcon={<span className="material-icons text-base leading-none">lock</span>}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    <span className="material-icons text-base leading-none">
                      {showPass ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                }
              />
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Konfirmasi Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              required
              error={
                confirmPassword && confirmPassword !== password
                  ? 'Password tidak cocok'
                  : undefined
              }
              leftIcon={<span className="material-icons text-base leading-none">lock</span>}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                  <span className="material-icons text-base leading-none">
                    {showConfirm ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              }
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Buat Akun
              <span className="material-icons text-base leading-none">arrow_forward</span>
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-text-secondary">atau</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-border rounded-chip py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Daftar dengan Google
          </button>

          <p className="text-center text-sm text-text-secondary mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login →
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
