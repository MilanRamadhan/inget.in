import { NextRequest } from 'next/server'
import { getNote, updateNote, deleteNote } from '@/lib/db'
import { getAuth } from '@/lib/serverAuth'
import { ok, fail } from '@/lib/apiResponse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const note = await getNote(params.id)
    if (!note) return fail('Note not found', 404)
    if (note.userId !== auth.id) return fail('Forbidden', 403)
    return ok(note)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const note = await getNote(params.id)
    if (!note) return fail('Note not found', 404)
    if (note.userId !== auth.id) return fail('Forbidden', 403)

    const body = await req.json()
    const updated = await updateNote(params.id, note, body)
    return ok(updated)
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = getAuth(req)
  if (!auth) return fail('Unauthorized', 401)

  try {
    const note = await getNote(params.id)
    if (!note) return fail('Note not found', 404)
    if (note.userId !== auth.id) return fail('Forbidden', 403)

    await deleteNote(params.id)
    return ok({ message: 'Note deleted' })
  } catch (e: any) {
    return fail(e?.message || 'Internal server error', 500)
  }
}
