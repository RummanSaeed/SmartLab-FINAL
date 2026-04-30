"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FlaskConical, Eye, EyeOff, ArrowRight, ArrowLeft, UserCog, Home, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { loginRequest } from "@/lib/auth-client"

export default function SchoolAdminLoginPage() {
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
      if (res.user.role !== "school_admin" && res.user.role !== "admin") {
        throw new Error("This account is not authorized for school admin access")
      }
      localStorage.setItem("smartlab_token", res.token)
      localStorage.setItem("smartlab_user", JSON.stringify(res.user))
      router.push(res.user.role === "admin" ? "/admin/dashboard" : "/school-admin/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - School Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-amber-500/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <FlaskConical className="w-10 h-10 text-amber-500" />
              </div>
              <span className="text-3xl font-bold">SmartLab</span>
            </Link>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 inline-block mb-6">
              <UserCog className="w-16 h-16 text-amber-500" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              School Admin
              <span className="block text-amber-500">Portal</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-md">
              Manage school accounts, monitor usage, and oversee all activities in one place.
            </p>

            <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>School Account Management</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Teacher & Student Oversight</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Usage Analytics & Reports</span>
              </div>
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
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <FlaskConical className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-2xl font-bold">SmartLab</span>
          </Link>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
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
              <div className="p-3 rounded-full bg-amber-500/10 inline-block mb-4">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">School Admin Sign In</h2>
              <p className="text-muted-foreground">Enter your credentials to access the dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@yourschool.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-muted-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-amber-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor="remember" className="text-sm font-medium leading-none">
                    Remember me
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground text-sm">
                Need help? Contact{' '}
                <a href="mailto:support@smartlab.edu" className="text-amber-500 hover:underline">
                  support@smartlab.edu
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
