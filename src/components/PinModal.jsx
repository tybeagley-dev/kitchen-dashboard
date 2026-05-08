import { useState, useEffect } from 'react'
import { CONFIG } from '../config/config'

const PIN_LENGTH = 6

export default function PinModal({ onSuccess, onCancel, prompt = 'Adult PIN required' }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function handleDigit(d) {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === PIN_LENGTH) {
      if (next === (CONFIG.parentPin ?? '052115')) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => setPin(''), 600)
      }
    }
  }

  function handleBackspace() {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card pin-modal">
        <button className="modal-close" onClick={onCancel} aria-label="Close">×</button>
        <div className="bucks-pin-phase">
          <p className="pin-prompt">{prompt}</p>
          <div className={`pin-dots ${error ? 'pin-error' : ''}`}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
            ))}
          </div>
          {error && <p className="pin-error-msg">Incorrect PIN</p>}
          <div className="numpad">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              k === '' ? <div key={i} /> :
              <button
                key={i}
                className="numpad-key"
                onClick={() => k === '⌫' ? handleBackspace() : handleDigit(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
