import { NextResponse } from "next/server"
import { practicals } from "@/data/practicals"
import { requireAuth } from "@/lib/server-auth"
import { prisma } from "@/lib/prisma"

const GROQ_FALLBACK_MODELS = ["llama-3.1-8b-instant", "mixtral-8x7b"]
const OPENROUTER_FALLBACK_MODELS = [
  "stepfun/step-3.5-flash:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
]

async function callGroq(model: string, apiKey: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, temperature: 0.3, messages }),
  })
  if (!res.ok) throw new Error((await res.text()) || "Groq request failed")
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || "I'm not sure. Try rephrasing your question."
}

async function callOpenRouter(model: string, apiKey: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "SmartLab",
    },
    body: JSON.stringify({ model, temperature: 0.3, messages }),
  })
  if (!res.ok) throw new Error((await res.text()) || "OpenRouter request failed")
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || "I'm not sure. Try rephrasing your question."
}

async function buildRoleContext(userId: string, role: string, contextType: string, state: Record<string, unknown>) {
  if (contextType === "lab") {
    return `Lab state: ${JSON.stringify(state || {})}`
  }

  if (role === "student" || role === "guest") {
    const [runs, hazards] = await Promise.all([
      prisma.experimentRun.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 20,
        select: { practicalTitle: true, status: true, score: true, durationSec: true, startedAt: true },
      }),
      prisma.hazardEvent.count({
        where: { run: { userId } },
      }),
    ])
    const completed = runs.filter((r) => r.status === "completed").length
    const avgScore =
      runs.filter((r) => typeof r.score === "number").reduce((a, r) => a + (r.score || 0), 0) /
      Math.max(1, runs.filter((r) => typeof r.score === "number").length)
    return `Student progress:
- Total runs: ${runs.length}
- Completed: ${completed}
- Avg score: ${Number.isFinite(avgScore) ? avgScore.toFixed(1) : "0.0"}
- Hazards: ${hazards}
- Recent runs: ${runs
      .slice(0, 5)
      .map((r) => `${r.practicalTitle} (${r.status}, score ${r.score ?? "N/A"})`)
      .join(" | ")}
Dashboard state: ${JSON.stringify(state || {})}`
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { school: true },
  })
  const school = actor?.school || "__none__"
  const schoolFilter = role === "admin" ? {} : { school }

  if (role === "teacher") {
    const [students, runs, hazards] = await Promise.all([
      prisma.user.count({ where: { ...schoolFilter, role: "student" } }),
      prisma.experimentRun.count({ where: { user: schoolFilter } }),
      prisma.hazardEvent.count({ where: { run: { user: schoolFilter } } }),
    ])
    return `Teacher scope analytics:
- School: ${school}
- Students: ${students}
- Total runs: ${runs}
- Hazard events: ${hazards}
- UI state: ${JSON.stringify(state || {})}`
  }

  if (role === "school_admin") {
    const [teachers, students, runs, hazards] = await Promise.all([
      prisma.user.count({ where: { school, role: "teacher" } }),
      prisma.user.count({ where: { school, role: "student" } }),
      prisma.experimentRun.count({ where: { user: { school } } }),
      prisma.hazardEvent.count({ where: { run: { user: { school } } } }),
    ])
    return `School admin scope analytics:
- School: ${school}
- Teachers: ${teachers}
- Students: ${students}
- Total experiment runs: ${runs}
- Hazard events: ${hazards}
- UI state: ${JSON.stringify(state || {})}`
  }

  const [totalUsers, totalRuns, totalHazards] = await Promise.all([
    prisma.user.count(),
    prisma.experimentRun.count(),
    prisma.hazardEvent.count(),
  ])

  const schoolRows = await prisma.user.findMany({
    where: {
      school: {
        not: null,
      },
    },
    distinct: ["school"],
    select: { school: true },
  })
  const schools = schoolRows
    .map((r) => String(r.school || "").trim())
    .filter((s) => s.length > 0)
    .sort((a, b) => a.localeCompare(b))
  const schoolCount = schools.length
  const schoolPreview = schools.slice(0, 10)

  return `System admin analytics:
- Total users: ${totalUsers}
- Total runs: ${totalRuns}
- Total hazards: ${totalHazards}
- Total schools: ${schoolCount}
- Schools (sample): ${schoolPreview.length ? schoolPreview.join(" | ") : "N/A"}
- UI state: ${JSON.stringify(state || {})}`
}

function makeSystemPrompt(role: string, contextType: string) {
  const roleRule =
    role === "student" || role === "guest"
      ? "You are a strict-but-friendly personal lab tutor for one student."
      : role === "teacher"
        ? "You are a teacher assistant focused on class progress, weak areas, and next interventions."
        : role === "school_admin"
          ? "You are a school admin assistant focused on school-level operations, users, safety, and trends."
          : "You are a system admin assistant focused on platform-wide operations, governance, and quality."

  return `${roleRule}
Style rules:
- Be concise, friendly, and practical.
- If user greets casually, reply warmly in one short line first.
- Use provided context/state; do not invent unavailable data.
- Give actionable next steps.
- Keep safety-aligned responses for lab content.
- For portal context (${contextType}), answer in scope of the user's role only.`
}

function localFallbackAnswer(role: string, contextType: string, question: string, baseContext: string, roleContext: string) {
  const q = question.toLowerCase()

  if (q.trim() === "hi" || q.trim() === "hello" || q.trim() === "hey") {
    return "Hi! How can I help you today?"
  }

  if (contextType === "portal") {
    if (role === "admin") {
      return `I can help with platform analytics and operations.\n\nBased on current system context:\n${roleContext}\n\nAsk me:\n- total users/runs/hazards summary\n- school count and school list\n- safety trends\n- what to prioritize next`
    }
    if (role === "school_admin") {
      return `I can help you monitor your school.\n\nCurrent school context:\n${roleContext}\n\nAsk me:\n- which students/teachers need attention\n- hazard trends\n- engagement summary`
    }
    if (role === "teacher") {
      return `I can help with class progress and common mistakes.\n\nCurrent teacher context:\n${roleContext}\n\nAsk me:\n- summarize student performance\n- safety/hazard hotspots\n- next lesson recommendations`
    }
    return `I can help you as your personal tutor.\n\nYour progress summary:\n${roleContext}\n\nAsk me:\n- what to improve\n- why hazards happen\n- what experiment to do next`
  }

  if (contextType === "lab") {
    if (q.includes("step") || q.includes("procedure") || q.includes("how")) {
      return `Here is the practical context I have:\n${baseContext}\n\nTell me which step you are on and what you are observing, and I will guide you.\nAlso share your current setup/state if possible.`
    }
    if (q.includes("unsafe") || q.includes("hazard") || q.includes("safety")) {
      return "Safety first: check wiring/polarity, keep values in recommended range, and re-check connections. Describe your setup and I’ll point out likely hazards."
    }
    return `I can help you with this experiment.\n\n${baseContext}\n\nAsk a specific question (e.g., expected result, mistakes, or how to calculate a value).`
  }

  return "I can help, but I need a bit more detail. Please rephrase your question and include what page/experiment you’re working on."
}

export async function POST(req: Request) {
  try {
    const authResult = requireAuth(req, ["guest", "student", "teacher", "school_admin", "admin"])
    if (!authResult.ok) return authResult.error

    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    const groqApiKey = process.env.GROQ_API_KEY
    const provider = process.env.AI_PROVIDER || (openRouterApiKey ? "openrouter" : "groq")

    const defaultGroqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    const defaultOpenRouterModel = process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free"

    const body = await req.json()
    const experimentId = body?.experimentId ? String(body.experimentId) : ""
    const question = String(body?.question || "Help me with this step.")
    const state = typeof body?.state === "object" && body?.state ? body.state : {}
    const contextType = String(body?.contextType || (experimentId ? "lab" : "portal"))

    const practical = practicals.find((p) => p.id === experimentId)
    const baseContext = practical
      ? `Practical: ${practical.title}
Subject: ${practical.subject}, Class: ${practical.classLevel}, Level: ${practical.level}
Category: ${practical.category}, Hazard: ${practical.hazard}
Steps: ${practical.steps.join(" | ")}`
      : "No specific practical selected."

    const roleContext = await buildRoleContext(authResult.auth.userId, authResult.auth.role, contextType, state)
    const systemPrompt = makeSystemPrompt(authResult.auth.role, contextType)

    if (!openRouterApiKey && !groqApiKey) {
      const answer = localFallbackAnswer(authResult.auth.role, contextType, question, baseContext, roleContext)
      const runId = typeof state?.runId === "string" ? (state.runId as string) : null
      try {
        await prisma.tutorMessage.createMany({
          data: [
            {
              runId,
              userId: authResult.auth.userId,
              role: "user",
              content: question,
              model: "local-fallback",
              metadata: { contextType, experimentId: experimentId || null },
            },
            {
              runId,
              userId: authResult.auth.userId,
              role: "assistant",
              content: answer,
              model: "local-fallback",
              metadata: { contextType, experimentId: experimentId || null },
            },
          ],
        })
      } catch {
        // non-blocking
      }
      return NextResponse.json({ answer, model: "local-fallback" })
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: baseContext },
      { role: "system", content: roleContext },
      { role: "user", content: question },
    ]

    const groqModelsToTry = [defaultGroqModel, ...GROQ_FALLBACK_MODELS]
    const openRouterModelsToTry = [defaultOpenRouterModel, ...OPENROUTER_FALLBACK_MODELS]
    let answer = "I'm not sure. Please try again."
    let lastError: unknown = null
    let usedModel = ""

    if (provider === "openrouter" && openRouterApiKey) {
      for (const model of openRouterModelsToTry) {
        try {
          answer = await callOpenRouter(model, openRouterApiKey, messages)
          usedModel = model
          lastError = null
          break
        } catch (err) {
          lastError = err
        }
      }
    } else if (provider === "groq" && groqApiKey) {
      for (const model of groqModelsToTry) {
        try {
          answer = await callGroq(model, groqApiKey, messages)
          usedModel = model
          lastError = null
          break
        } catch (err) {
          lastError = err
        }
      }
    }

    if (lastError && openRouterApiKey) {
      for (const model of openRouterModelsToTry) {
        try {
          answer = await callOpenRouter(model, openRouterApiKey, messages)
          usedModel = model
          lastError = null
          break
        } catch (err) {
          lastError = err
        }
      }
    }
    if (lastError && groqApiKey) {
      for (const model of groqModelsToTry) {
        try {
          answer = await callGroq(model, groqApiKey, messages)
          usedModel = model
          lastError = null
          break
        } catch (err) {
          lastError = err
        }
      }
    }

    if (lastError) {
      answer = localFallbackAnswer(authResult.auth.role, contextType, question, baseContext, roleContext)
      usedModel = usedModel || "local-fallback"
      lastError = null
    }

    const runId = typeof state?.runId === "string" ? (state.runId as string) : null
    try {
      await prisma.tutorMessage.createMany({
        data: [
          {
            runId,
            userId: authResult.auth.userId,
            role: "user",
            content: question,
            model: usedModel || null,
            metadata: { contextType, experimentId: experimentId || null },
          },
          {
            runId,
            userId: authResult.auth.userId,
            role: "assistant",
            content: answer,
            model: usedModel || null,
            metadata: { contextType, experimentId: experimentId || null },
          },
        ],
      })
    } catch {
      // non-blocking audit/log persistence
    }

    return NextResponse.json({ answer, model: usedModel || null })
  } catch (err) {
    console.error("tutor error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

