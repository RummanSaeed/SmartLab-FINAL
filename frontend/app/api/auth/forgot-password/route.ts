import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body || {};
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    // In a real system, send email here. We just acknowledge.
    return NextResponse.json({ ok: true, message: "If this email exists, reset instructions were sent." });
  } catch (err) {
    console.error("forgot password error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
