import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 집중 소리 — '집중이 안 될 때' 코너. 앰비언트 믹서.
// 비·파도·바람·브라운노이즈·모닥불을 슬라이더로 섞어 나만의 배경음을 만든다.
// 전부 Web Audio 합성(외부 음원 0). ModuleFrame 음소거 존중. 타이머·종료 없음(떠날 때까지).
const LAYERS = [
  { key: 'rain', name: '비', color: '#7fb0e0', max: 0.13 },
  { key: 'waves', name: '파도', color: '#5fc0c0', max: 0.15 },
  { key: 'wind', name: '바람', color: '#aab7c9', max: 0.12 },
  { key: 'brown', name: '브라운 노이즈', color: '#c9a06a', max: 0.17 },
  { key: 'fire', name: '모닥불', color: '#f0955b', max: 0.14 },
]
const MAXOF = Object.fromEntries(LAYERS.map((l) => [l.key, l.max]))

export default function FocusSound({ onExit }) {
  const [levels, setLevels] = useState({ rain: 0, waves: 0, wind: 0, brown: 0, fire: 0 })
  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const audioRef = useRef(null)
  const fireRef = useRef(0)

  const pop = (vol) => {
    const a = audioRef.current; if (!a || mutedRef.current) return
    const c = a.ctx; const t = c.currentTime
    const s = c.createBufferSource(); s.buffer = a.white
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1600
    const g = c.createGain()
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.05)
    s.connect(hp); hp.connect(g); g.connect(a.master); s.start(t); s.stop(t + 0.14)
  }

  const buildAudio = () => {
    if (audioRef.current) return audioRef.current
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null
      const ctx = new C()
      const master = ctx.createGain(); master.gain.value = mutedRef.current ? 0 : 0.9; master.connect(ctx.destination)
      const mkNoise = (brown) => {
        const len = Math.floor(ctx.sampleRate * 2); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0)
        let last = 0
        for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2 } else d[i] = w }
        return b
      }
      const white = mkNoise(false), brown = mkNoise(true)
      const src = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s }
      const layers = {}
      const addLfo = (freq, depth, param) => { const lfo = ctx.createOscillator(); lfo.frequency.value = freq; const lg = ctx.createGain(); lg.gain.value = depth; lfo.connect(lg); lg.connect(param); lfo.start() }
      // 비 — 하이패스 화이트 노이즈(쉬익)
      { const s = src(white); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1400; const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); layers.rain = g }
      // 파도 — 브라운 노이즈 + 로우패스 주파수를 느리게 여닫음(밀려왔다 나감)
      { const s = src(brown); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 550; const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); addLfo(0.08, 260, f.frequency); s.start(); layers.waves = g }
      // 바람 — 밴드패스 주파수를 느리게 스윕(휘잉)
      { const s = src(white); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 0.7; const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); addLfo(0.11, 420, f.frequency); s.start(); layers.wind = g }
      // 브라운 노이즈 — 깊은 저역
      { const s = src(brown); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480; const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); layers.brown = g }
      // 모닥불 — 저역 럼블 + 탁탁 크래클(별도)
      { const s = src(brown); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); layers.fire = g }
      const crackle = setInterval(() => { const fv = fireRef.current; if (fv > 0 && Math.random() < fv * 0.5) pop(0.05 + fv * 0.1) }, 95)
      audioRef.current = { ctx, master, layers, white, crackle }
      return audioRef.current
    } catch { return null }
  }

  useEffect(() => {
    const a = audioRef.current; if (a) a.master.gain.setTargetAtTime(isMuted ? 0 : 0.9, a.ctx.currentTime, 0.15)
  }, [isMuted])
  useEffect(() => () => {
    const a = audioRef.current
    if (a) { clearInterval(a.crackle); try { a.ctx.close() } catch { /* noop */ } audioRef.current = null }
  }, [])

  const setLevel = (key, v) => {
    const a = buildAudio()
    if (a && a.ctx.state === 'suspended') a.ctx.resume()
    setLevels((l) => ({ ...l, [key]: v }))
    if (key === 'fire') fireRef.current = v
    if (a) a.layers[key].gain.setTargetAtTime(v * MAXOF[key], a.ctx.currentTime, 0.06)
  }
  const resetAll = () => { LAYERS.forEach((l) => setLevel(l.key, 0)) }
  const anyOn = Object.values(levels).some((v) => v > 0)

  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 30%, #1b2a40 0%, #0e1a2c 80%)' }}>
        <div className="max-w-md w-full">
          <p className="font-serif text-[26px] text-white text-center mb-1" style={{ fontWeight: 600 }}>집중 소리</p>
          <p className="text-white/45 text-[13px] text-center mb-8">지금 마음에 맞게 섞어 보세요.</p>

          <div className="space-y-4">
            {LAYERS.map((l) => {
              const v = levels[l.key]
              const on = v > 0
              return (
                <div key={l.key} className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3.5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center rounded-full transition"
                      style={{ width: 34, height: 34, background: on ? `${l.color}33` : 'rgba(255,255,255,0.06)', boxShadow: on ? `0 0 12px 1px ${l.color}66` : 'none' }}>
                      <Icon k={l.key} color={on ? l.color : 'rgba(255,255,255,0.5)'} />
                    </span>
                    <span className="text-white/85 text-[15px]">{l.name}</span>
                    <span className="ml-auto text-white/35 text-[11px] tabular-nums">{Math.round(v * 100)}</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={Math.round(v * 100)}
                    onChange={(e) => setLevel(l.key, Number(e.target.value) / 100)}
                    className="w-full"
                    style={{ accentColor: l.color }}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-7">
            {anyOn && (
              <button onClick={resetAll} className="text-white/40 hover:text-white/70 transition text-[13px]">다 끄기</button>
            )}
          </div>
          {!anyOn && <p className="text-white/30 text-[12px] text-center mt-6">슬라이더를 올리면 소리가 나요 · 기기 볼륨을 확인하세요</p>}
        </div>
      </div>
    </ModuleFrame>
  )
}

function Icon({ k, color }) {
  const s = 18
  const wrap = (inner) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">{inner}</svg>
  switch (k) {
    case 'rain': return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M7 13l-1.5 4" /><path d="M12 13l-1.5 4" /><path d="M17 13l-1.5 4" /><path d="M4 11a5 5 0 0 1 9-3 4 4 0 0 1 6 3" fill="none" /></g>)
    case 'waves': return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"><path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></g>)
    case 'wind': return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"><path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h9" /></g>)
    case 'brown': return wrap(<circle cx="12" cy="12" r="7" fill={color} opacity="0.85" />)
    case 'fire': return wrap(<path d="M12 3c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.5 1 2 2 2 0-3-1-4 1-7Z" fill={color} />)
    default: return wrap(<circle cx="12" cy="12" r="6" fill={color} />)
  }
}
