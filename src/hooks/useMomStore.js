import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export function useMomStore() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await sheetsGet({ action: 'getMomStore' })
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { items, loading, reload: load }
}

export async function buyMomStoreItem(child, itemId) {
  return sheetsGet({ action: 'buyMomStoreItem', child, itemId })
}

export function usePurchases(childName) {
  const [purchases, setPurchases] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const params = { action: 'getPurchases' }
    if (childName) params.child = childName
    const data = await sheetsGet(params)
    setPurchases(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [childName])

  useEffect(() => { load() }, [load])

  return { purchases, loading, reload: load }
}

export async function redeemPurchase(id) {
  return sheetsGet({ action: 'redeemPurchase', id })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminGetAllMomStoreItems() {
  if (!CONFIG.appsScriptUrl) return []
  const data = await sheetsGet({ action: 'getMomStore', includeInactive: 'true' })
  return Array.isArray(data) ? data : []
}

export async function adminAddMomStoreItem(data) {
  return sheetsGet({
    action:           'addMomStoreItem',
    label:            encodeURIComponent(data.label),
    icon:             encodeURIComponent(data.icon),
    cost:             data.cost,
    requiresApproval: data.requiresApproval ? 'true' : 'false',
  })
}

export async function adminEditMomStoreItem(data) {
  return sheetsGet({
    action:           'editMomStoreItem',
    id:               data.id,
    label:            encodeURIComponent(data.label),
    icon:             encodeURIComponent(data.icon),
    cost:             data.cost,
    requiresApproval: data.requiresApproval ? 'true' : 'false',
    active:           data.active !== false ? 'true' : 'false',
  })
}

export async function adminDeleteMomStoreItem(id) {
  return sheetsGet({ action: 'deleteMomStoreItem', id })
}
