import { NextRequest } from 'next/server'
import { findUserByEmail, createUser } from '@/lib/db'
import { signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, avatar } = await req.json()
    if (!name || !email) return fail('Name and email are required')

    let user = await findUserByEmail(email)
    if (!user) user = await createUser({ name, email, avatar: avatar ?? null })

    const tokens = signTokens(user.id, user.email)
    return ok({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      ...tokens,
    })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
