"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Beaker,
  Zap,
  FlaskConical,
  Atom,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type ExperimentRow = {
  id: string
  name: string
  subject: string
  classLevel: string
  status: string
  attempts: number
  avgScore: number
  lastUpdated: string | null
  hazard?: string
  level?: string
  category?: string
}

export default function ExperimentsPage() {
  const [search, setSearch] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  const [experiments, setExperiments] = useState<ExperimentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setLoadError(null)
    fetch("/api/admin/experiments")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        if (data?.error) {
          setLoadError(String(data.error))
          setExperiments([])
          return
        }
        setExperiments(Array.isArray(data?.experiments) ? data.experiments : [])
      })
      .catch(() => {
        if (!mounted) return
        setLoadError("Failed to load experiments")
        setExperiments([])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = subjectFilter === "all" || exp.subject.toLowerCase() === subjectFilter
    const matchesStatus = statusFilter === "all" || exp.status === statusFilter
    const matchesClass = classFilter === "all" || exp.classLevel === classFilter
    return matchesSearch && matchesSubject && matchesStatus && matchesClass
  })

  const classOptions = [
    "all",
    ...Array.from(new Set(experiments.map((e) => e.classLevel).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Experiments</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage virtual lab experiments</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/experiments/new">
            <Plus className="w-4 h-4 mr-2" />
            New Experiment
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="chemistry">Chemistry</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Classes" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError && <p className="text-sm text-red-400">{loadError}</p>}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading experiments...</div>
        ) : (
          filteredExperiments.map((experiment, index) => (
            <motion.div
              key={experiment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Beaker className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold truncate">{experiment.name}</h3>
                    <Badge
                      variant={
                        experiment.status === "published"
                          ? "default"
                          : experiment.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        experiment.status === "published"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : experiment.status === "draft"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }
                    >
                      {experiment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{experiment.subject}</span>
                    <span>•</span>
                    <span>{experiment.classLevel}</span>
                    {experiment.lastUpdated ? (
                      <>
                        <span>•</span>
                        <span>Updated {experiment.lastUpdated}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-8 text-center">
                  <div>
                    <p className="text-2xl font-bold">{experiment.attempts.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{experiment.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/experiments/${experiment.id}`}>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/experiments/new">
                        <span className="flex items-center">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {filteredExperiments.length === 0 && (
        <div className="text-center py-12">
          <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No experiments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
