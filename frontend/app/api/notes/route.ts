import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail, attachCategories } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const date = searchParams.get('date')
  const done = searchParams.get('done')

  const db = supabaseAdmin()
  let q = db.from('Note').select('*').eq('userId', auth.id)

  if (category) q = q.eq('categoryId', category)
  if (done !== null) q = q.eq('isDone', done === 'true')
  if (date) {
    q = q.gte('scheduledAt', `${date}T00:00:00.000`).lte('scheduledAt', `${date}T23:59:59.999`)
  }
  q = q.order('scheduledAt', { ascending: true })

  const { data: notes, error } = await q
  if (error) return fail(error.message, 500)

  return ok(await attachCategories(db, notes || []))
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { title, note, scheduledAt, categoryId, isDone } = await req.json()
    if (!title) return fail('Title is required')

    const db = supabaseAdmin()
    const now = new Date().toISOString()
    const { data: created, error } = await db
      .from('Note')
      .insert({
        id: crypto.randomUUID(),
        userId: auth.id,
        title,
        note: note ?? null,
        scheduledAt: scheduledAt || null,
        categoryId: categoryId || null,
        isDone: isDone ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .select('*')
      .single()
    if (error) return fail(error.message, 500)

    const [withCat] = await attachCategories(db, [created])
    return ok(withCat, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
