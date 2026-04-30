"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FlaskConical, Mail, CheckCircle2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordRequest } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await forgotPasswordRequest(email)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">SmartLab</span>
        </Link>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
            </Button>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
                <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@school.edu.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/50 h-12"
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Remembered?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Go back to login
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-10">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                If the email exists, we sent reset instructions. You can close this page or return to login.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" asChild>
                  <Link href="/login">Back to login</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
