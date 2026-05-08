import { useState, useEffect, useRef } from 'react'
import { CONFIG } from '../config/config'

const DURATION_OPTIONS = [5, 10, 15, 20]

export default function TidyTimerButton({ onStart }) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState(CONFIG.tidyTimer?.defaultMinutes ?? 10)
  const [castAvailable, setCastAvailable] = useState(false)
  const castContextRef = useRef(null)
  const popoverRef = useRef(null)

  // Initialize Cast SDK if app ID is configured
  useEffect(() => {
    const appId = CONFIG.tidyTimer?.castAppId
    if (!appId || !window.__onGCastApiAvailable) return

    window.__onGCastApiAvailable = (isAvailable) => {
      if (!isAvailable) return
      try {
        const ctx = cast.framework.CastContext.getInstance()
        ctx.setOptions({
          receiverApplicationId: appId,
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        })
        castContextRef.current = ctx
        ctx.addEventListener(
          cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          () => setCastAvailable(ctx.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE)
        )
        setCastAvailable(ctx.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE)
      } catch { /* Cast SDK not fully loaded */ }
    }
  }, [])

  // Close popover on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleStart() {
    setOpen(false)
    let castSession = null

    if (castAvailable && castContextRef.current) {
      try {
        await castContextRef.current.requestSession()
        castSession = castContextRef.current.getCurrentSession()

        // Send playlist URL to receiver via custom message channel
        const playlistUrl = CONFIG.tidyTimer?.musicPlaylistUrl
        if (playlistUrl && castSession) {
          castSession.sendMessage('urn:x-cast:com.familydash.tidy', { playlistUrl })
        }
      } catch { /* user cancelled cast or no device */ }
    }

    onStart(duration, castSession)
  }

  return (
    <div className="tidy-btn-wrap" ref={popoverRef}>
      <button
        className="tidy-trigger-btn"
        onClick={() => setOpen(o => !o)}
        title="Tidy Time"
      >
        🧹
      </button>

      {open && (
        <div className="tidy-popover">
          <p className="tidy-popover-label">Tidy Time</p>

          <div className="tidy-duration-row">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`tidy-duration-opt ${duration === opt ? 'selected' : ''}`}
                onClick={() => setDuration(opt)}
              >
                {opt}m
              </button>
            ))}
          </div>

          {castAvailable && (
            <p className="tidy-cast-note">🔊 Will play music on Google Home</p>
          )}

          <button className="tidy-start-btn" onClick={handleStart}>
            Start!
          </button>
        </div>
      )}
    </div>
  )
}
