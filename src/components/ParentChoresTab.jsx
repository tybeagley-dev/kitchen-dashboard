import { useState, useEffect, useCallback } from 'react'
import { adminGetAllChores, adminAddChore, adminEditChore, adminDeleteChore } from '../hooks/useChores'
import BuckBadge from './BuckBadge'

const DAYS      = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' }

function emptyChore() {
  return { id: '', label: '', icon: '', bucks: 1, active: true, days: [], frequency: 'daily', required: false, instructions: [] }
}

// ── Chore row in list view ────────────────────────────────────────────────────

function ChoreRow({ chore, onEdit, confirmDelete, onDeleteRequest, onConfirmDelete, onCancelDelete }) {
  if (confirmDelete) {
    return (
      <div className="chore-admin-row deleting">
        <span className="chore-delete-msg">Remove "{chore.label}"?</span>
        <button className="chore-delete-yes" onClick={onConfirmDelete}>Remove</button>
        <button className="chore-delete-no"  onClick={onCancelDelete}>Cancel</button>
      </div>
    )
  }

  return (
    <div className={`chore-admin-row ${chore.active === false ? 'chore-admin-row--inactive' : ''}`}>
      <span className="chore-admin-icon">{chore.icon || '•'}</span>
      <div className="chore-admin-info">
        <span className="chore-admin-label">
          {chore.label}
          {chore.active === false && <span className="chore-inactive-badge"> inactive</span>}
        </span>
        <span className="chore-admin-meta">
          {chore.days.length ? chore.days.map(d => DAY_SHORT[d] ?? d).join(' · ') : 'Any day'}
          {chore.required && ' · Required'}
          {chore.frequency === 'weekly' && ' · Weekly'}
        </span>
      </div>
      <BuckBadge amount={chore.bucks} />
      <button className="chore-admin-edit-btn" onClick={onEdit}>Edit</button>
      <button className="chore-admin-del-btn"  onClick={onDeleteRequest}>×</button>
    </div>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────────────

function ChoreForm({ chore, onSave, onCancel, saving }) {
  const [label,        setLabel]        = useState(chore.label || '')
  const [icon,         setIcon]         = useState(chore.icon || '')
  const [bucks,        setBucks]        = useState(chore.bucks || 1)
  const [active,       setActive]       = useState(chore.active !== false)
  const [days,         setDays]         = useState(chore.days || [])
  const [frequency,    setFrequency]    = useState(chore.frequency || 'daily')
  const [required,     setRequired]     = useState(chore.required || false)
  const [instructions, setInstructions] = useState(
    chore.instructions?.length ? chore.instructions : []
  )

  function toggleDay(day) {
    setDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day])
  }

  function setInstruction(i, val) {
    setInstructions(ins => ins.map((s, j) => j === i ? val : s))
  }

  function removeInstruction(i) {
    setInstructions(ins => ins.filter((_, j) => j !== i))
  }

  function handleSave() {
    if (!label.trim()) return
    onSave({ ...chore, label: label.trim(), icon, bucks, active, days, frequency, required, instructions })
  }

  return (
    <div className="chore-form">
      <div className="chore-form-field">
        <label className="chore-form-label">Label</label>
        <input
          className="chore-form-input"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Clean bathroom"
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
            placeholder="🚿"
          />
        </div>
        <div className="chore-form-field">
          <label className="chore-form-label">Bucks</label>
          <div className="chore-form-toggle">
            <button className={bucks === 1 ? 'active' : ''} onClick={() => setBucks(1)}>1 BB</button>
            <button className={bucks === 2 ? 'active' : ''} onClick={() => setBucks(2)}>2 BB</button>
          </div>
        </div>
      </div>

      <div className="chore-form-field">
        <label className="chore-form-label">Days <span className="chore-form-hint">— leave blank for any day</span></label>
        <div className="chore-form-days">
          {DAYS.map(d => (
            <button
              key={d}
              className={`chore-day-chip ${days.includes(d) ? 'active' : ''}`}
              onClick={() => toggleDay(d)}
            >
              {DAY_SHORT[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="chore-form-row">
        <div className="chore-form-field">
          <label className="chore-form-label">Frequency</label>
          <div className="chore-form-toggle">
            <button className={frequency === 'daily'  ? 'active' : ''} onClick={() => setFrequency('daily')}>Daily</button>
            <button className={frequency === 'weekly' ? 'active' : ''} onClick={() => setFrequency('weekly')}>Weekly</button>
          </div>
        </div>
        <div className="chore-form-field">
          <label className="chore-form-label">Required</label>
          <button
            className={`chore-form-toggle-single ${required ? 'active' : ''}`}
            onClick={() => setRequired(r => !r)}
          >
            {required ? 'Yes — auto-adds' : 'No — spin only'}
          </button>
        </div>
      </div>

      {chore.id && (
        <div className="chore-form-field">
          <label className="chore-form-label">Status</label>
          <button
            className={`chore-form-toggle-single ${active ? 'active' : ''}`}
            onClick={() => setActive(a => !a)}
          >
            {active ? 'Active — shows on wheel' : 'Inactive — hidden from wheel'}
          </button>
        </div>
      )}

      <div className="chore-form-field">
        <label className="chore-form-label">Steps <span className="chore-form-hint">— optional instructions shown to kids</span></label>
        {instructions.map((step, i) => (
          <div key={i} className="chore-step-row">
            <input
              className="chore-form-input"
              value={step}
              onChange={e => setInstruction(i, e.target.value)}
              placeholder={`Step ${i + 1}`}
            />
            <button className="chore-step-remove" onClick={() => removeInstruction(i)}>×</button>
          </div>
        ))}
        <button className="chore-step-add" onClick={() => setInstructions(ins => [...ins, ''])}>
          + Add step
        </button>
      </div>

      <div className="chore-form-actions">
        <button
          className="parent-apply-btn"
          onClick={handleSave}
          disabled={saving || !label.trim()}
        >
          {saving ? 'Saving…' : (chore.id ? 'Save Changes' : 'Add Chore')}
        </button>
        <button className="btn-cancel-spend" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Tab root ──────────────────────────────────────────────────────────────────

export default function ParentChoresTab() {
  const [chores,        setChores]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [form,          setForm]          = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await adminGetAllChores()
    setChores(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data) {
    setSaving(true)
    if (data.id) await adminEditChore(data)
    else         await adminAddChore(data)
    setSaving(false)
    await load()
    setForm(null)
  }

  async function handleDelete(id) {
    await adminDeleteChore(id)
    setDeleteConfirm(null)
    await load()
  }

  if (form !== null) {
    return (
      <ChoreForm
        chore={form}
        onSave={handleSave}
        onCancel={() => setForm(null)}
        saving={saving}
      />
    )
  }

  const active   = chores.filter(c => c.active !== false)
  const inactive = chores.filter(c => c.active === false)

  return (
    <div className="parent-chores-tab">
      <button className="parent-add-chore-btn" onClick={() => setForm(emptyChore())}>
        + Add Chore
      </button>

      {loading && <p className="parent-soon-msg">Loading chores…</p>}

      {!loading && chores.length === 0 && (
        <p className="parent-soon-msg">No chores yet. Add one above.</p>
      )}

      {!loading && active.map(chore => (
        <ChoreRow
          key={chore.id}
          chore={chore}
          confirmDelete={deleteConfirm === chore.id}
          onEdit={() => setForm({ ...chore, instructions: chore.instructions ?? [] })}
          onDeleteRequest={() => setDeleteConfirm(chore.id)}
          onConfirmDelete={() => handleDelete(chore.id)}
          onCancelDelete={() => setDeleteConfirm(null)}
        />
      ))}

      {!loading && inactive.length > 0 && (
        <>
          <p className="chore-inactive-heading">Inactive</p>
          {inactive.map(chore => (
            <ChoreRow
              key={chore.id}
              chore={chore}
              confirmDelete={deleteConfirm === chore.id}
              onEdit={() => setForm({ ...chore, instructions: chore.instructions ?? [] })}
              onDeleteRequest={() => setDeleteConfirm(chore.id)}
              onConfirmDelete={() => handleDelete(chore.id)}
              onCancelDelete={() => setDeleteConfirm(null)}
            />
          ))}
        </>
      )}
    </div>
  )
}
