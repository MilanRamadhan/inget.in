import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, avatar } = await req.json()
    if (!name || !email) return fail('Name and email are required')

    const db = supabaseAdmin()
    let { data: user } = await db.from('User').select('*').eq('email', email).maybeSingle()

    if (!user) {
      const now = new Date().toISOString()
      const { data: created, error } = await db
        .from('User')
        .insert({ id: crypto.randomUUID(), name, email, avatar: avatar ?? null, createdAt: now, updatedAt: now })
        .select('*')
        .single()
      if (error) return fail(error.message, 500)
      user = created
    }

    const tokens = signTokens(user.id, user.email)
    return ok({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      ...tokens,
    })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
