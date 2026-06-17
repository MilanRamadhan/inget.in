export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  userId: string
  categoryId?: string
  category?: Category
  title: string
  note?: string
  scheduledAt?: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
}

export interface PendingNote {
  title: string
  note?: string
  scheduledAt?: string
  categoryName?: string
}
