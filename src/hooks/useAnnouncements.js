import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const KEY = 'fam_dash_announcements'

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

function configFallback() {
  return (CONFIG.announcements ?? []).map((text, i) => ({ id: `cfg-${i}`, text }))
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? configFallback()
  } catch {
    return configFallback()
  }
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState(loadLocal)

  useEffect(() => {
    async function hydrate() {
      const data = await sheetsGet({ action: 'getAnnouncements' })
      if (!Array.isArray(data)) return
      localStorage.setItem(KEY, JSON.stringify(data))
      setAnnouncements(data)
    }
    hydrate()
  }, [])

  const addAnnouncement = useCallback(async (text) => {
    const id   = 'a' + Date.now()
    const item = { id, text }
    setAnnouncements(prev => {
      const next = [...prev, item]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
    await sheetsGet({ action: 'addAnnouncement', id, text: encodeURIComponent(text) })
  }, [])

  const removeAnnouncement = useCallback(async (id) => {
    setAnnouncements(prev => {
      const next = prev.filter(a => a.id !== id)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
    await sheetsGet({ action: 'removeAnnouncement', id })
  }, [])

  return { announcements, addAnnouncement, removeAnnouncement }
}
