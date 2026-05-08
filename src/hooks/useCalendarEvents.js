import { useState, useEffect } from 'react'
import { CONFIG } from '../config/config'

export function useCalendarEvents() {
  const [events, setEvents] = useState(CONFIG.events ?? [])

  useEffect(() => {
    if (!CONFIG.appsScriptUrl) return
    async function load() {
      try {
        const url = new URL(CONFIG.appsScriptUrl)
        url.searchParams.set('action', 'getCalendarEvents')
        url.searchParams.set('_t', Date.now())
        const res  = await fetch(url.toString())
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setEvents(data)
      } catch {
        // fall back to CONFIG.events already set as initial state
      }
    }
    load()
  }, [])

  return events
}
