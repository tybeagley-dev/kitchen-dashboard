import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'

export function useMomStore() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await apiGet('/mom-store')
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { items, loading, reload: load }
}

export async function buyMomStoreItem(child, itemId) {
  return apiPost(`/mom-store/${itemId}/buy`, { child })
}

export function usePurchases(childName) {
  const [purchases, setPurchases] = useState([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const path = childName
      ? `/mom-store/purchases?child=${childName}`
      : '/mom-store/purchases'
    const data = await apiGet(path)
    setPurchases(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [childName])

  useEffect(() => { load() }, [load])

  return { purchases, loading, reload: load }
}

export async function redeemPurchase(id) {
  return apiPost(`/mom-store/purchases/${id}/redeem`, {}, CONFIG.parentPin)
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminGetAllMomStoreItems() {
  const data = await apiGet('/mom-store?includeInactive=true')
  return Array.isArray(data) ? data : []
}

export async function adminAddMomStoreItem(data) {
  return apiPost('/mom-store', {
    id:               data.id || Date.now().toString(36),
    label:            data.label,
    icon:             data.icon,
    cost:             data.cost,
    requires_approval: data.requiresApproval ?? false,
  }, CONFIG.parentPin)
}

export async function adminEditMomStoreItem(data) {
  return apiPut(`/mom-store/${data.id}`, {
    label:            data.label,
    icon:             data.icon,
    cost:             data.cost,
    requires_approval: data.requiresApproval ?? false,
    active:           data.active !== false,
  }, CONFIG.parentPin)
}

export async function adminDeleteMomStoreItem(id) {
  return apiDelete(`/mom-store/${id}`, CONFIG.parentPin)
}
