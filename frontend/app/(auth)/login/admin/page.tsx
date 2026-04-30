"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FlaskConical, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { loginRequest } from "@/lib/auth-client"

export default function AdminLoginPage() {
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
      if (res.user.role !== "admin") {
        throw new Error("This account is not a system admin account")
      }
      localStorage.setItem("smartlab_token", res.token)
      localStorage.setItem("smartlab_user", JSON.stringify(res.user))
      router.push("/admin/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/10" />
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4">
                <Shield className="w-4 h-4" />System Admin
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Console Login</h2>
              <p className="text-muted-foreground">Enter credentials to access system administration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="admin@smartlab.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border/50 h-12" required />
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
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me</Label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base group" disabled={isLoading}>
                {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                If you have no admin account yet, use POST <code>/api/auth/bootstrap</code> once to create the first System Admin.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
