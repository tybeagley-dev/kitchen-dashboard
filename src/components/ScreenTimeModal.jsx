import { useState, useEffect } from 'react'
import { useScreenBalance, startChildTimer } from '../hooks/useScreenTime'
import { useChorePoints } from '../hooks/useChores'
import BuckBadge from './BuckBadge'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'

const PHASE           = { VIEW: 'view', BUY: 'buy' }
const MINS_PER_BUCK   = 10
const DAILY_MAX_BUCKS = 30
const MAX_PER_TRADE   = 3

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export default function ScreenTimeModal({ child, onClose }) {
  const { balance, addMinutes } = useScreenBalance(child.name)
  const { bucks, adjustBucks }  = useChorePoints(child.name)
  const [phase,        setPhase]        = useState(PHASE.VIEW)
  const [amount,       setAmount]       = useState(1)
  const [tradedToday,  setTradedToday]  = useState(0)
  const [tradeLoading, setTradeLoading] = useState(true)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    async function loadTradeCount() {
      const data = await sheetsGet({ action: 'getDailyTradeCount', child: child.name, date: getTodayKey(new Date()) })
      if (data?.traded != null) setTradedToday(data.traded)
      setTradeLoading(false)
    }
    loadTradeCount()
  }, [child.name])

  async function handleBuy() {
    const result = await sheetsGet({ action: 'tradeBucksForTime', child: child.name, amount, date: getTodayKey(new Date()) })
    if (!result?.success) return
    adjustBucks(-result.bucksTrade)
    addMinutes(result.minutesAdded)
    onClose()
  }

  function handleStart() {
    startChildTimer(child.name)
    onClose()
  }

  const remaining     = Math.max(0, DAILY_MAX_BUCKS - tradedToday)
  const maxTrade      = Math.min(bucks, remaining, MAX_PER_TRADE)
  const canBuy        = maxTrade > 0 && !tradeLoading
  const minutesGained = amount * MINS_PER_BUCK

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

        {phase === PHASE.VIEW && (
          <>
            <div className="st-balance-display">
              <span className="st-balance-num">{balance}</span>
              <span className="st-balance-unit">min banked</span>
            </div>

            {balance > 0 && (
              <button className="btn-start-timer st-start" onClick={handleStart}>
                Start Timer
              </button>
            )}

            {!balance && (
              <p className="st-empty">No screen time banked yet.</p>
            )}

            {canBuy && (
              <button
                className="btn-spend"
                onClick={() => { setAmount(1); setPhase(PHASE.BUY) }}
              >
                Buy More Screen Time
              </button>
            )}

            {!tradeLoading && bucks > 0 && remaining === 0 && (
              <p className="trade-limit-msg">Daily trade limit reached ({DAILY_MAX_BUCKS} bucks)</p>
            )}
          </>
        )}

        {phase === PHASE.BUY && (
          <div className="bucks-spend-phase">
            <p className="spend-prompt">Buy More Screen Time</p>
            <div className="spend-stepper">
              <button
                className="stepper-btn"
                onClick={() => setAmount(a => Math.max(1, a - 1))}
                disabled={amount <= 1}
              >−</button>
              <span className="stepper-value adjust-value adding">
                <BuckBadge amount={amount} />
              </span>
              <button
                className="stepper-btn"
                onClick={() => setAmount(a => Math.min(maxTrade, a + 1))}
                disabled={amount >= maxTrade}
              >+</button>
            </div>
            <p className="spend-remaining">
              {amount} buck{amount !== 1 ? 's' : ''} → <strong>+{minutesGained} min</strong> screen time
            </p>
            <p className="trade-balance-after">
              Bucks after: <BuckBadge amount={Math.max(0, bucks - amount)} />
            </p>
            <div className="spend-actions">
              <button className="btn-confirm-spend btn-confirm-add" onClick={handleBuy}>
                ✓ Add {minutesGained} Minutes
              </button>
              <button className="btn-cancel-spend" onClick={() => setPhase(PHASE.VIEW)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
