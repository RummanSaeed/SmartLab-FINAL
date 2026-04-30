"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FlaskConical, Eye, EyeOff, ArrowRight, GraduationCap, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signupRequest } from "@/lib/auth-client"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    school: "",
    class: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await signupRequest({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "student",
        school: formData.school,
        class: formData.class,
      })
      localStorage.setItem("smartlab_token", res.token)
      localStorage.setItem("smartlab_user", JSON.stringify(res.user))
      router.push("/student/dashboard")
    } catch (err: any) {
      setError(err.message || "Signup failed")
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
        className="relative z-10 w-full max-w-lg"
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

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
              <GraduationCap className="w-4 h-4" />
              Student Registration
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Student Account</h2>
            <p className="text-muted-foreground">Teacher, School Admin, and System Admin accounts are provisioned by authorized admins.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="bg-background/50 border-border/50 h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-background/50 border-border/50 h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-background/50 border-border/50 h-12 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School / Institution (optional)</Label>
              <Select value={formData.school} onValueChange={(value) => setFormData({ ...formData, school: value })}>
                <SelectTrigger className="bg-background/50 border-border/50 h-12">
                  <SelectValue placeholder="Select your school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fgs-islamabad">FG Model School Islamabad</SelectItem>
                  <SelectItem value="beacon-house">Beacon House School</SelectItem>
                  <SelectItem value="city-school">The City School</SelectItem>
                  <SelectItem value="roots-school">Roots School System</SelectItem>
                  <SelectItem value="other">Other Institution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                <SelectTrigger className="bg-background/50 border-border/50 h-12">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full h-12 group" disabled={isLoading}>
              {isLoading ? "Creating..." : <>Create Student Account <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">Already have an account? <Link href="/login/student" className="text-primary hover:underline font-medium">Sign in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}