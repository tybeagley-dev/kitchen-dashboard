import { useState, useEffect } from 'react'
import { CONFIG } from '../config/config'
import { apiGet } from '../utils/api'

export function useCalendarEvents() {
  const [events, setEvents] = useState(CONFIG.events ?? [])

  useEffect(() => {
    apiGet('/calendar/events').then(data => {
      if (Array.isArray(data) && data.length > 0) setEvents(data)
    })
  }, [])

  return events
}
