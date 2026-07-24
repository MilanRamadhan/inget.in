import { getSql } from './db'

export interface PushSubscriptionInput {
  endpoint: string
  p256dh: string
  auth: string
  timezone: string
}

export interface DueReminder {
  noteId: string
  title: string
  note: string | null
  scheduledAt: string
  subscriptionId: string
  endpoint: string
  p256dh: string
  auth: string
}

export async function upsertPushSubscription(
  userId: string,
  data: PushSubscriptionInput,
) {
  const sql = getSql()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO ingetin."PushSubscription"
      (id, "userId", endpoint, p256dh, auth, timezone, "createdAt", "updatedAt")
    VALUES (
      ${crypto.randomUUID()},
      ${userId},
      ${data.endpoint},
      ${data.p256dh},
      ${data.auth},
      ${data.timezone},
      ${now},
      ${now}
    )
    ON CONFLICT (endpoint) DO UPDATE SET
      "userId" = EXCLUDED."userId",
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      timezone = EXCLUDED.timezone,
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING id, "userId", endpoint, timezone, "createdAt", "updatedAt"`
  return rows[0]
}

export async function deletePushSubscription(userId: string, endpoint: string) {
  const sql = getSql()
  await sql`
    DELETE FROM ingetin."PushSubscription"
    WHERE "userId" = ${userId} AND endpoint = ${endpoint}`
}

export async function deletePushSubscriptionById(id: string) {
  const sql = getSql()
  await sql`DELETE FROM ingetin."PushSubscription" WHERE id = ${id}`
}

export async function listDueReminders(limit = 100): Promise<DueReminder[]> {
  const sql = getSql()

  // A crashed worker may leave a claim pending. Release it after ten minutes.
  await sql`
    DELETE FROM ingetin."ReminderDelivery"
    WHERE status = 'pending'
      AND "createdAt" < CURRENT_TIMESTAMP - INTERVAL '10 minutes'`

  return sql<DueReminder[]>`
    SELECT
      n.id AS "noteId",
      n.title,
      n.note,
      n."scheduledAt",
      subscription.id AS "subscriptionId",
      subscription.endpoint,
      subscription.p256dh,
      subscription.auth
    FROM ingetin."Note" n
    JOIN ingetin."PushSubscription" subscription
      ON subscription."userId" = n."userId"
    LEFT JOIN ingetin."ReminderDelivery" delivery
      ON delivery."noteId" = n.id
      AND delivery."subscriptionId" = subscription.id
      AND delivery."scheduledKey" = REPLACE(
        SUBSTRING(n."scheduledAt"::text FROM 1 FOR 16),
        ' ',
        'T'
      )
    WHERE n."scheduledAt" IS NOT NULL
      AND n."isDone" = FALSE
      AND delivery.id IS NULL
      AND SUBSTRING(n."scheduledAt"::text FROM 1 FOR 16)::timestamp
        <= CURRENT_TIMESTAMP AT TIME ZONE subscription.timezone
      AND SUBSTRING(n."scheduledAt"::text FROM 1 FOR 16)::timestamp
        > (CURRENT_TIMESTAMP AT TIME ZONE subscription.timezone) - INTERVAL '24 hours'
    ORDER BY n."scheduledAt" ASC
    LIMIT ${limit}`
}

function scheduledKey(scheduledAt: string) {
  return scheduledAt.replace(' ', 'T').slice(0, 16)
}

export async function claimReminderDelivery(
  noteId: string,
  subscriptionId: string,
  scheduledAt: string,
) {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO ingetin."ReminderDelivery"
      (id, "noteId", "subscriptionId", "scheduledKey", status, "createdAt")
    VALUES (
      ${crypto.randomUUID()},
      ${noteId},
      ${subscriptionId},
      ${scheduledKey(scheduledAt)},
      'pending',
      ${new Date().toISOString()}
    )
    ON CONFLICT ("noteId", "subscriptionId", "scheduledKey") DO NOTHING
    RETURNING id`
  return rows.length > 0
}

export async function markReminderDelivered(
  noteId: string,
  subscriptionId: string,
  scheduledAt: string,
) {
  const sql = getSql()
  await sql`
    UPDATE ingetin."ReminderDelivery"
    SET status = 'sent', "sentAt" = ${new Date().toISOString()}
    WHERE "noteId" = ${noteId}
      AND "subscriptionId" = ${subscriptionId}
      AND "scheduledKey" = ${scheduledKey(scheduledAt)}`
}

export async function releaseReminderDelivery(
  noteId: string,
  subscriptionId: string,
  scheduledAt: string,
) {
  const sql = getSql()
  await sql`
    DELETE FROM ingetin."ReminderDelivery"
    WHERE "noteId" = ${noteId}
      AND "subscriptionId" = ${subscriptionId}
      AND "scheduledKey" = ${scheduledKey(scheduledAt)}
      AND status = 'pending'`
}
