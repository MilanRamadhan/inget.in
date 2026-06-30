import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('Category')
    .select('*')
    .eq('userId', auth.id)
    .order('createdAt', { ascending: true })
  if (error) return fail(error.message, 500)
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { name, color } = await req.json()
    if (!name) return fail('Name is required')

    const db = supabaseAdmin()
    const now = new Date().toISOString()
    const { data, error } = await db
      .from('Category')
      .insert({
        id: crypto.randomUUID(),
        userId: auth.id,
        name,
        color: color || '#9CA3AF',
        createdAt: now,
        updatedAt: now,
      })
      .select('*')
      .single()
    if (error) return fail(error.message, 500)
    return ok(data, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
