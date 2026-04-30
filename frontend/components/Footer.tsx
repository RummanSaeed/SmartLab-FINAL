import { FlaskConical } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-bold text-foreground">SmartLab</span>
              <p className="text-xs text-muted-foreground">© 2025 SmartLab Team – BS-SE-7A</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#experiments" className="hover:text-foreground transition-colors">
              Experiments
            </a>
            <a href="#roadmap" className="hover:text-foreground transition-colors">
              Roadmap
            </a>
            <a href="/login/student" className="hover:text-foreground transition-colors">
              Login
            </a>
            <a href="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </a>
          </div>

          {/* Powered By */}
          <p className="text-xs text-muted-foreground">Powered by AI & WebGL</p>
        </div>
      </div>
    </footer>
  )
}
