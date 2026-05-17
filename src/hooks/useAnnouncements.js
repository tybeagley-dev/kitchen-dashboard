import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiDelete } from '../utils/api'

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    apiGet('/announcements').then(data => {
      if (Array.isArray(data)) setAnnouncements(data)
    })
  }, [])

  const addAnnouncement = useCallback((text) => {
    const id   = 'a' + Date.now()
    const item = { id, text }
    setAnnouncements(prev => [...prev, item])
    apiPost('/announcements', item)
  }, [])

  const removeAnnouncement = useCallback((id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    apiDelete(`/announcements/${id}`)
  }, [])

  return { announcements, addAnnouncement, removeAnnouncement }
}
