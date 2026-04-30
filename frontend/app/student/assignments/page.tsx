"use client";
import { useEffect, useMemo, useState } from "react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: "experiment" | "quiz" | "questions";
  dueDate: string;
  extendedDueDate?: string | null;
  createdAt: string;
  practicalId?: string | null;
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
      const refresh = await fetch("/api/student/assignments")
      const refreshed = await refresh.json().catch(() => ({}))
      setAssignments(refreshed.assignments || [])
      setSubmitForId(null)
      setRunId("")
      setAnswersJson("")
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
                      onClick={() => {
                        setSubmitForId(a.id)
                        setSubmitError(null)
                        setRunId("")
                        setAnswersJson("")
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
              disabled={submitting}
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

