import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const BUCKS_KEY = 'fam_dash_bucks'

function getLocalBucks() {
  return JSON.parse(localStorage.getItem(BUCKS_KEY) ?? '{}')
}

function saveLocalBucks(obj) {
  localStorage.setItem(BUCKS_KEY, JSON.stringify(obj))
}

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

// ── Chore pool ────────────────────────────────────────────────────────────────

export function useChores() {
  const [chores, setChores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!CONFIG.appsScriptUrl) {
        setChores(CONFIG.demoChores)
        setLoading(false)
        return
      }
      try {
        const data = await sheetsGet({ action: 'getChores' })
        setChores(data ?? CONFIG.demoChores)
      } catch {
        setChores(CONFIG.demoChores)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { chores, loading }
}

// ── Beagley Bucks ─────────────────────────────────────────────────────────────

export function useChorePoints(childName) {
  const [bucks, setBucks] = useState(() => getLocalBucks()[childName] ?? 0)

  // Hydrate from Sheets on mount
  useEffect(() => {
    async function load() {
      const data = await sheetsGet({ action: 'getBucks' })
      if (!data) return
      const row = data.find(d => d.child === childName)
      if (row) {
        setBucks(row.bucks)
        const local = getLocalBucks()
        local[childName] = row.bucks
        saveLocalBucks(local)
      }
    }
    load()
  }, [childName])

  const recordCompletion = useCallback(async (child, choreId, bucksEarned) => {
    setBucks(b => {
      const next = b + bucksEarned
      const local = getLocalBucks()
      local[child] = next
      saveLocalBucks(local)
      return next
    })

    const result = await sheetsGet({ action: 'completeChore', child, choreId })
    return result ?? { success: true, bucksEarned }
  }, [])

  const adjustBucks = useCallback((delta) => {
    setBucks(b => {
      const next = Math.max(0, b + delta)
      const local = getLocalBucks()
      local[childName] = next
      saveLocalBucks(local)
      return next
    })

    sheetsGet({ action: 'adjustBucks', child: childName, delta })
  }, [childName])

  return { bucks, recordCompletion, adjustBucks }
}
