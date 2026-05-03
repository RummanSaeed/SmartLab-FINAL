"use client";
import { useEffect, useMemo, useRef, useState } from "react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: "experiment" | "quiz" | "questions";
  dueDate: string;
  extendedDueDate?: string | null;
  createdAt: string;
  practicalId?: string | null;
  quizSpec?: any;
  questionsSpec?: any;
  submission?: {
    id: string;
    status: string;
    submittedAt: string;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
    runId: string | null;
  } | null;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<"Physics" | "Chemistry">("Physics")

  const [submitForId, setSubmitForId] = useState<string | null>(null);
  const [runId, setRunId] = useState("");
  const [answersJson, setAnswersJson] = useState("");
  const [quizResponses, setQuizResponses] = useState<Record<string, string>>({})
  const [quizSecondsLeft, setQuizSecondsLeft] = useState<number | null>(null)
  const quizTimerRef = useRef<number | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<{ submissionId: string; startedAt: string; endsAt: string; status: string } | null>(
    null,
  )
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true)
    setError(null);
    fetch(`/api/student/assignments?subject=${encodeURIComponent(subject)}`)
      .then((res) => res.json())
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => setError("Failed to load assignments"))
      .finally(() => setLoading(false));
  }, [subject]);

  const current = useMemo(() => {
    if (!submitForId) return null;
    return assignments.find((a) => a.id === submitForId) || null;
  }, [assignments, submitForId]);

  const currentQuizQuestions = useMemo(() => {
    if (!current || current.type !== "quiz") return []
    const questions = Array.isArray(current.quizSpec?.questions) ? current.quizSpec.questions : []
    return questions
  }, [current])

  const resetQuizTimer = (a: Assignment | null) => {
    if (quizTimerRef.current) {
      window.clearInterval(quizTimerRef.current)
      quizTimerRef.current = null
    }

    setQuizSecondsLeft(null)
    setQuizAttempt(null)
  }

  const startQuizAttempt = async (a: Assignment) => {
    if (a.type !== "quiz") return
    const res = await fetch(`/api/student/assignments/${a.id}/start`, { method: "POST" })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(String(data?.error || "Failed to start quiz"))
    }
    const attempt = data?.attempt
    if (!attempt?.endsAt || !attempt?.startedAt) {
      throw new Error("Invalid attempt")
    }

    const attemptState = {
      submissionId: String(attempt.submissionId),
      startedAt: String(attempt.startedAt),
      endsAt: String(attempt.endsAt),
      status: String(attempt.status || "in_progress"),
    }
    setQuizAttempt(attemptState)

    const endsAtMs = new Date(attemptState.endsAt).getTime()
    if (!Number.isFinite(endsAtMs)) {
      setQuizSecondsLeft(null)
      return
    }

    if (quizTimerRef.current) {
      window.clearInterval(quizTimerRef.current)
      quizTimerRef.current = null
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((endsAtMs - Date.now()) / 1000))
      setQuizSecondsLeft(left)
      if (left <= 0 && quizTimerRef.current) {
        window.clearInterval(quizTimerRef.current)
        quizTimerRef.current = null
      }
    }

    tick()
    quizTimerRef.current = window.setInterval(tick, 1000)
  }

  const handleSubmit = async () => {
    if (!current) return;
    setSubmitError(null);
    const payload: any = {};

    if (current.type === "experiment") {
      if (!runId.trim()) {
        setSubmitError("Run ID is required")
        return
      }
      payload.runId = runId.trim()
    } else if (current.type === "quiz") {
      if (quizSecondsLeft === 0) {
        setSubmitError("Time is up. You cannot submit now.")
        return
      }
      const responses: Record<string, string> = { ...quizResponses }
      if (currentQuizQuestions.length > 0) {
        for (const q of currentQuizQuestions) {
          const qid = q?.id != null ? String(q.id) : ""
          if (!qid) continue
          if (!responses[qid]) {
            setSubmitError("Please answer all questions before submitting")
            return
          }
        }
      }
      payload.answers = { responses }
    } else {
      if (!answersJson.trim()) {
        setSubmitError("Answers JSON is required")
        return
      }
      try {
        payload.answers = JSON.parse(answersJson)
      } catch {
        setSubmitError("Answers JSON is invalid")
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/student/assignments/${current.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(String(data?.error || "Failed to submit"))
        return
      }
      const refresh = await fetch(`/api/student/assignments?subject=${encodeURIComponent(subject)}`)
      const refreshed = await refresh.json().catch(() => ({}))
      setAssignments(refreshed.assignments || [])
      setSubmitForId(null)
      setRunId("")
      setAnswersJson("")
      setQuizResponses({})
      resetQuizTimer(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      <p className="text-muted-foreground mb-8">View and submit your assignments here.</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value as any)}
          className="h-9 rounded border border-border bg-background px-3 text-sm"
        >
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
        </select>
      </div>

      <div className="rounded-lg border p-6 bg-card/70">
        {loading ? (
          <p>Loading assignments...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : assignments.length === 0 ? (
          <p className="text-lg">No assignments available yet.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map((a) => (
              <li key={a.id} className="border rounded p-4 bg-background/80">
                <h2 className="font-semibold text-lg mb-1">{a.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{a.description}</p>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">
                    Type: {a.type} | Due: {new Date(a.extendedDueDate || a.dueDate).toLocaleString()}
                  </span>

                  {a.submission ? (
                    <div className="text-xs">
                      <p className="text-muted-foreground">Status: {a.submission.status}</p>
                      {typeof a.submission.score === "number" && (
                        <p className="text-muted-foreground">Score: {Math.round(a.submission.score)}%</p>
                      )}
                      {a.submission.feedback && <p className="text-muted-foreground">Feedback: {a.submission.feedback}</p>}
                    </div>
                  ) : (
                    <button
                      className="text-sm underline text-primary w-fit"
                      onClick={async () => {
                        setSubmitForId(a.id)
                        setSubmitError(null)
                        setRunId("")
                        setAnswersJson("")
                        setQuizResponses({})
                        setQuizAttempt(null)
                        resetQuizTimer(null)

                        if (a.type === "quiz") {
                          try {
                            await startQuizAttempt(a)
                          } catch (e: any) {
                            setSubmitError(String(e?.message || "Failed to start quiz"))
                          }
                        }
                      }}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {current && (
        <div className="mt-6 rounded-lg border p-6 bg-card/70 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Submit: {current.title}</h2>
              <p className="text-sm text-muted-foreground">Type: {current.type}</p>
            </div>
            <button className="text-sm underline text-muted-foreground" onClick={() => setSubmitForId(null)}>
              Close
            </button>
          </div>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          {current.type === "experiment" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Completed Run ID</label>
              <input
                className="w-full rounded border px-3 py-2 bg-background"
                placeholder="Paste runId"
                value={runId}
                onChange={(e) => setRunId(e.target.value)}
              />
            </div>
          ) : current.type === "quiz" ? (
            <div className="space-y-4">
              {typeof quizSecondsLeft === "number" && (
                <div className="flex items-center justify-between rounded border border-border bg-background/60 px-4 py-2">
                  <p className="text-sm font-medium">Time left</p>
                  <p className={`text-sm font-semibold ${quizSecondsLeft <= 30 ? "text-red-500" : ""}`}>
                    {Math.floor(quizSecondsLeft / 60)}:{String(quizSecondsLeft % 60).padStart(2, "0")}
                  </p>
                </div>
              )}

              {currentQuizQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quiz questions configured.</p>
              ) : (
                <div className="space-y-4">
                  {currentQuizQuestions.map((q: any, idx: number) => {
                    const qid = q?.id != null ? String(q.id) : String(idx + 1)
                    const prompt = String(q?.prompt || "")
                    const choices: string[] = Array.isArray(q?.choices) ? q.choices.map((c: any) => String(c)) : []
                    const selected = quizResponses[qid] || ""
                    return (
                      <div key={qid} className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
                        <p className="font-semibold">{idx + 1}. {prompt}</p>
                        <div className="space-y-2">
                          {choices.map((c, ci) => (
                            <label key={ci} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`q-${qid}`}
                                value={c}
                                checked={selected === c}
                                onChange={() => setQuizResponses((p) => ({ ...p, [qid]: c }))}
                                disabled={quizSecondsLeft === 0}
                              />
                              <span>{c}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Answers JSON</label>
              <textarea
                className="w-full rounded border px-3 py-2 bg-background min-h-[140px]"
                placeholder='{"answers": [{"id":"q1","value":"..."}]}'
                value={answersJson}
                onChange={(e) => setAnswersJson(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              className="rounded bg-primary text-primary-foreground px-4 py-2 disabled:opacity-60"
              disabled={submitting || quizSecondsLeft === 0}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

