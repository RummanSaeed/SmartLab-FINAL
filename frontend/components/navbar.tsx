"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, FlaskConical, User, GraduationCap, School, UserCog, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">SmartLab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Features
            </a>
            <a href="#experiments" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Experiments
            </a>
            <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Roadmap
            </a>
            <Link href="/login/student" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Student Login
            </Link>
            <Link href="/login/teacher" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Teacher Login
            </Link>
            <Link href="/login/school-admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              School Admin Login
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sign in as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login/student" className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Student</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/teacher" className="flex items-center gap-2 cursor-pointer">
                    <School className="w-4 h-4 text-secondary" />
                    <span>Teacher</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/school-admin" className="flex items-center gap-2 cursor-pointer">
                    <UserCog className="w-4 h-4 text-amber-500" />
                    <span>School Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/admin" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>System Admin</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#experiments" className="block text-muted-foreground hover:text-foreground transition-colors">
                Experiments
              </a>
              <a href="#roadmap" className="block text-muted-foreground hover:text-foreground transition-colors">
                Roadmap
              </a>
              <Link
                href="/login/student"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Student Login
              </Link>
              <Link
                href="/login/teacher"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Teacher Login
              </Link>
              <Link
                href="/login/school-admin"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                School Admin Login
              </Link>
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Quick Login</p>
                <Link
                  href="/login/student"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Student Login
                </Link>
                <Link
                  href="/login/teacher"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <School className="w-4 h-4 text-secondary" />
                  Teacher Login
                </Link>
                <Link
                  href="/login/school-admin"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCog className="w-4 h-4 text-amber-500" />
                  School Admin Login
                </Link>
                <Link
                  href="/login/admin"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4 text-accent" />
                  System Admin Login
                </Link>
              </div>
              <div className="pt-3">
                <Button className="w-full bg-primary text-primary-foreground" asChild>
                  <Link href="/signup">
                    <User className="w-4 h-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
