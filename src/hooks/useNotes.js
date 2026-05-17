import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiDelete } from '../utils/api'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

export function useNotes() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    apiGet('/notes').then(data => {
      if (Array.isArray(data)) setNotes(data)
    })
  }, [])

  const addNote = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const entry = { id: genId(), text: trimmed }
    setNotes(prev => [...prev, entry])
    apiPost('/notes', entry)
  }, [])

  const removeNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    apiDelete(`/notes/${id}`)
  }, [])

  return { notes, addNote, removeNote }
}
