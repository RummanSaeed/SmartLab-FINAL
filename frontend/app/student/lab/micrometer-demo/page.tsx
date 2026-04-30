"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MicrometerDemoPage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/student/lab">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold">Micrometer Demo (Local)</h1>
            <p className="text-sm text-muted-foreground">
              Embedded reference simulator inside SmartLab UI
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href="/sims/micrometer-demo/micrometer.html" target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Standalone
          </a>
        </Button>
      </header>

      <main className="flex-1 p-4">
        <div className="h-full rounded-xl border border-border/60 overflow-hidden bg-card/40">
          <iframe
            title="Micrometer Local Demo"
            src="/sims/micrometer-demo/micrometer.html"
            className="w-full h-full border-0"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </main>
    </div>
  )
}

