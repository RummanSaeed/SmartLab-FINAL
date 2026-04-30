"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, Lightbulb, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  "Explain this step",
  "What happens if I increase voltage?",
  "Generate a quiz question",
  "Show me the formula",
]

export function AITutorPanel({
  experimentId,
  labState,
}: {
  experimentId: string
  labState?: Record<string, unknown>
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI tutor. I can help you understand the experiment, explain results, and answer questions. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async (forcedText?: string) => {
    const messageText = String(forcedText ?? input ?? "").trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentId,
          question: userMessage.content,
          state: labState || {},
          contextType: "lab",
        }),
      })
      const data = await res.json()
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data?.answer || data?.error || "Tutor is unavailable right now.",
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Network error. Please try again.",
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleExplainResult = () => {
    handleSend(
      "Explain my current experiment results from the live state. Tell me what each reading means, why it came that way, and what I should do next.",
    )
  }

  const handleGetHelp = () => {
    handleSend(
      "Check my current experiment state and guide me step-by-step from where I am now. Also tell me if I am doing well and what to do next.",
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Tutor</span>
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI is typing...</span>
          </motion.div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-border/50 space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestion(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(undefined)}
            placeholder="Ask a question..."
            className="flex-1 bg-background/50"
          />
          <Button onClick={() => handleSend(undefined)} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleExplainResult}>
            <Lightbulb className="w-3 h-3 mr-1" />
            Explain Result
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleGetHelp}>
            <HelpCircle className="w-3 h-3 mr-1" />
            Get Help
          </Button>
        </div>
      </div>
    </div>
  )
}
