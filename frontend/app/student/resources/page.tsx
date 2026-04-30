"use client";
import { useEffect, useState } from "react";

interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<"Physics" | "Chemistry">("Physics")

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/student/resources?subject=${encodeURIComponent(subject)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(String(data?.error || "Failed to load resources"))
          return
        }
        setResources(data.resources || [])
      })
      .catch(() => setError("Failed to load resources"))
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <p className="text-muted-foreground mb-8">Access study materials, guides, and useful resources here.</p>

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
          <p>Loading resources...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : resources.length === 0 ? (
          <p className="text-lg">No resources available yet.</p>
        ) : (
          <ul className="space-y-4">
            {resources.map((r) => (
              <li key={r.id} className="border rounded p-4 bg-background/80">
                <h2 className="font-semibold text-lg mb-1">{r.title}</h2>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-primary mb-2 block">{r.url}</a>
                <span className="text-xs text-muted-foreground">Added: {new Date(r.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

