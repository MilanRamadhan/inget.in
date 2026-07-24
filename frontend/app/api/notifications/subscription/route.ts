import { NextRequest } from 'next/server'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'
import {
  deletePushSubscription,
  upsertPushSubscription,
} from '@/lib/notificationsDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeTimezone(value: unknown) {
  if (typeof value !== 'string' || value.length > 80) return 'Asia/Jakarta'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format()
    return value
  } catch {
    return 'Asia/Jakarta'
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { endpoint, keys, timezone } = await req.json()
    if (
      typeof endpoint !== 'string' ||
      !endpoint.startsWith('https://') ||
      typeof keys?.p256dh !== 'string' ||
      typeof keys?.auth !== 'string'
    ) {
      return fail('Subscription tidak valid')
    }

    const subscription = await upsertPushSubscription(auth.id, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      timezone: normalizeTimezone(timezone),
    })
    return ok(subscription)
  } catch (error: any) {
    return fail(error?.message || 'Gagal menyimpan subscription', 500)
  }
}

export async function DELETE(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { endpoint } = await req.json()
    if (typeof endpoint !== 'string') return fail('Endpoint diperlukan')
    await deletePushSubscription(auth.id, endpoint)
    return ok({ message: 'Notifikasi dinonaktifkan' })
  } catch (error: any) {
    return fail(error?.message || 'Gagal menonaktifkan notifikasi', 500)
  }
}
