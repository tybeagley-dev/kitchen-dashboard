import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const KEY = 'fam_dash_grocery'

// Items are stored as [{ id, item }] objects so Sheets can identify rows by id.
function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    // Migrate old string-array format
    if (Array.isArray(parsed.items)) {
      if (parsed.items.length === 0) return []
      if (typeof parsed.items[0] === 'string') {
        return parsed.items.map((item, i) => ({ id: String(Date.now() + i), item }))
      }
      return parsed.items
    }
    return []
  } catch {
    return []
  }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify({ items }))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export function useGroceryList() {
  const [items, setItems] = useState(load)

  // Hydrate from Sheets on mount
  useEffect(() => {
    async function hydrate() {
      const data = await sheetsGet({ action: 'getGrocery' })
      if (!Array.isArray(data)) return
      save(data)
      setItems(data)
    }
    hydrate()
  }, [])

  const addItem = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const entry = { id: genId(), item: trimmed }
    setItems(prev => {
      const next = [...prev, entry]
      save(next)
      return next
    })
    sheetsGet({ action: 'addGroceryItem', id: entry.id, item: entry.item })
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      save(next)
      return next
    })
    sheetsGet({ action: 'removeGroceryItem', id })
  }, [])

  const clearAll = useCallback(() => {
    save([])
    setItems([])
    sheetsGet({ action: 'clearGrocery' })
  }, [])

  return { items, addItem, removeItem, clearAll }
}
