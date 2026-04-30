"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FlaskConical, GraduationCap, School, Home, ArrowRight, Atom, UserCog, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <FlaskConical className="w-10 h-10 text-primary" />
              </div>
              <span className="text-3xl font-bold">SmartLab</span>
            </Link>

            <h1 className="text-4xl font-bold mb-4">
              Welcome to the Future of
              <span className="block text-primary">Science Education</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-md">
              Experience AI-powered virtual laboratories designed for FBISE Physics & Chemistry curriculum.
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="absolute top-20 right-20"
          >
            <div className="p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
              <Atom className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
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
              <h2 className="text-2xl font-bold mb-2">Sign In</h2>
              <p className="text-muted-foreground">Choose how you want to sign in</p>
            </div>

            <div className="space-y-4">
              <Link href="/login/student" className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-6 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/20 border border-primary/30"><GraduationCap className="w-8 h-8 text-primary" /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-foreground">Student Login</h3><p className="text-sm text-muted-foreground">Access virtual lab experiments</p></div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/login/admin" className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-6 rounded-xl bg-accent/5 border border-accent/20 hover:border-accent/50 hover:bg-accent/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/20 border border-accent/30"><Shield className="w-8 h-8 text-accent" /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-foreground">System Admin</h3><p className="text-sm text-muted-foreground">Platform administration & provisioning</p></div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/login/teacher" className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-6 rounded-xl bg-secondary/5 border border-secondary/20 hover:border-secondary/50 hover:bg-secondary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/20 border border-secondary/30"><School className="w-8 h-8 text-secondary" /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-foreground">Teacher Login</h3><p className="text-sm text-muted-foreground">Accounts are provisioned by School Admin</p></div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/login/school-admin" className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30"><UserCog className="w-8 h-8 text-amber-500" /></div>
                    <div className="flex-1"><h3 className="text-lg font-semibold text-foreground">School Admin</h3><p className="text-sm text-muted-foreground">Provisioned by System Admin</p></div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/login/student?guest=1" className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Continue as Guest</h3>
                      <p className="text-sm text-muted-foreground">Student-mode access without school linkage</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground">Need student account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}