import { useEffect } from 'react'
import { useScreenBalance, startChildTimer } from '../hooks/useScreenTime'

export default function ScreenTimeModal({ child, onClose }) {
  const { balance } = useScreenBalance(child.name)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleStart() {
    startChildTimer(child.name)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card st-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-child-header">
          <div className="modal-avatar" style={{ background: child.color }}>
            {child.emoji}
          </div>
          <div>
            <h2 className="modal-title">{child.name}</h2>
            <p className="modal-points-line">Screen Time Balance</p>
          </div>
        </div>

        <div className="st-balance-display">
          <span className="st-balance-num">{balance}</span>
          <span className="st-balance-unit">min banked</span>
        </div>

        {balance > 0 ? (
          <button className="btn-start-timer st-start" onClick={handleStart}>
            Start Timer
          </button>
        ) : (
          <p className="st-empty">
            No screen time banked yet — complete a chore to earn some!
          </p>
        )}
      </div>
    </div>
  )
}
