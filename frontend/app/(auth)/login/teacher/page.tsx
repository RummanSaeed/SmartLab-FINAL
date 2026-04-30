"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FlaskConical, Eye, EyeOff, ArrowRight, ArrowLeft, School, Home, Atom } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { loginRequest } from "@/lib/auth-client"

export default function TeacherLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await loginRequest(email, password)
      if (res.user.role !== "teacher" && res.user.role !== "admin") {
        throw new Error("This account is not a teacher/admin account")
      }
      localStorage.setItem("smartlab_token", res.token)
      localStorage.setItem("smartlab_user", JSON.stringify(res.user))
      router.push(res.user.role === "admin" ? "/admin/dashboard" : "/teacher/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" suppressHydrationWarning>
      {/* Left Panel - Teacher Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <div className="p-3 rounded-xl bg-secondary/20 border border-secondary/30">
                <FlaskConical className="w-10 h-10 text-secondary" />
              </div>
              <span className="text-3xl font-bold">SmartLab</span>
            </Link>

            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 inline-block mb-6">
              <School className="w-16 h-16 text-secondary" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Teacher
              <span className="block text-secondary">Portal</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-md">
              Manage classes, monitor live experiments, and review analytics with AI support.
            </p>

            <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>Class & Experiment Assignments</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>Live Hazard Alerts</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>Auto-generated Reports</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="absolute top-20 right-20"
          >
            <div className="p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <Atom className="w-8 h-8 text-secondary" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 rounded-lg bg-secondary/20 border border-secondary/30">
              <FlaskConical className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-2xl font-bold">SmartLab</span>
          </Link>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Link>
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm mb-4">
                <School className="w-4 h-4" />
                Teacher Login
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground">Enter your credentials to access the teacher portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-secondary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border/50 h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base group" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-secondary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo: Use any email and password</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
