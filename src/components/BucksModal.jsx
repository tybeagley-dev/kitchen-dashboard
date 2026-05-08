import { useState, useEffect } from 'react'
import { useChorePoints } from '../hooks/useChores'
import PinModal from './PinModal'

const PHASE = { VIEW: 'view', PIN: 'pin', ADJUST: 'adjust' }

export default function BucksModal({ child, onClose }) {
  const { bucks, adjustBucks } = useChorePoints(child.name)
  const [phase, setPhase]   = useState(PHASE.VIEW)
  const [amount, setAmount] = useState(1)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function decrement() {
    setAmount(a => {
      const next = a - 1
      return next === 0 ? -1 : Math.max(-bucks, next)
    })
  }

  function increment() {
    setAmount(a => {
      const next = a + 1
      return next === 0 ? 1 : next
    })
  }

  function handleConfirm() {
    adjustBucks(amount)
    onClose()
  }

  const isAdding    = amount > 0
  const resultBucks = Math.max(0, bucks + amount)

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
            <p className="bucks-modal-balance">🪙 {bucks} Beagley Bucks</p>
          </div>
        </div>

        {phase === PHASE.VIEW && (
          <div className="bucks-view-phase">
            <div className="bucks-big-balance">{bucks}</div>
            <p className="bucks-big-label">Beagley Bucks</p>
            <button
              className="btn-spend"
              onClick={() => { setAmount(1); setPhase(PHASE.PIN) }}
            >
              Adjust 🪙
            </button>
          </div>
        )}

        {phase === PHASE.PIN && (
          <PinModal
            prompt="Adult PIN required"
            onSuccess={() => setPhase(PHASE.ADJUST)}
            onCancel={() => setPhase(PHASE.VIEW)}
          />
        )}

        {phase === PHASE.ADJUST && (
          <div className="bucks-spend-phase">
            <p className="spend-prompt">Adjust Beagley Bucks</p>
            <div className="spend-stepper">
              <button
                className="stepper-btn"
                onClick={decrement}
                disabled={amount <= -bucks && bucks > 0}
              >−</button>
              <span className={`stepper-value adjust-value ${isAdding ? 'adding' : 'deducting'}`}>
                {amount > 0 ? `+${amount}` : amount}
              </span>
              <button className="stepper-btn" onClick={increment}>+</button>
            </div>
            <p className="spend-remaining">
              Balance after: <strong>🪙 {resultBucks}</strong>
            </p>
            <div className="spend-actions">
              <button
                className={`btn-confirm-spend ${isAdding ? 'btn-confirm-add' : ''}`}
                onClick={handleConfirm}
                disabled={amount === 0}
              >
                {isAdding ? `✓ Add ${amount} BB` : `✓ Deduct ${Math.abs(amount)} BB`}
              </button>
              <button className="btn-cancel-spend" onClick={() => setPhase(PHASE.VIEW)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
