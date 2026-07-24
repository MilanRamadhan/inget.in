'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AUTH_SESSION_EVENT,
  authApi,
  clearAuthSession,
  ensureAuthSession,
  persistAuthSession,
} from '../lib/api'
import { User, AuthResponse } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initialize = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const session = await ensureAuthSession()
      setUser(session.user)
    } catch {
      setError('Gagal menyiapkan penyimpanan catatan. Coba muat ulang.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleSession = (event: Event) => {
      const session = (event as CustomEvent<AuthResponse>).detail
      if (session?.user) setUser(session.user)
    }

    window.addEventListener(AUTH_SESSION_EVENT, handleSession)
    void initialize()
    return () => window.removeEventListener(AUTH_SESSION_EVENT, handleSession)
  }, [initialize])

  const saveAuth = (data: AuthResponse) => {
    persistAuthSession(data)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password })
    saveAuth(response.data.data)
    return response.data.data
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    saveAuth(response.data.data)
    return response.data.data
  }

  const logout = useCallback(async () => {
    clearAuthSession()
    setLoading(true)
    try {
      const session = await ensureAuthSession(true)
      setUser(session.user)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    isGuest: user?.isGuest ?? true,
    login,
    register,
    logout,
    retry: initialize,
  }
}
