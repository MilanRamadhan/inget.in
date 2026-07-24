CREATE TABLE IF NOT EXISTS ingetin."PushSubscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES ingetin."User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx"
  ON ingetin."PushSubscription" ("userId");

CREATE TABLE IF NOT EXISTS ingetin."ReminderDelivery" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "noteId" TEXT NOT NULL REFERENCES ingetin."Note"(id) ON DELETE CASCADE,
  "subscriptionId" UUID NOT NULL
    REFERENCES ingetin."PushSubscription"(id) ON DELETE CASCADE,
  "scheduledKey" VARCHAR(16) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "ReminderDelivery_noteId_subscriptionId_scheduledKey_key"
    UNIQUE ("noteId", "subscriptionId", "scheduledKey")
);

CREATE INDEX IF NOT EXISTS "ReminderDelivery_status_createdAt_idx"
  ON ingetin."ReminderDelivery" (status, "createdAt");
