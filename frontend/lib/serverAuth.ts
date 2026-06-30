import jwt, { SignOptions } from 'jsonwebtoken'

export interface TokenPayload {
  sub: string
  email: string
}

export function signTokens(userId: string, email: string) {
  const payload = { sub: userId, email }
  return {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    } as SignOptions),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as SignOptions),
  }
}

export function verifyRefresh(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload
}

// Extract & verify the access token from an incoming request.
// Returns the authenticated user's id/email, or null when unauthenticated.
export function getAuth(req: Request): { id: string; email: string } | null {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}
