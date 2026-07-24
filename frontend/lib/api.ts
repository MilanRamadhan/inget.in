import axios from 'axios'
import { AuthResponse, User } from '../types'

// API lives in the same Next.js app, so every request stays same-origin.
const BASE_URL = '/api'
export const AUTH_SESSION_EVENT = 'ingetin:auth-session'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null
let sessionPromise: Promise<AuthResponse> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function getAccessToken() {
  return accessToken
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function persistAuthSession(data: AuthResponse) {
  setAccessToken(data.accessToken)
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(data.user))
  localStorage.setItem('refreshToken', data.refreshToken)
  window.dispatchEvent(new CustomEvent<AuthResponse>(AUTH_SESSION_EVENT, { detail: data }))
}

export function clearAuthSession() {
  setAccessToken(null)
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
  localStorage.removeItem('refreshToken')
}

async function requestGuestSession(): Promise<AuthResponse> {
  const response = await axios.post(`${BASE_URL}/auth/guest`)
  return response.data.data as AuthResponse
}

export async function ensureAuthSession(forceGuest = false): Promise<AuthResponse> {
  if (sessionPromise) return sessionPromise

  sessionPromise = (async () => {
    if (!forceGuest && accessToken) {
      const user = getStoredUser()
      const refreshToken = localStorage.getItem('refreshToken')
      if (user && refreshToken) return { user, accessToken, refreshToken }
    }

    if (!forceGuest) {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          const session = response.data.data as AuthResponse
          persistAuthSession(session)
          return session
        } catch (error) {
          if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error
          }
          clearAuthSession()
        }
      }
    }

    const session = await requestGuestSession()
    persistAuthSession(session)
    return session
  })()

  try {
    return await sessionPromise
  } finally {
    sessionPromise = null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const requestUrl = String(original?.url || '')
    const isAuthRequest = requestUrl.includes('/auth/')

    if (error.response?.status === 401 && original && !original._retry && !isAuthRequest) {
      original._retry = true
      try {
        setAccessToken(null)
        const session = await ensureAuthSession()
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${session.accessToken}`
        return api(original)
      } catch {
        clearAuthSession()
      }
    }

    return Promise.reject(error)
  },
)

export const authApi = {
  guest: () => api.post('/auth/guest'),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  googleAuth: (data: { name: string; email: string; avatar?: string }) =>
    api.post('/auth/google', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.delete('/auth/logout'),
}

export const notesApi = {
  create: (data: object) => api.post('/notes', data),
  getAll: (params?: { category?: string; date?: string; done?: string }) =>
    api.get('/notes', { params }),
  getOne: (id: string) => api.get(`/notes/${id}`),
  update: (id: string, data: object) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  toggleDone: (id: string) => api.patch(`/notes/${id}/done`),
}

export const categoriesApi = {
  create: (data: { name: string; color?: string }) => api.post('/categories', data),
  getAll: () => api.get('/categories'),
  update: (id: string, data: { name?: string; color?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}
