import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

function toErrorDetails(error: unknown) {
  if (process.env.NODE_ENV === "production") return undefined
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }
  }
  try {
    return { message: JSON.stringify(error) }
  } catch {
    return { message: String(error) }
  }
}

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error
  const userId = authResult.auth.userId

  if (!(prisma as any).chatMessage) {
    return NextResponse.json(
      {
        error: "Chat is not configured on the server (Prisma client is out of date)",
        hint: "Stop the dev server and run: npx prisma generate",
      },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(req.url)
  const withUserId = searchParams.get("with")

  try {
    if (withUserId) {
      // Get conversation with specific user
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
        include: {
          sender: { select: { id: true, fullName: true, role: true } },
          receiver: { select: { id: true, fullName: true, role: true } },
        },
      })
      return NextResponse.json({ messages })
    }

    // Get chat list (recent conversations)
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
      },
    })

    // Group by conversation partner
    const conversations = new Map()
    messages.forEach((msg) => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender
      if (!conversations.has(partner.id)) {
        conversations.set(partner.id, {
          partner,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
        })
      } else {
        const conv = conversations.get(partner.id)
        if (msg.receiverId === userId && !msg.read) {
          conv.unreadCount++
        }
      }
    })

    return NextResponse.json({ conversations: Array.from(conversations.values()) })
  } catch (error) {
    console.error("/api/chat GET failed", error)
    return NextResponse.json(
      { error: "Failed to load chat", details: toErrorDetails(error) },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const authResult = requireAuth(req, ["student", "teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error
  const userId = authResult.auth.userId

  if (!(prisma as any).chatMessage) {
    return NextResponse.json(
      {
        error: "Chat is not configured on the server (Prisma client is out of date)",
        hint: "Stop the dev server and run: npx prisma generate",
      },
      { status: 500 },
    )
  }

  try {
    const body = await req.json()
    const { receiverId, content } = body

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Missing receiver or content" }, { status: 400 })
    }

    // Verify receiver exists and is in same school (for students/teachers)
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, school: true, role: true },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, school: true },
    })

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    // School check for non-admins
    if (authResult.auth.role !== "admin" && sender.school !== receiver.school) {
      return NextResponse.json({ error: "Cannot message users from other schools" }, { status: 403 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: userId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("/api/chat POST failed", error)
    return NextResponse.json(
      { error: "Failed to send message", details: toErrorDetails(error) },
      { status: 500 },
    )
  }
}

export async function PATCH(req: Request) {
  const authResult = requireAuth(req, ["student", "teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error
  const userId = authResult.auth.userId

  if (!(prisma as any).chatMessage) {
    return NextResponse.json(
      {
        error: "Chat is not configured on the server (Prisma client is out of date)",
        hint: "Stop the dev server and run: npx prisma generate",
      },
      { status: 500 },
    )
  }

  try {
    const body = await req.json()
    const { senderId } = body

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        senderId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("/api/chat PATCH failed", error)
    return NextResponse.json(
      { error: "Failed to mark as read", details: toErrorDetails(error) },
      { status: 500 },
    )
  }
}
