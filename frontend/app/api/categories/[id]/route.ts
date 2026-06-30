import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: cat } = await db.from('Category').select('userId').eq('id', params.id).maybeSingle()
  if (!cat) return fail('Category not found', 404)
  if (cat.userId !== auth.id) return fail('Forbidden', 403)

  try {
    const body = await req.json()
    const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
    if ('name' in body) patch.name = body.name
    if ('color' in body) patch.color = body.color

    const { data, error } = await db
      .from('Category')
      .update(patch)
      .eq('id', params.id)
      .select('*')
      .single()
    if (error) return fail(error.message, 500)
    return ok(data)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: cat } = await db.from('Category').select('userId').eq('id', params.id).maybeSingle()
  if (!cat) return fail('Category not found', 404)
  if (cat.userId !== auth.id) return fail('Forbidden', 403)

  const { error } = await db.from('Category').delete().eq('id', params.id)
  if (error) return fail(error.message, 500)
  return ok({ message: 'Category deleted' })
}
