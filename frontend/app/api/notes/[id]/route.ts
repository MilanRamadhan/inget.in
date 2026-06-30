import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail, attachCategories } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: note } = await db.from('Note').select('*').eq('id', params.id).maybeSingle()
  if (!note) return fail('Note not found', 404)
  if (note.userId !== auth.id) return fail('Forbidden', 403)

  const [withCat] = await attachCategories(db, [note])
  return ok(withCat)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: note } = await db.from('Note').select('userId').eq('id', params.id).maybeSingle()
  if (!note) return fail('Note not found', 404)
  if (note.userId !== auth.id) return fail('Forbidden', 403)

  try {
    const body = await req.json()
    const patch: Record<string, any> = { updatedAt: new Date().toISOString() }
    if ('title' in body) patch.title = body.title
    if ('note' in body) patch.note = body.note ?? null
    if ('scheduledAt' in body) patch.scheduledAt = body.scheduledAt || null
    if ('categoryId' in body) patch.categoryId = body.categoryId || null
    if ('isDone' in body) patch.isDone = body.isDone

    const { data: updated, error } = await db
      .from('Note')
      .update(patch)
      .eq('id', params.id)
      .select('*')
      .single()
    if (error) return fail(error.message, 500)

    const [withCat] = await attachCategories(db, [updated])
    return ok(withCat)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: note } = await db.from('Note').select('userId').eq('id', params.id).maybeSingle()
  if (!note) return fail('Note not found', 404)
  if (note.userId !== auth.id) return fail('Forbidden', 403)

  const { error } = await db.from('Note').delete().eq('id', params.id)
  if (error) return fail(error.message, 500)
  return ok({ message: 'Note deleted' })
}
