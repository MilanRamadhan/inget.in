-- Run this in Supabase SQL Editor after replacing both placeholders.
-- Use the same CRON_SECRET value configured in Vercel.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'ingetin-send-reminders';

SELECT cron.schedule(
  'ingetin-send-reminders',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_VERCEL_DOMAIN/api/notifications/dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
