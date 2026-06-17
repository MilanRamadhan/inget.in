'use client'
import { useRouter } from 'next/navigation'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

interface SaveModalProps {
  open: boolean
  onClose: () => void
  onContinueWithout: () => void
}

export function SaveModal({ open, onClose, onContinueWithout }: SaveModalProps) {
  const router = useRouter()

  return (
    <Modal open={open} onClose={onClose} className="p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-primary text-2xl">cloud</span>
        </div>

        <h2 className="text-lg font-bold text-text-primary mb-2">Simpan catatanmu?</h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Login dulu biar catatanmu aman dan bisa diakses kapan aja!
        </p>

        <div className="flex gap-3 mb-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              onClose()
              router.push('/register')
            }}
          >
            Daftar Gratis
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onClose()
              router.push('/login')
            }}
          >
            Login
          </Button>
        </div>

        <button
          onClick={onContinueWithout}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mx-auto"
        >
          Lanjut tanpa simpan
          <span className="material-icons text-sm leading-none">arrow_forward</span>
        </button>
      </div>
    </Modal>
  )
}
