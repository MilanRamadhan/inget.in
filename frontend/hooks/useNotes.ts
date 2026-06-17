'use client'
import { useState, useCallback } from 'react'
import { notesApi } from '../lib/api'
import { Note } from '../types'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(
    async (filters?: { category?: string; date?: string; done?: string }) => {
      setLoading(true)
      setError(null)
      try {
        const res = await notesApi.getAll(filters)
        setNotes(res.data.data)
      } catch (e: any) {
        setError(e.response?.data?.message || 'Gagal memuat catatan')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const createNote = useCallback(async (data: object) => {
    const res = await notesApi.create(data)
    const newNote = res.data.data
    setNotes((prev) => [newNote, ...prev])
    return newNote
  }, [])

  const updateNote = useCallback(async (id: string, data: object) => {
    const res = await notesApi.update(id, data)
    const updated = res.data.data
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
    return updated
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    await notesApi.delete(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const toggleDone = useCallback(async (id: string) => {
    const res = await notesApi.toggleDone(id)
    const updated = res.data.data
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
    return updated
  }, [])

  return { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote, toggleDone }
}
