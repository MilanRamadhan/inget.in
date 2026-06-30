import { NextRequest } from 'next/server'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)
  // Stateless JWT — nothing to revoke server-side; client clears its tokens.
  return ok({ message: 'Logged out' })
}
