let chimeInterval = null

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [261.63, 329.63, 392.00] // C4, E4, G4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.22
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
      osc.start(t)
      osc.stop(t + 0.7)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Web Audio not available
  }
}

export function startChimeLoop() {
  stopChimeLoop()
  playChime()
  chimeInterval = setInterval(playChime, 4500)
}

export function stopChimeLoop() {
  if (chimeInterval !== null) {
    clearInterval(chimeInterval)
    chimeInterval = null
  }
}
