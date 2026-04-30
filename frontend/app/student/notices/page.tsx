"use client";
import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<"Physics" | "Chemistry">("Physics")

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/student/notices?subject=${encodeURIComponent(subject)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(String(data?.error || "Failed to load notices"))
          return
        }
        setNotices(data.notices || [])
      })
      .catch(() => setError("Failed to load notices"))
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Notices</h1>
      <p className="text-muted-foreground mb-8">Important notices and announcements will appear here.</p>

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
          <p>Loading notices...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : notices.length === 0 ? (
          <p className="text-lg">No notices at this time.</p>
        ) : (
          <ul className="space-y-4">
            {notices.map((n) => (
              <li key={n.id} className="border rounded p-4 bg-background/80">
                <h2 className="font-semibold text-lg mb-1">{n.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{n.content}</p>
                <span className="text-xs text-muted-foreground">Posted: {new Date(n.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

