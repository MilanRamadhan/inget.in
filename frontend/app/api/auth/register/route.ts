import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return fail('Name, email, and password are required')
    if (typeof password !== 'string' || password.length < 6)
      return fail('Password must be at least 6 characters')

    const db = supabaseAdmin()
    const { data: existing } = await db.from('User').select('id').eq('email', email).maybeSingle()
    if (existing) return fail('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()
    const { data: user, error } = await db
      .from('User')
      .insert({ id: crypto.randomUUID(), name, email, password: hashed, createdAt: now, updatedAt: now })
      .select('id, name, email')
      .single()
    if (error) return fail(error.message, 500)

    const tokens = signTokens(user.id, user.email)
    return ok({ user: { id: user.id, name: user.name, email: user.email }, ...tokens }, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
