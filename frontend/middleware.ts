import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/token"

function redirectTo(path: string, req: NextRequest) {
  const url = new URL(path, req.url)
  return NextResponse.redirect(url)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  const needsStudent = pathname.startsWith("/student")
  const needsTeacher = pathname.startsWith("/teacher")
  const needsAdmin = pathname.startsWith("/admin")
  const needsSchoolAdmin = pathname.startsWith("/school-admin")

  if (!needsStudent && !needsTeacher && !needsAdmin && !needsSchoolAdmin) {
    return NextResponse.next()
  }

  const token = req.cookies.get("smartlab_auth")?.value
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    if (needsAdmin) return redirectTo("/login/admin", req)
    if (needsSchoolAdmin) return redirectTo("/login/school-admin", req)
    if (needsTeacher) return redirectTo("/login/teacher", req)
    return redirectTo("/login/student", req)
  }

  const role = payload.role

  if (needsStudent && role !== "student" && role !== "admin" && role !== "guest") {
    return redirectTo("/login/student", req)
  }
  if (needsTeacher && role !== "teacher" && role !== "admin") return redirectTo("/login/teacher", req)
  if (needsAdmin && role !== "admin") return redirectTo("/login/admin", req)
  if (needsSchoolAdmin && role !== "school_admin" && role !== "admin") return redirectTo("/login/school-admin", req)

  return NextResponse.next()
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*", "/school-admin/:path*"],
}