let ctx           = null
let chimeInterval = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

// Must be called within a user gesture (tap/click) to satisfy iOS autoplay policy.
// After this, the context stays unlocked for the session.
export function unlockAudio() {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    // Play a silent one-sample buffer — fully unlocks on iOS
    const buf = c.createBuffer(1, 1, 22050)
    const src = c.createBufferSource()
    src.buffer = buf
    src.connect(c.destination)
    src.start()
  } catch { /* Web Audio not available */ }
}

function playChime() {
  try {
    const c = getCtx()
    if (c.state === 'suspended') return
    const notes = [261.63, 329.63, 392.00] // C4, E4, G4
    notes.forEach((freq, i) => {
      const osc  = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.type           = 'sine'
      osc.frequency.value = freq
      const t = c.currentTime + i * 0.22
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
      osc.start(t)
      osc.stop(t + 0.7)
    })
  } catch { /* ignore */ }
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
