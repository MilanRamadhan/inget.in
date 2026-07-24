'use client'

import { LordIcon } from './LordIcon'
import { COLOR_GREEN, COLOR_MUTED, COLOR_PRIMARY, ICONS } from '../lib/icons'
import { usePushNotifications } from '../hooks/usePushNotifications'

export function NotificationControl({ userId }: { userId: string }) {
  const { status, error, subscribe, unsubscribe, retry } = usePushNotifications(userId)

  if (status === 'unsupported') {
    return (
      <div className="flex items-start gap-3 rounded-card border border-border bg-white px-3 py-3">
        <LordIcon src={ICONS.bell} colors={COLOR_MUTED} size={20} />
        <div>
          <p className="text-xs font-semibold text-text-primary">Notifikasi belum tersedia</p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
            Gunakan browser terbaru dan pastikan konfigurasi Web Push sudah dipasang.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'needs-install') {
    return (
      <div className="flex items-start gap-3 rounded-card border border-orange-200 bg-primary-light px-3 py-3">
        <LordIcon src={ICONS.bell} colors={COLOR_PRIMARY} size={20} />
        <div>
          <p className="text-xs font-semibold text-text-primary">Pasang inget.in di iPhone</p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
            Pilih Bagikan lalu Tambahkan ke Layar Utama agar notifikasi dapat diaktifkan.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'subscribed') {
    return (
      <div className="flex items-center justify-between gap-3 rounded-card border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <LordIcon src={ICONS.bell} colors={COLOR_GREEN} size={19} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-800">Notifikasi pengingat aktif</p>
            <p className="truncate text-[10px] text-emerald-700">
              Pengingat akan muncul pada perangkat ini.
            </p>
          </div>
        </div>
        <button
          onClick={() => void unsubscribe()}
          className="flex-shrink-0 text-[11px] font-semibold text-emerald-800"
        >
          Matikan
        </button>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 px-3 py-3">
        <LordIcon src={ICONS.bell} colors={COLOR_MUTED} size={20} />
        <div>
          <p className="text-xs font-semibold text-text-primary">Izin notifikasi diblokir</p>
          <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
            Aktifkan kembali izin notifikasi dari pengaturan browser atau perangkat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-orange-200 bg-primary-light px-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <LordIcon src={ICONS.bell} colors={COLOR_PRIMARY} size={20} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-primary">
            {status === 'loading' ? 'Menyiapkan notifikasi...' : 'Aktifkan notifikasi'}
          </p>
          <p className="truncate text-[10px] text-text-secondary">
            Dapatkan pengingat walau inget.in sedang ditutup.
          </p>
          {error && <p className="mt-1 text-[10px] text-danger">{error}</p>}
        </div>
      </div>
      {status !== 'loading' && (
        <button
          onClick={() => void (status === 'error' ? retry() : subscribe())}
          className="flex-shrink-0 rounded-chip bg-primary px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          {status === 'error' ? 'Coba lagi' : 'Aktifkan'}
        </button>
      )}
    </div>
  )
}
