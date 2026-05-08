export default function TidyTimerPill({ minutes, seconds, expired, onStop }) {
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div className={`tidy-pill ${expired ? 'expired' : ''}`}>
      <span className="tidy-pill-icon">🧹</span>
      <span className="tidy-pill-time">
        {expired ? 'Tidy time done!' : `Tidy · ${timeStr}`}
      </span>
      <button className="tidy-pill-stop" onClick={onStop} aria-label="Stop tidy timer">
        ×
      </button>
    </div>
  )
}
