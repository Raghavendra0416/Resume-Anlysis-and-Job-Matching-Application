const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  } catch {
    throw new ApiError('Could not reach the API. Check that the server is running and the API URL is correct.', 0)
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new ApiError(payload.error ?? 'The request could not be completed.', response.status)
  return payload as T
}

export const api = {
  session: () => apiRequest<{ authenticated: boolean }>('/auth/session'),
  login: (password: string) => apiRequest<{ authenticated: true }>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  getResume: () => apiRequest<{ resume: ResumeRecord | null }>('/resume'),
  saveResume: (content: string) => apiRequest<{ resume: ResumeRecord }>('/resume', { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteResume: () => apiRequest<void>('/resume', { method: 'DELETE' }),
  getJobs: (limit = 50) => apiRequest<{ jobs: JobRecord[]; total: number }>(`/jobs?limit=${limit}`),
  createJob: (job: NewJob) => apiRequest<{ job: JobRecord }>('/jobs', { method: 'POST', body: JSON.stringify(job) }),
  deleteJob: (id: string) => apiRequest<void>(`/jobs/${id}`, { method: 'DELETE' }),
  getTailoredResumes: () => apiRequest<{ resumes: TailoredResumeRecord[] }>('/tailored-resumes'),
}

export interface ResumeRecord {
  _id: string
  content: string
  analysis: Record<string, unknown> | null
  updatedAt: string
}

export interface JobRecord {
  _id: string
  companyName: string
  jobTitle?: string
  companyDescription?: string
  additionalInfo?: string
  jobDescription: string
  analysis: null | { score: number; summary: string }
  createdAt: string
  updatedAt: string
}

export interface TailoredResumeRecord {
  _id: string
  jobId: string
  companyName: string
  jobTitle?: string
  content: string
  createdAt: string
}

export interface NewJob {
  companyName: string
  jobTitle?: string
  companyDescription?: string
  additionalInfo?: string
  jobDescription: string
}
