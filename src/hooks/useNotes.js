import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const KEY = 'fam_dash_notes'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

function loadLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (Array.isArray(data)) return data
  } catch {}
  // Fall back to config announcements
  return (CONFIG.announcements ?? []).map(text => ({ id: genId(), text }))
}

function saveLocal(notes) {
  localStorage.setItem(KEY, JSON.stringify(notes))
}

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export function useNotes() {
  const [notes, setNotes] = useState(loadLocal)

  useEffect(() => {
    async function hydrate() {
      const data = await sheetsGet({ action: 'getNotes' })
      if (!Array.isArray(data)) return
      // Only replace local if sheet has data, so initial empty sheet
      // doesn't wipe out config announcements on first load
      if (data.length > 0) {
        saveLocal(data)
        setNotes(data)
      }
    }
    hydrate()
  }, [])

  const addNote = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const entry = { id: genId(), text: trimmed }
    setNotes(prev => {
      const next = [...prev, entry]
      saveLocal(next)
      return next
    })
    sheetsGet({ action: 'addNote', id: entry.id, text: encodeURIComponent(entry.text) })
  }, [])

  const removeNote = useCallback((id) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id)
      saveLocal(next)
      return next
    })
    sheetsGet({ action: 'removeNote', id })
  }, [])

  return { notes, addNote, removeNote }
}
