import { createUser } from '@/lib/db'
import { GUEST_EMAIL_DOMAIN, signTokens } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const user = await createUser({
      name: 'Pelupa',
      email: `${crypto.randomUUID()}${GUEST_EMAIL_DOMAIN}`,
    })
    const tokens = signTokens(user.id, user.email, true)

    return ok(
      {
        user: {
          id: user.id,
          name: 'Pelupa',
          email: user.email,
          avatar: null,
          isGuest: true,
        },
        ...tokens,
      },
      201,
    )
  } catch (e: any) {
    return fail(e?.message || 'Gagal menyiapkan akun sementara', 500)
  }
}
