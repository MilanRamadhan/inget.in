import { NextRequest } from 'next/server'
import { findUserById } from '@/lib/db'
import { isGuestEmail, signTokens, verifyRefresh } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()
    if (!refreshToken) return fail('Refresh token is required')

    const payload = verifyRefresh(refreshToken)
    const user = await findUserById(payload.sub)
    if (!user) return fail('User tidak ditemukan', 401)
    if (payload.email !== user.email) return fail('Session sudah diperbarui', 401)

    const isGuest = isGuestEmail(user.email)
    return ok({
      user: {
        id: user.id,
        name: isGuest ? 'Pelupa' : user.name,
        email: user.email,
        avatar: user.avatar,
        isGuest,
      },
      ...signTokens(user.id, user.email, isGuest),
    })
  } catch {
    return fail('Invalid refresh token', 401)
  }
}
