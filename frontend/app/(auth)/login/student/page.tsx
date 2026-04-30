"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { FlaskConical, Eye, EyeOff, ArrowRight, ArrowLeft, GraduationCap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { loginRequest } from "@/lib/auth-client"

function StudentLoginInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const search = useSearchParams()

  const enterGuest = async () => {
    setError(null)
    setGuestLoading(true)
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Guest mode unavailable")
      localStorage.setItem("smartlab_token", data.token)
      localStorage.setItem("smartlab_user", JSON.stringify(data.user))
      router.push("/student/dashboard")
    } catch (err: any) {
      setError(err.message || "Guest login failed")
    } finally {
      setGuestLoading(false)
    }
  }

  useEffect(() => {
    if (search.get("guest") === "1") {
      enterGuest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await loginRequest(email, password)
      if (res.user.role !== "student" && res.user.role !== "admin") {
        throw new Error("This account is not a student account")
      }
      localStorage.setItem("smartlab_token", res.token)
      localStorage.setItem("smartlab_user", JSON.stringify(res.user))
      router.push("/student/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">SmartLab</p>
              <p className="text-muted-foreground">AI-driven virtual labs</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <p className="text-lg font-semibold">What you can do as a student</p>
            <div className="space-y-3 text-muted-foreground">
              <p>Run class-aligned physics & chemistry experiments.</p>
              <p>Track your attempts, scores, and safety hazards.</p>
              <p>Ask the AI tutor for step-by-step guidance.</p>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Student accounts are created by Teacher/School Admin/System Admin.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/login"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/"><Home className="w-4 h-4 mr-1" />Home</Link>
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
                <GraduationCap className="w-4 h-4" />Student Login
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground">Enter your credentials or continue as guest</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="student@school.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border/50 h-12" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border/50 h-12 pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me for 30 days</Label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base group" disabled={isLoading}>
                {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>

              <Button type="button" variant="outline" className="w-full h-11" disabled={guestLoading} onClick={enterGuest}>
                {guestLoading ? "Entering guest mode..." : "Continue as Guest"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">Need an account? Contact your Teacher or School Admin to get login credentials.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function StudentLoginPage() {
  return (
    <Suspense>
      <StudentLoginInner />
    </Suspense>
  )
}