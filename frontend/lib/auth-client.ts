export interface AuthResponse {
  user: {
    id: string
    fullName: string
    email: string
    role: "student" | "teacher" | "admin" | "school_admin"
    school?: string
    classLevel?: string
    createdAt?: string
  }
  token: string
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error: any = new Error(data?.error || "Request failed");
    if (data && data.details) error.details = data.details;
    throw error;
  }
  return data as T
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function signupRequest(params: {
  fullName: string
  email: string
  password: string
  role: "student" | "teacher" | "admin" | "school_admin"
  school?: string
  class?: string
}) {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function forgotPasswordRequest(email: string) {
  return apiFetch<{ ok: boolean; message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}
