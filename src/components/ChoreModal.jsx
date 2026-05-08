import { useState, useEffect } from 'react'
import SpinningWheel from './SpinningWheel'
import { useChores, useChorePoints } from '../hooks/useChores'
import { useScreenBalance, startChildTimer } from '../hooks/useScreenTime'
import { CONFIG } from '../config/config'

const PHASE = {
  READY:  'ready',
  RESULT: 'result',
  DONE:   'done',
}

export default function ChoreModal({ child, onClose }) {
  const { chores, loading } = useChores()
  const { bucks, recordCompletion } = useChorePoints(child.name)
  const { balance, addMinutes } = useScreenBalance(child.name)

  const [phase, setPhase] = useState(PHASE.READY)
  const [selectedChore, setSelectedChore] = useState(null)
  const [earned, setEarned] = useState(0)
  const [screenEarned] = useState(CONFIG.screenTime?.minutesPerChore ?? 30)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSpinEnd(chore) {
    setSelectedChore(chore)
    setPhase(PHASE.RESULT)
  }

  async function handleComplete() {
    const result = await recordCompletion(child.name, selectedChore.id, selectedChore.bucks)
    setEarned(result.bucksEarned ?? selectedChore.bucks)
    addMinutes(screenEarned)
    setPhase(PHASE.DONE)
  }

  function handleSpinAgain() {
    setSelectedChore(null)
    setPhase(PHASE.READY)
  }

  function handleStartTimer() {
    startChildTimer(child.name)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-child-header">
          <div className="modal-avatar" style={{ background: child.color }}>
            {child.emoji}
          </div>
          <div>
            <h2 className="modal-title">{child.name}'s Chore</h2>
            <p className="modal-points-line">
              <span className="bb-icon">🪙</span> {bucks} Beagley Bucks
              {balance > 0 && <span className="modal-screen-balance"> · ⏱ {balance} min banked</span>}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="modal-loading">Loading chores…</div>
        ) : (
          <div className={`modal-wheel-wrap ${phase !== PHASE.READY ? 'dimmed' : ''}`}>
            <SpinningWheel chores={chores} onSpinEnd={handleSpinEnd} />
          </div>
        )}

        {phase === PHASE.RESULT && selectedChore && (
          <div className="chore-result-panel">
            <div className="chore-result-name">
              <span>{selectedChore.icon}</span> {selectedChore.label}
            </div>
            <div className="chore-result-points">+{selectedChore.bucks} BB</div>
            <div className="chore-result-actions">
              <button className="btn-complete" onClick={handleComplete}>
                ✓ Done — Mark Complete!
              </button>
              <button className="btn-spin-again" onClick={handleSpinAgain}>
                Spin Again
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.DONE && (
          <div className="chore-done-panel">
            <div className="done-burst">🎉</div>
            <p className="done-earned">+{earned} Beagley Bucks!</p>
            <p className="done-screen-time">+{screenEarned} min screen time</p>
            <p className="done-total">
              {child.name} now has <strong>🪙 {bucks} BB</strong>
            </p>
            <p className="done-screen-prompt">What do you want to do with your screen time?</p>
            <div className="done-screen-actions">
              <button className="btn-start-timer" onClick={handleStartTimer}>
                ▶ Start Timer ({CONFIG.screenTime?.timerBufferMinutes ?? 35} min)
              </button>
              <button className="btn-bank-it" onClick={onClose}>
                🏦 Bank It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
