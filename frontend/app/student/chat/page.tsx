"use client"

import { useEffect, useRef, useState } from "react"
import { StudentSidebar } from "@/components/student/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Users, ChevronLeft } from "lucide-react"

type User = {
  id: string
  fullName: string
  role: string
}

type Message = {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
  sender?: User
  receiver?: User
}

type Conversation = {
  partner: User
  lastMessage: Message
  unreadCount: number
}

export default function StudentChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [teacher, setTeacher] = useState<User | null>(null)
  const [activeChat, setActiveChat] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Get current user from localStorage
    const raw = localStorage.getItem("smartlab_user")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setCurrentUser({ id: parsed.id })
      } catch {}
    }
  }, [])

  const loadConversations = async () => {
    const res = await fetch("/api/chat")
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations || [])
    }
  }

  const loadTeacher = async () => {
    const res = await fetch("/api/student/teacher")
    if (!res.ok) return
    const data = await res.json().catch(() => ({}))
    if (data?.teacher?.id) {
      setTeacher({
        id: String(data.teacher.id),
        fullName: String(data.teacher.fullName || "Teacher"),
        role: String(data.teacher.role || "teacher"),
      })
    }
  }

  const loadMessages = async (partnerId: string) => {
    const res = await fetch(`/api/chat?with=${partnerId}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages || [])
      // Mark as read
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: partnerId }),
      })
    }
  }

  useEffect(() => {
    loadConversations()
    loadTeacher()
    intervalRef.current = setInterval(() => {
      loadConversations()
      if (activeChat) {
        loadMessages(activeChat.id)
      }
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChat.id, content: input }),
      })
      if (res.ok) {
        setInput("")
        loadMessages(activeChat.id)
        loadConversations()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 flex">
        {/* Sidebar - Conversations List */}
        <div className={`w-80 border-r border-border bg-card/50 flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-3">
            {teacher && (
              <div className="space-y-1">
                <div className="px-2 text-xs font-medium text-muted-foreground">Your teacher</div>
                <button
                  onClick={() => {
                    setActiveChat(teacher)
                    loadMessages(teacher.id)
                  }}
                  className={
                    "w-full text-left p-3 rounded-lg transition-colors " +
                    (activeChat?.id === teacher.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{teacher.fullName}</span>
                    <Badge variant="outline" className="text-[10px]">ID</Badge>
                  </div>
                  <div className={`text-xs mt-1 truncate ${activeChat?.id === teacher.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {teacher.id}
                  </div>
                </button>
              </div>
            )}

            <div className="h-px bg-border/60" />

            <div className="space-y-1">
            {conversations.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start chatting with your teacher or classmates</p>
              </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.partner.id}
                onClick={() => {
                  setActiveChat(conv.partner)
                  loadMessages(conv.partner.id)
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeChat?.id === conv.partner.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{conv.partner.fullName}</span>
                  {conv.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {conv.partner.role}
                  </Badge>
                  <span className={`text-xs truncate ${activeChat?.id === conv.partner.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {conv.lastMessage.content.slice(0, 30)}...
                  </span>
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${activeChat ? "flex" : "hidden md:flex"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="h-14 border-b border-border flex items-center px-4 gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setActiveChat(null)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="font-semibold">{activeChat.fullName}</h3>
                  <Badge variant="outline" className="text-xs">
                    {activeChat.role}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <Card
                        className={`max-w-[70%] px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </Card>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={loading}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
