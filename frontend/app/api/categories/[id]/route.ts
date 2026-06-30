import { NextRequest } from 'next/server'
import { getCategory, updateCategory, deleteCategory } from '@/lib/db'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const cat = await getCategory(params.id)
    if (!cat) return fail('Category not found', 404)
    if (cat.userId !== auth.id) return fail('Forbidden', 403)

    const body = await req.json()
    const updated = await updateCategory(params.id, cat, body)
    return ok(updated)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const cat = await getCategory(params.id)
    if (!cat) return fail('Category not found', 404)
    if (cat.userId !== auth.id) return fail('Forbidden', 403)

    await deleteCategory(params.id)
    return ok({ message: 'Category deleted' })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
