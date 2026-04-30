import crypto from "crypto"
import { NextResponse } from "next/server"
import { issueToken } from "@/lib/token"

export async function POST() {
  const guestId = `guest-${crypto.randomUUID?.() || Date.now()}`
  const token = issueToken(guestId, "guest", 60 * 60 * 8)

  const user = {
    id: guestId,
    fullName: "Guest Student",
    email: "guest@smartlab.local",
    role: "guest",
    school: null,
    classLevel: null,
    createdAt: new Date().toISOString(),
  }

  const res = NextResponse.json({ user, token })
  res.cookies.set("smartlab_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
  return res
}