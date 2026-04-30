"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function SchoolAdminAITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm your school admin assistant. Ask about teachers, students, safety trends, experiments usage, and operational checks.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userText = input
    const userMessage: Message = { id: Date.now(), role: "user", content: userText, timestamp: new Date() }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText, contextType: "portal", state: {} }),
      })

      const data = (await res.json()) as { answer?: string; error?: string }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: !res.ok ? data?.error || "Tutor temporarily unavailable." : data?.answer || "I could not generate a response.",
          timestamp: new Date(),
        },
      ])
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
    <div className="flex flex-col">
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">School admin assistant for monitoring & decisions</p>
            </div>
          </div>
        </header>

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
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">AI Tutor</span>
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-border/50 bg-card/30">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about school performance, teachers, students, hazards..."
              className="flex-1 h-12 bg-background border-border/50"
            />
            <Button onClick={handleSend} size="lg" className="h-12 px-6">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
    </div>
  )
}
