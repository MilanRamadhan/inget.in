import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { findUserByEmail, createUser } from '@/lib/db'
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

    if (await findUserByEmail(email)) return fail('Email already registered', 409)

    const hashed = await bcrypt.hash(password, 10)
    const user = await createUser({ name, email, password: hashed })

    const tokens = signTokens(user.id, user.email)
    return ok({ user: { id: user.id, name: user.name, email: user.email }, ...tokens }, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
