import { useEffect, useState } from 'react'

const COLORS = ['#f7c948', '#e63946', '#2a9d8f', '#f4a261', '#7b2d8b', '#3a86ff']

export default function Burst({ triggerKey }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!triggerKey) return
    const count = 8
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i + (Math.random() * 20 - 10),
        dist: 22 + Math.random() * 14,
        color: COLORS[i % COLORS.length],
      }))
    )
    const t = setTimeout(() => setParticles([]), 650)
    return () => clearTimeout(t)
  }, [triggerKey])

  if (!particles.length) return null

  return (
    <span className="burst-wrap" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="burst-particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--dist':  `${p.dist}px`,
            background: p.color,
          }}
        />
      ))}
    </span>
  )
}
