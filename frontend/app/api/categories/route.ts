import { NextRequest } from 'next/server'
import { listCategories, createCategory } from '@/lib/db'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    return ok(await listCategories(auth.id))
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { name, color } = await req.json()
    if (!name) return fail('Name is required')

    const created = await createCategory(auth.id, { name, color })
    return ok(created, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
