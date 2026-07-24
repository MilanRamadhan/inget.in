import { NextRequest } from 'next/server'
import webpush from 'web-push'
import { ok, fail } from '@/lib/apiResponse'
import {
  claimReminderDelivery,
  deletePushSubscriptionById,
  listDueReminders,
  markReminderDelivered,
  releaseReminderDelivery,
} from '@/lib/notificationsDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getPushConfig() {
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey) return null
  return { subject, publicKey, privateKey }
}

function notificationBody(note: string | null, scheduledAt: string) {
  const content = note?.replace(/\s+/g, ' ').trim()
  if (content) return content.slice(0, 120)
  const time = scheduledAt.split('T')[1]?.slice(0, 5)
  return time ? `Waktunya untuk catatan pukul ${time}.` : 'Waktunya membuka catatan ini.'
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = req.headers.get('authorization')
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return fail('Unauthorized', 401)
  }

  const config = getPushConfig()
  if (!config) return fail('Konfigurasi Web Push belum lengkap', 503)

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey)

  try {
    const reminders = await listDueReminders()
    let sent = 0
    let expired = 0
    let failed = 0

    for (const reminder of reminders) {
      const claimed = await claimReminderDelivery(
        reminder.noteId,
        reminder.subscriptionId,
        reminder.scheduledAt,
      )
      if (!claimed) continue

      try {
        await webpush.sendNotification(
          {
            endpoint: reminder.endpoint,
            keys: { p256dh: reminder.p256dh, auth: reminder.auth },
          },
          JSON.stringify({
            title: 'Pengingat inget.in',
            body: `${reminder.title} - ${notificationBody(reminder.note, reminder.scheduledAt)}`,
            noteId: reminder.noteId,
            url: `/dashboard?note=${encodeURIComponent(reminder.noteId)}`,
          }),
          { TTL: 60 * 60, urgency: 'high' },
        )
        await markReminderDelivered(
          reminder.noteId,
          reminder.subscriptionId,
          reminder.scheduledAt,
        )
        sent += 1
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await deletePushSubscriptionById(reminder.subscriptionId)
          expired += 1
        } else {
          await releaseReminderDelivery(
            reminder.noteId,
            reminder.subscriptionId,
            reminder.scheduledAt,
          )
          failed += 1
        }
      }
    }

    return ok({ checked: reminders.length, sent, expired, failed })
  } catch (error: any) {
    return fail(error?.message || 'Gagal mengirim pengingat', 500)
  }
}
