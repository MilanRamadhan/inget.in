import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return fail('Email and password are required')

    const db = supabaseAdmin()
    const { data: user } = await db.from('User').select('*').eq('email', email).maybeSingle()
    if (!user || !user.password) return fail('Invalid credentials', 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return fail('Invalid credentials', 401)

    const tokens = signTokens(user.id, user.email)
    return ok({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      ...tokens,
    })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
