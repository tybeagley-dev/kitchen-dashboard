import { useState, useEffect, useCallback } from 'react'
import { adminGetAllMomStoreItems, adminAddMomStoreItem, adminEditMomStoreItem, adminDeleteMomStoreItem } from '../hooks/useMomStore'
import BuckBadge from './BuckBadge'

function emptyItem() {
  return { id: '', label: '', icon: '', cost: 5, requiresApproval: false, active: true }
}

// ── Item row ──────────────────────────────────────────────────────────────────

function StoreRow({ item, onEdit, confirmDelete, onDeleteRequest, onConfirmDelete, onCancelDelete }) {
  if (confirmDelete) {
    return (
      <div className="chore-admin-row deleting">
        <span className="chore-delete-msg">Remove "{item.label}"?</span>
        <button className="chore-delete-yes" onClick={onConfirmDelete}>Remove</button>
        <button className="chore-delete-no"  onClick={onCancelDelete}>Cancel</button>
      </div>
    )
  }

  return (
    <div className={`chore-admin-row ${item.active === false ? 'chore-admin-row--inactive' : ''}`}>
      <span className="chore-admin-icon">{item.icon || '🎁'}</span>
      <div className="chore-admin-info">
        <span className="chore-admin-label">
          {item.label}
          {item.active === false && <span className="chore-inactive-badge"> inactive</span>}
        </span>
        <span className="chore-admin-meta">
          {item.requiresApproval ? 'Requires approval' : 'Self-purchase'}
        </span>
      </div>
      <BuckBadge amount={item.cost} />
      <button className="chore-admin-edit-btn" onClick={onEdit}>Edit</button>
      <button className="chore-admin-del-btn"  onClick={onDeleteRequest}>×</button>
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────

function StoreForm({ item, onSave, onCancel, saving }) {
  const [label,            setLabel]            = useState(item.label || '')
  const [icon,             setIcon]             = useState(item.icon || '')
  const [cost,             setCost]             = useState(item.cost ?? 5)
  const [requiresApproval, setRequiresApproval] = useState(item.requiresApproval ?? false)
  const [active,           setActive]           = useState(item.active !== false)

  function handleSave() {
    if (!label.trim()) return
    onSave({ ...item, label: label.trim(), icon, cost, requiresApproval, active })
  }

  return (
    <div className="chore-form">
      <div className="chore-form-field">
        <label className="chore-form-label">Label</label>
        <input
          className="chore-form-input"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="30 min later bedtime"
          autoFocus
        />
      </div>

      <div className="chore-form-row">
        <div className="chore-form-field">
          <label className="chore-form-label">Icon</label>
          <input
            className="chore-form-input chore-form-icon-input"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            placeholder="🌙"
          />
        </div>
        <div className="chore-form-field">
          <label className="chore-form-label">Cost (BB)</label>
          <input
            className="chore-form-input"
            type="number"
            min="1"
            value={cost}
            onChange={e => setCost(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="chore-form-field">
        <label className="chore-form-label">Purchase type</label>
        <div className="chore-form-toggle">
          <button
            className={!requiresApproval ? 'active' : ''}
            onClick={() => setRequiresApproval(false)}
          >
            Self-purchase
          </button>
          <button
            className={requiresApproval ? 'active' : ''}
            onClick={() => setRequiresApproval(true)}
          >
            Ask a grown up
          </button>
        </div>
        <p className="chore-form-hint" style={{ marginTop: 4 }}>
          {requiresApproval
            ? 'Kids see the item and are prompted to ask a parent. No automatic deduction.'
            : 'Kids can purchase this on their own. Bucks deducted immediately.'}
        </p>
      </div>

      {item.id && (
        <div className="chore-form-field">
          <label className="chore-form-label">Status</label>
          <button
            className={`chore-form-toggle-single ${active ? 'active' : ''}`}
            onClick={() => setActive(a => !a)}
          >
            {active ? 'Active — visible in store' : 'Inactive — hidden from kids'}
          </button>
        </div>
      )}

      <div className="chore-form-actions">
        <button
          className="parent-apply-btn"
          onClick={handleSave}
          disabled={saving || !label.trim()}
        >
          {saving ? 'Saving…' : (item.id ? 'Save Changes' : 'Add Item')}
        </button>
        <button className="btn-cancel-spend" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Tab root ──────────────────────────────────────────────────────────────────

export default function ParentMomStoreTab() {
  const [items,         setItems]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [form,          setForm]          = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await adminGetAllMomStoreItems()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data) {
    setSaving(true)
    if (data.id) await adminEditMomStoreItem(data)
    else         await adminAddMomStoreItem(data)
    setSaving(false)
    await load()
    setForm(null)
  }

  async function handleDelete(id) {
    await adminDeleteMomStoreItem(id)
    setDeleteConfirm(null)
    await load()
  }

  if (form !== null) {
    return (
      <StoreForm
        item={form}
        onSave={handleSave}
        onCancel={() => setForm(null)}
        saving={saving}
      />
    )
  }

  const active   = items.filter(i => i.active !== false)
  const inactive = items.filter(i => i.active === false)

  return (
    <div className="parent-chores-tab">
      <button className="parent-add-chore-btn" onClick={() => setForm(emptyItem())}>
        + Add Item
      </button>

      {loading && <p className="parent-soon-msg">Loading store…</p>}

      {!loading && items.length === 0 && (
        <p className="parent-soon-msg">No items yet. Add one above.</p>
      )}

      {!loading && active.map(item => (
        <StoreRow
          key={item.id}
          item={item}
          confirmDelete={deleteConfirm === item.id}
          onEdit={() => setForm({ ...item })}
          onDeleteRequest={() => setDeleteConfirm(item.id)}
          onConfirmDelete={() => handleDelete(item.id)}
          onCancelDelete={() => setDeleteConfirm(null)}
        />
      ))}

      {!loading && inactive.length > 0 && (
        <>
          <p className="chore-inactive-heading">Inactive</p>
          {inactive.map(item => (
            <StoreRow
              key={item.id}
              item={item}
              confirmDelete={deleteConfirm === item.id}
              onEdit={() => setForm({ ...item })}
              onDeleteRequest={() => setDeleteConfirm(item.id)}
              onConfirmDelete={() => handleDelete(item.id)}
              onCancelDelete={() => setDeleteConfirm(null)}
            />
          ))}
        </>
      )}
    </div>
  )
}
