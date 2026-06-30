import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side admin client. Uses the service-role key (bypasses RLS) and the
// custom `ingetin` schema where Prisma created the tables. Created lazily so a
// missing env var doesn't crash `next build` — it only throws on first request.
let _client: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_KEY).',
    )
  }

  _client = createClient(url, key, {
    db: { schema: 'ingetin' },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as SupabaseClient
  return _client
}
