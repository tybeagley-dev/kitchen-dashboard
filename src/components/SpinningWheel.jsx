import { useState, useRef, useCallback } from 'react'

const WHEEL_R = 110
const WHEEL_SIZE = 260
const SPIN_DURATION_MS = 4200
const NUM_SLICES = 6

const SLICE_COLORS = [
  '#C17A4A', '#6B8F71', '#6B82A0',
  '#9B6B8F', '#C4A35A', '#7A9B8F',
]


function polarToCart(r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) }
}

function segmentPath(r, startDeg, endDeg) {
  const s = polarToCart(r, startDeg)
  const e = polarToCart(r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M 0 0 L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`
}

export default function SpinningWheel({ chores, onSpinEnd, onSpinStart }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const timeoutRef = useRef(null)

  const handleSpin = useCallback(() => {
    if (spinning || chores.length === 0) return

    // Pick a random chore from the full list — wheel is purely decorative
    const winnerIndex = Math.floor(Math.random() * chores.length)

    // Land on a random slice (visual only — doesn't correspond to the winner)
    const segAngle = 360 / NUM_SLICES
    const targetSlice = Math.floor(Math.random() * NUM_SLICES)
    const target = (360 - (targetSlice * segAngle) % 360) % 360
    const currentAngle = ((rotation % 360) + 360) % 360
    let delta = (target - currentAngle + 360) % 360
    if (delta < 20) delta += 360

    const newRotation = rotation + 5 * 360 + delta

    setSpinning(true)
    setRotation(newRotation)
    onSpinStart?.()

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setSpinning(false)
      onSpinEnd(chores[winnerIndex])
    }, SPIN_DURATION_MS)
  }, [spinning, chores, rotation, onSpinEnd])

  if (chores.length === 0) {
    return <p className="wheel-empty">No chores in the pool</p>
  }

  const segAngle = 360 / NUM_SLICES
  const half = segAngle / 2

  return (
    <div className="spinning-wheel-wrap">
      <div className="wheel-pointer-wrap">
        <svg width="20" height="16" viewBox="0 0 20 16">
          <polygon points="10,14 2,0 18,0" fill="var(--text-primary)" opacity="0.75" />
        </svg>
      </div>

      <svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        viewBox={`${-WHEEL_SIZE / 2} ${-WHEEL_SIZE / 2} ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        className="wheel-svg"
      >
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '0 0',
            transition: spinning
              ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
              : 'none',
          }}
        >
          {SLICE_COLORS.map((color, i) => {
            const start = i * segAngle - half
            const end = start + segAngle

            return (
              <path
                key={i}
                d={segmentPath(WHEEL_R, start, end)}
                fill={color}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
              />
            )
          })}
          <circle r={18} fill="white" stroke="rgba(60,30,10,0.12)" strokeWidth="2" />
        </g>
      </svg>

      <button
        className="spin-trigger"
        onClick={handleSpin}
        disabled={spinning}
      >
        {spinning ? 'Spinning…' : 'Spin!'}
      </button>
    </div>
  )
}
