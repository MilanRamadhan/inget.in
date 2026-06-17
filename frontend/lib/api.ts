import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          setAccessToken(data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          original.headers['Authorization'] = `Bearer ${data.data.accessToken}`
          return api(original)
        }
      } catch {
        setAccessToken(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  },
)

export const authApi = {
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
