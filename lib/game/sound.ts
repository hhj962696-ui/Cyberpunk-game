// Sound effects synthesized with the Web Audio API, so there are no audio files to ship.
import type { Rarity } from "./data"

export const SOUND_KEY = "neon-night-market-sound"

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean) {
  muted = value
}

// Browsers only allow audio after a user gesture; the first click creates the context
function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

interface ToneOpts {
  at?: number
  dur: number
  type?: OscillatorType
  gain?: number
  slideTo?: number
}

function tone(freq: number, { at = 0, dur, type = "square", gain = 0.08, slideTo }: ToneOpts) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + at
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  amp.gain.setValueAtTime(gain, t)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(amp).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise({ at = 0, dur, gain = 0.06, freq = 3000 }: { at?: number; dur: number; gain?: number; freq?: number }) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + at
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = "bandpass"
  filter.frequency.value = freq
  const amp = ac.createGain()
  amp.gain.setValueAtTime(gain, t)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(amp).connect(ac.destination)
  src.start(t)
}

const arpeggio = (notes: number[], step: number, opts: Omit<ToneOpts, "at">) =>
  notes.forEach((f, i) => tone(f, { ...opts, at: i * step }))

export const sfx = {
  click: () => tone(880, { dur: 0.05, gain: 0.04 }),
  draw: (rarity: Rarity) => {
    if (rarity === "legendary") arpeggio([523, 659, 784, 1047, 1319], 0.07, { dur: 0.25, type: "triangle", gain: 0.1 })
    else if (rarity === "epic") arpeggio([587, 740, 880, 1175], 0.07, { dur: 0.22, type: "triangle", gain: 0.1 })
    else if (rarity === "rare" || rarity === "uncommon") arpeggio([659, 880, 1175], 0.07, { dur: 0.2, type: "triangle", gain: 0.09 })
    else arpeggio([523, 784], 0.06, { dur: 0.12, type: "triangle", gain: 0.07 })
  },
  cook: () => noise({ dur: 0.35, gain: 0.05, freq: 5000 }),
  plateReady: () => tone(1320, { dur: 0.15, type: "sine", gain: 0.07 }),
  serve: () => {
    tone(988, { dur: 0.08, type: "square", gain: 0.05 })
    tone(1319, { at: 0.08, dur: 0.25, type: "square", gain: 0.05 })
  },
  wrong: () => tone(220, { dur: 0.2, type: "sawtooth", gain: 0.05, slideTo: 160 }),
  walkout: () => tone(330, { dur: 0.4, type: "sawtooth", gain: 0.05, slideTo: 110 }),
  open: () => arpeggio([392, 523, 659], 0.09, { dur: 0.18, type: "square", gain: 0.05 }),
  close: () => arpeggio([659, 523, 392], 0.12, { dur: 0.22, type: "triangle", gain: 0.07 }),
  event: () => {
    tone(740, { dur: 0.12, type: "square", gain: 0.05 })
    tone(740, { at: 0.18, dur: 0.12, type: "square", gain: 0.05 })
  },
  rent: () => noise({ dur: 0.12, gain: 0.08, freq: 1500 }),
  newDay: () => tone(523, { dur: 0.3, type: "sine", gain: 0.06, slideTo: 784 }),
  upgrade: () => arpeggio([523, 659, 784, 1047, 784, 1047], 0.08, { dur: 0.2, type: "square", gain: 0.05 }),
  gameover: () => arpeggio([392, 330, 262, 196], 0.18, { dur: 0.35, type: "sawtooth", gain: 0.05 }),
}
