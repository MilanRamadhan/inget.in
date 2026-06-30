import { NextResponse } from 'next/server'

// Matches the response envelope the old NestJS backend produced, so the
// frontend (which reads `res.data.data`) keeps working unchanged.
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ status: 'error', message }, { status })
}
