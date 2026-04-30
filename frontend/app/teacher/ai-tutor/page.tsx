"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, History, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TeacherSidebar } from "@/components/teacher/sidebar"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Conversation {
  id: number
  title: string
  lastMessage: string
  date: string
}

const pastConversations: Conversation[] = [
  { id: 1, title: "Class Progress Summary", lastMessage: "Your class is improving in...", date: "Today" },
  { id: 2, title: "Common Mistakes", lastMessage: "Students often confuse...", date: "Yesterday" },
]

export default function TeacherAITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Ask me about class performance, weak areas, hazards, common mistakes, or recommendations for next lessons.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (customMessage?: string) => {
    const messageContent = customMessage || input
    if (!messageContent.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messageContent,
          contextType: "portal",
          state: {},
        }),
      })

      const data = (await res.json()) as { answer?: string; error?: string }

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: !res.ok
          ? data?.error || "Tutor temporarily unavailable."
          : data?.answer || "I could not generate a response.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Tutor temporarily unavailable.", timestamp: new Date() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">Teacher assistant for insights & actions</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <History className="w-4 h-4 mr-2" />
            History
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </Button>
        </header>

        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-5 py-4 ${
                        message.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-card border border-border/50"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-medium text-secondary">AI Tutor</span>
                        </div>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className={line.startsWith("•") || line.startsWith("-") ? "ml-4" : ""}>
                            {line.includes("**")
                              ? line
                                  .split("**")
                                  .map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))
                              : line}
                          </p>
                        ))}
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user" ? "text-secondary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <div className="bg-card border border-border/50 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-border/50 bg-card/30">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask about a class, student progress, hazards, or next steps..."
                  className="flex-1 h-12 bg-background border-border/50"
                />
                <Button onClick={() => handleSend()} size="lg" className="h-12 px-6">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-border/50 bg-card/30 overflow-hidden"
              >
                <div className="w-80 p-4">
                  <h3 className="font-semibold mb-4">Past Conversations</h3>
                  <div className="space-y-3">
                    {pastConversations.map((conv) => (
                      <Card key={conv.id} className="bg-background/50 border-border/50">
                        <CardContent className="p-3">
                          <span className="font-medium text-sm">{conv.title}</span>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{conv.lastMessage}</p>
                          <p className="text-xs text-muted-foreground mt-2">{conv.date}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
