import { NextRequest } from 'next/server'
import { findUserByEmail, createUser, findUserById, mergeGuestData } from '@/lib/db'
import { getAuth, isGuestEmail, signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, avatar } = await req.json()
    if (!name || !email) return fail('Name and email are required')

    let user = await findUserByEmail(email)
    if (!user) user = await createUser({ name, email, avatar: avatar ?? null })

    const currentAuth = getAuth(req)
    if (currentAuth?.isGuest && currentAuth.id !== user.id) {
      const guest = await findUserById(currentAuth.id)
      if (guest && isGuestEmail(guest.email)) {
        await mergeGuestData(guest.id, user.id)
      }
    }

    const tokens = signTokens(user.id, user.email)
    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isGuest: false,
      },
      ...tokens,
    })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
