import { useEffect, useState } from 'react'

const COLORS = ['#f7c948', '#e63946', '#2a9d8f', '#f4a261', '#7b2d8b', '#3a86ff', '#ff6b9d', '#c6e86e']
const SHAPES = ['★', '✦', '●', '▲', '♦']

export default function Confetti({ triggerKey }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!triggerKey) return
    setPieces(
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 0.9 + Math.random() * 0.9,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
        size: 10 + Math.random() * 8,
      }))
    )
    const t = setTimeout(() => setPieces([]), 2800)
    return () => clearTimeout(t)
  }, [triggerKey])

  if (!pieces.length) return null

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            '--x':       `${p.x}%`,
            '--delay':   `${p.delay}s`,
            '--dur':     `${p.dur}s`,
            '--rotate':  `${p.rotate}deg`,
            color:       p.color,
            fontSize:    `${p.size}px`,
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  )
}
