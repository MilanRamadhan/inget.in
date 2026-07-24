'use client'

import { useCallback, useEffect, useState } from 'react'
import { notificationsApi } from '../lib/api'

export type PushStatus =
  | 'loading'
  | 'unsupported'
  | 'needs-install'
  | 'default'
  | 'denied'
  | 'subscribed'
  | 'error'

function applicationServerKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  return bytes.buffer
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

async function syncSubscription(subscription: PushSubscription) {
  const serialized = subscription.toJSON()
  if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
    throw new Error('Subscription browser tidak lengkap')
  }

  await notificationsApi.subscribe({
    endpoint: serialized.endpoint,
    keys: {
      p256dh: serialized.keys.p256dh,
      auth: serialized.keys.auth,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
  })
}

export function usePushNotifications(userId: string) {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  const initialize = useCallback(async () => {
    setError(null)
    if (
      !publicKey ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setStatus('unsupported')
      return
    }

    if (isIos() && !isStandalone()) {
      setStatus('needs-install')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      const subscription = await registration.pushManager.getSubscription()

      if (Notification.permission === 'denied') {
        setStatus('denied')
      } else if (subscription && Notification.permission === 'granted') {
        await syncSubscription(subscription)
        setStatus('subscribed')
      } else {
        setStatus('default')
      }
    } catch {
      setStatus('error')
      setError('Notifikasi belum dapat disiapkan.')
    }
  }, [publicKey, userId])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const subscribe = useCallback(async () => {
    if (!publicKey) {
      setStatus('unsupported')
      return
    }

    setStatus('loading')
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'default')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(publicKey),
        }))

      await syncSubscription(subscription)
      setStatus('subscribed')
    } catch {
      setStatus('error')
      setError('Gagal mengaktifkan notifikasi. Coba lagi dari pengaturan browser.')
    }
  }, [publicKey])

  const unsubscribe = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await notificationsApi.unsubscribe(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus('default')
    } catch {
      setStatus('error')
      setError('Gagal menonaktifkan notifikasi.')
    }
  }, [])

  return { status, error, subscribe, unsubscribe, retry: initialize }
}
