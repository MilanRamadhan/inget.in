import { NextRequest } from 'next/server'
import { signTokens, verifyRefresh } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()
    if (!refreshToken) return fail('Refresh token is required')

    const payload = verifyRefresh(refreshToken)
    return ok(signTokens(payload.sub, payload.email))
  } catch {
    return fail('Invalid refresh token', 401)
  }
}
