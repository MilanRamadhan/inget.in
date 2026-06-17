'use client'
import { useState, useEffect, useCallback } from 'react'
import { authApi, setAccessToken } from '../lib/api'
import { User, AuthResponse } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
    if (stored && refreshToken) {
      setUser(JSON.parse(stored))
      refreshAccessToken(refreshToken)
    } else {
      setLoading(false)
    }
  }, [])

  const refreshAccessToken = async (token: string) => {
    try {
      const res = await authApi.refresh(token)
      const { accessToken, refreshToken: newRefresh } = res.data.data
      setAccessToken(accessToken)
      localStorage.setItem('refreshToken', newRefresh)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const saveAuth = (data: AuthResponse) => {
    setUser(data.user)
    setAccessToken(data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password })
    saveAuth(res.data.data)
    return res.data.data
  }

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    saveAuth(res.data.data)
    return res.data.data
  }

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
  }, [])

  return { user, loading, login, register, logout }
}
