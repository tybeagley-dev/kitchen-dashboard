import { useState, useRef } from 'react'
import { useGroceryList } from '../hooks/useGroceryList'
import { useNotes } from '../hooks/useNotes'
import PinModal from './PinModal'

export default function NotesAndGrocery() {
  const [tab, setTab] = useState('notes')

  // Notes
  const { notes, addNote, removeNote } = useNotes()
  const [notesEditing, setNotesEditing] = useState(false)
  const [showNotePin, setShowNotePin]   = useState(false)
  const [noteDraft, setNoteDraft]       = useState('')
  const noteInputRef = useRef(null)

  // Grocery
  const { items, addItem, removeItem, clearAll } = useGroceryList()
  const [draft, setDraft]           = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const inputRef = useRef(null)

  // ── Grocery handlers ──
  function handleAdd() {
    if (!draft.trim()) return
    addItem(draft)
    setDraft('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  function handleClear() {
    if (confirmClear) {
      clearAll()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  // ── Notes handlers ──
  function handleAddNote() {
    if (!noteDraft.trim()) return
    addNote(noteDraft)
    setNoteDraft('')
    noteInputRef.current?.focus()
  }

  function handleNoteKeyDown(e) {
    if (e.key === 'Enter') handleAddNote()
  }

  return (
    <>
      <section className="card notes-grocery-card">
        <div className="ng-tabs">
          <button
            className={`ng-tab ${tab === 'notes' ? 'active' : ''}`}
            onClick={() => setTab('notes')}
          >
            Notes
          </button>
          <button
            className={`ng-tab ${tab === 'grocery' ? 'active' : ''}`}
            onClick={() => setTab('grocery')}
          >
            Grocery {items.length > 0 && <span className="grocery-count">{items.length}</span>}
          </button>
        </div>

        {/* Notes tab */}
        {tab === 'notes' && (
          <div className="notes-panel">
            <div className="notes-panel-actions">
              {notesEditing ? (
                <button className="notes-done-btn" onClick={() => setNotesEditing(false)}>Done</button>
              ) : (
                <button className="card-edit-btn" onClick={() => setShowNotePin(true)} aria-label="Edit notes">✏️</button>
              )}
            </div>

            <ul className="announcement-list">
              {notes.map(note => (
                <li key={note.id} className="announcement-item">
                  <span className="announcement-dot">›</span>
                  <span className="announcement-text">{note.text}</span>
                  {notesEditing && (
                    <button
                      className="note-remove-btn"
                      onClick={() => removeNote(note.id)}
                      aria-label="Remove note"
                    >×</button>
                  )}
                </li>
              ))}
              {notes.length === 0 && (
                <p className="ng-empty">No notes right now</p>
              )}
            </ul>

            {notesEditing && (
              <div className="grocery-input-row">
                <input
                  ref={noteInputRef}
                  className="grocery-input"
                  type="text"
                  placeholder="Add a note…"
                  value={noteDraft}
                  onChange={e => setNoteDraft(e.target.value)}
                  onKeyDown={handleNoteKeyDown}
                />
                <button className="grocery-add-btn" onClick={handleAddNote}>Add</button>
              </div>
            )}
          </div>
        )}

        {/* Grocery tab */}
        {tab === 'grocery' && (
          <div className="grocery-panel">
            <div className="grocery-input-row">
              <input
                ref={inputRef}
                className="grocery-input"
                type="text"
                placeholder="Add an item…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="grocery-add-btn" onClick={handleAdd}>Add</button>
            </div>

            <ul className="grocery-list">
              {items.map(entry => (
                <li key={entry.id} className="grocery-item">
                  <span className="grocery-item-text">{entry.item}</span>
                  <button
                    className="grocery-remove"
                    onClick={() => removeItem(entry.id)}
                    aria-label={`Remove ${entry.item}`}
                  >×</button>
                </li>
              ))}
              {items.length === 0 && (
                <p className="ng-empty">Nothing on the list yet</p>
              )}
            </ul>

            {items.length > 0 && (
              <div className="grocery-actions">
                <button
                  className={`grocery-clear-btn ${confirmClear ? 'confirm' : ''}`}
                  onClick={handleClear}
                >
                  {confirmClear ? 'Tap again to clear' : 'Clear All'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {showNotePin && (
        <PinModal
          prompt="Enter PIN to edit notes"
          onSuccess={() => { setShowNotePin(false); setNotesEditing(true) }}
          onCancel={() => setShowNotePin(false)}
        />
      )}
    </>
  )
}
