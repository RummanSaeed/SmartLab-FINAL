"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Brain,
  ClipboardCheck,
  History,
  ChevronDown,
  Atom,
  Beaker,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { StudentSidebar } from "@/components/student/sidebar"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Conversation {
  id: number
  title: string
  subject: string
  lastMessage: string
  date: string
}

const pastConversations: Conversation[] = [
  {
    id: 1,
    title: "Ohm's Law Explanation",
    subject: "Physics",
    lastMessage: "The relationship between current and voltage is...",
    date: "Today",
  },
  {
    id: 2,
    title: "Acid-Base Titration Help",
    subject: "Chemistry",
    lastMessage: "To calculate the concentration, you need to...",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Simple Pendulum Quiz",
    subject: "Physics",
    lastMessage: "Correct! The time period depends on length...",
    date: "2 days ago",
  },
]

const quickActions = [
  { icon: Lightbulb, label: "Explain Result", prompt: "Explain my recent experiment results" },
  { icon: HelpCircle, label: "Suggest Correction", prompt: "What did I do wrong in my setup?" },
  { icon: ClipboardCheck, label: "Generate Quiz", prompt: "Generate a quiz question about this topic" },
  { icon: Brain, label: "Deeper Understanding", prompt: "Help me understand the theory behind this" },
]

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello Ahmad! I'm your AI tutor. I can help you understand experiments, explain concepts, generate quiz questions, and guide you through your learning journey. What would you like to explore today?",
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

    setMessages([...messages, userMessage])
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
        content: !res.ok ? (data?.error || "Tutor temporarily unavailable.") : (data?.answer || "I could not generate a response."),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Tutor temporarily unavailable.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">AI Tutor</h1>
              <p className="text-sm text-muted-foreground">Your personal science guide</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <History className="w-4 h-4 mr-2" />
            History
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </Button>
        </header>

        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
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
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border/50"
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
                        className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
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
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      <span className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(action.prompt)}
                      className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all text-left group"
                    >
                      <action.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">{action.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t border-border/50 bg-card/30">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask anything about Physics or Chemistry..."
                  className="flex-1 h-12 bg-background border-border/50"
                />
                <Button onClick={() => handleSend()} size="lg" className="h-12 px-6">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
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
                      <Card
                        key={conv.id}
                        className="bg-background/50 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {conv.subject === "Physics" ? (
                              <Atom className="w-4 h-4 text-primary" />
                            ) : (
                              <Beaker className="w-4 h-4 text-secondary" />
                            )}
                            <span className="font-medium text-sm">{conv.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{conv.lastMessage}</p>
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
