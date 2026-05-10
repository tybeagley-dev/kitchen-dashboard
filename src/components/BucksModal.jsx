import { useState, useEffect } from 'react'
import { useChorePoints } from '../hooks/useChores'
import { useMomStore, buyMomStoreItem } from '../hooks/useMomStore'
import BuckBadge from './BuckBadge'

const PHASE = { VIEW: 'view', STORE: 'store', CONFIRM: 'confirm' }

export default function BucksModal({ child, onClose }) {
  const { bucks, adjustBucks } = useChorePoints(child.name)
  const { items, loading }     = useMomStore()
  const [phase,       setPhase]       = useState(PHASE.VIEW)
  const [selected,    setSelected]    = useState(null)
  const [buying,      setBuying]      = useState(false)
  const [askedItemId, setAskedItemId] = useState(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleBuy() {
    setBuying(true)
    const result = await buyMomStoreItem(child.name, selected.id)
    if (result?.success) adjustBucks(-selected.cost)
    setBuying(false)
    onClose()
  }

  function handleItemTap(item) {
    if (item.requiresApproval) {
      setAskedItemId(item.id === askedItemId ? null : item.id)
      return
    }
    if (bucks < item.cost) return
    setSelected(item)
    setPhase(PHASE.CONFIRM)
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card bucks-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-child-header">
          <div className="modal-avatar" style={{ background: child.color }}>
            {child.emoji}
          </div>
          <div>
            <h2 className="modal-title">{child.name}'s Bucks</h2>
            <p className="bucks-modal-balance"><BuckBadge amount={bucks} /> Beagley Bucks</p>
          </div>
        </div>

        {phase === PHASE.VIEW && (
          <div className="bucks-view-phase">
            <div className="bucks-big-balance">{bucks}</div>
            <p className="bucks-big-label">Beagley Bucks</p>
            <button
              className="btn-spend"
              onClick={() => setPhase(PHASE.STORE)}
              disabled={items.length === 0 && !loading}
            >
              Spend Beagley Bucks
            </button>
          </div>
        )}

        {phase === PHASE.STORE && (
          <div className="store-phase">
            <p className="store-heading">Mom Store</p>
            {loading && <p className="parent-soon-msg">Loading…</p>}
            {!loading && items.length === 0 && (
              <p className="parent-soon-msg">No items in the store yet.</p>
            )}
            <div className="store-grid">
              {items.map(item => {
                const canAfford   = bucks >= item.cost
                const isAsked     = askedItemId === item.id
                return (
                  <div
                    key={item.id}
                    className={`store-card ${!canAfford && !item.requiresApproval ? 'store-card--unaffordable' : ''} ${item.requiresApproval ? 'store-card--ask' : ''}`}
                    onClick={() => handleItemTap(item)}
                  >
                    <span className="store-card-icon">{item.icon || '🎁'}</span>
                    <span className="store-card-label">{item.label}</span>
                    <BuckBadge amount={item.cost} />
                    {item.requiresApproval ? (
                      <span className="store-card-ask-badge">
                        {isAsked ? '👋 Ask a parent!' : 'Ask a grown up'}
                      </span>
                    ) : !canAfford ? (
                      <span className="store-card-need">
                        Need {item.cost - bucks} more BB
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <button className="btn-cancel-spend" onClick={() => setPhase(PHASE.VIEW)}>
              Back
            </button>
          </div>
        )}

        {phase === PHASE.CONFIRM && selected && (
          <div className="bucks-spend-phase">
            <p className="spend-prompt">Spend Beagley Bucks?</p>
            <div className="store-confirm-item">
              <span className="store-confirm-icon">{selected.icon || '🎁'}</span>
              <span className="store-confirm-label">{selected.label}</span>
            </div>
            <p className="spend-remaining">
              Bucks after: <BuckBadge amount={Math.max(0, bucks - selected.cost)} size="lg" />
            </p>
            <div className="spend-actions">
              <button
                className="btn-confirm-spend"
                onClick={handleBuy}
                disabled={buying}
              >
                {buying ? 'Buying…' : `✓ Spend ${selected.cost} BB`}
              </button>
              <button className="btn-cancel-spend" onClick={() => setPhase(PHASE.STORE)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
