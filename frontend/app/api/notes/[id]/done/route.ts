import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail, attachCategories } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const db = supabaseAdmin()
  const { data: note } = await db.from('Note').select('*').eq('id', params.id).maybeSingle()
  if (!note) return fail('Note not found', 404)
  if (note.userId !== auth.id) return fail('Forbidden', 403)

  const { data: updated, error } = await db
    .from('Note')
    .update({ isDone: !note.isDone, updatedAt: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single()
  if (error) return fail(error.message, 500)

  const [withCat] = await attachCategories(db, [updated])
  return ok(withCat)
}
