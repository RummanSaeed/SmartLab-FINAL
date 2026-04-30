"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminSidebar } from "@/components/admin/sidebar"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AdminAITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm the AI assistant for admins. Ask about platform usage, hazards, user growth, or operational recommendations.",
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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">Admin assistant for platform analytics</p>
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
                    message.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border border-border/50"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">AI Tutor</span>
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
              <Sparkles className="w-4 h-4 text-accent animate-pulse" /> AI is thinking...
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
              placeholder="Ask about system usage, hazards, users, experiments..."
              className="flex-1 h-12 bg-background border-border/50"
            />
            <Button onClick={handleSend} size="lg" className="h-12 px-6">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
