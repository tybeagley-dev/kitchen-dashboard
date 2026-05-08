import { useState, useEffect } from 'react'

const DAY_SHORT = { Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' }

export default function MealsEditModal({ meals, dayOrder, onSave, onClose }) {
  const [draft, setDraft] = useState(() =>
    dayOrder.map(day => {
      const m = meals.find(m => m.day === day) ?? { day, main: '', note: '' }
      return { day, main: m.main, note: m.note }
    })
  )

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleChange(day, field, value) {
    setDraft(prev => prev.map(m => m.day === day ? { ...m, [field]: value } : m))
  }

  function handleSave() {
    onSave(draft)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card meals-edit-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="modal-title">Edit Meal Plan</h2>

        <div className="meals-edit-list">
          {draft.map(({ day, main, note }) => (
            <div key={day} className="meals-edit-row">
              <span className="meals-edit-day">{DAY_SHORT[day]}</span>
              <div className="meals-edit-fields">
                <input
                  className="meals-edit-input meals-edit-main"
                  type="text"
                  placeholder="Main dish"
                  value={main}
                  onChange={e => handleChange(day, 'main', e.target.value)}
                />
                <input
                  className="meals-edit-input meals-edit-note"
                  type="text"
                  placeholder="Note (optional)"
                  value={note}
                  onChange={e => handleChange(day, 'note', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="meals-edit-actions">
          <button className="btn-confirm-spend" onClick={handleSave}>
            ✓ Save Meal Plan
          </button>
          <button className="btn-cancel-spend" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
