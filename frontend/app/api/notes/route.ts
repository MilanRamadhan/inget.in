import { NextRequest } from 'next/server'
import { listNotes, createNote } from '@/lib/db'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { searchParams } = new URL(req.url)
    const notes = await listNotes(auth.id, {
      category: searchParams.get('category'),
      date: searchParams.get('date'),
      done: searchParams.get('done'),
    })
    return ok(notes)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const { title, note, scheduledAt, categoryId, isDone, type, items } = await req.json()
    if (!title) return fail('Title is required')

    const created = await createNote(auth.id, { title, note, scheduledAt, categoryId, isDone, type, items })
    return ok(created, 201)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
