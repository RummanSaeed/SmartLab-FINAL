import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, type AuthRole } from "@/lib/token"

export type AuthContext = {
  userId: string
  role: AuthRole
}

export function getAuthContext(req: NextRequest | Request): AuthContext | null {
  const cookieHeader = req.headers.get("cookie") || ""
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)smartlab_auth=([^;]+)/)
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null

  const auth = req.headers.get("authorization") || ""
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null

  const token = cookieToken || bearer
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return { userId: payload.sub, role: payload.role }
}

export function requireAuth(req: NextRequest | Request, allowedRoles?: AuthRole[]) {
  const auth = getAuthContext(req)
  if (!auth) {
    return {
      ok: false as const,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return {
      ok: false as const,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return {
    ok: true as const,
    auth,
  }
}
