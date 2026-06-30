import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Matches the response envelope the old NestJS backend produced, so the
// frontend (which reads `res.data.data`) keeps working unchanged.
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ status: 'error', message }, { status })
}

// Manually attach the related Category to notes (instead of relying on
// PostgREST FK embedding, which would need the schema's FKs in its cache).
export async function attachCategories(db: SupabaseClient, notes: any[]): Promise<any[]> {
  if (!notes || notes.length === 0) return notes || []

  const ids = Array.from(new Set(notes.map((n) => n.categoryId).filter(Boolean)))
  let map: Record<string, any> = {}

  if (ids.length) {
    const { data: cats } = await db.from('Category').select('*').in('id', ids)
    map = Object.fromEntries((cats || []).map((c: any) => [c.id, c]))
  }

  return notes.map((n) => ({
    ...n,
    category: n.categoryId ? map[n.categoryId] ?? null : null,
  }))
}
