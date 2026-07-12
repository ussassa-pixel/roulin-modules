import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 집중 파동 — '집중이 안 될 때' 코너. (MC 스퀘어 결의 인공 유도음 참고)
// 바이노럴(양 귀 미세 주파수 차) + 천천히 바뀌는 패드 + 커졌다 작아지는 스웰. 5·10·15분 코스, 끝에 벨.
// 효과 단정 금지: '뇌파를 바꾼다'가 아니라 '몰입 분위기를 만드는 인공 사운드, 사람마다 다름'.
const COURSES = [5, 10, 15]
const CHORDS = [[220, 277, 330], [196, 247, 294], [247, 311, 370], [174, 220, 261]]

export default function FocusWave({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [remaining, setRemaining] = useState(0)
  const totalRef = useRef(0)
  const endAtRef = useRef(0)
  const startRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const audioRef = useRef(null); const bellRef = useRef(null)

  const bell = () => {
    if (mutedRef.current) return
    try {
      if (!bellRef.current) bellRef.current = new Audio(import.meta.env.BASE_URL + 'transition-bell.mp3')
      bellRef.current.currentTime = 0; bellRef.current.volume = 0.7; bellRef.current.play().catch(() => {})
    } catch { /* noop */ }
  }

  const buildAudio = () => {
    if (audioRef.current) return audioRef.current
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null
      const ctx = new C()
      const master = ctx.createGain(); master.gain.value = mutedRef.current ? 0 : 0.8; master.connect(ctx.destination)
      const swell = ctx.createGain(); swell.gain.value = 0.55; swell.connect(master)
      const swLfo = ctx.createOscillator(); swLfo.frequency.value = 0.092
      const swLg = ctx.createGain(); swLg.gain.value = 0.32; swLfo.connect(swLg); swLg.connect(swell.gain); swLfo.start()
      // 바이노럴
      const pan = (v) => { try { const p = ctx.createStereoPanner(); p.pan.value = v; return p } catch { return ctx.createGain() } }
      const binG = ctx.createGain(); binG.gain.value = 0.09; binG.connect(swell)
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = 200
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = 211
      const pL = pan(-1), pR = pan(1)
      oscL.connect(pL); pL.connect(binG); oscR.connect(pR); pR.connect(binG); oscL.start(); oscR.start()
      // 패드(코드) — 천천히 바뀜
      const padLp = ctx.createBiquadFilter(); padLp.type = 'lowpass'; padLp.frequency.value = 650
      const padG = ctx.createGain(); padG.gain.value = 0.05; padLp.connect(padG); padG.connect(swell)
      const padLfo = ctx.createOscillator(); padLfo.frequency.value = 0.05
      const padLg = ctx.createGain(); padLg.gain.value = 300; padLfo.connect(padLg); padLg.connect(padLp.frequency); padLfo.start()
      const pads = CHORDS[0].map((f, i) => {
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * 4
        o.connect(padLp); o.start(); return o
      })
      audioRef.current = { ctx, master, oscR, pads }
      return audioRef.current
    } catch { return null }
  }
  const stopAudio = () => { const a = audioRef.current; if (a) { try { a.ctx.close() } catch { /* noop */ } } audioRef.current = null }

  useEffect(() => {
    const a = audioRef.current; if (a) a.master.gain.setTargetAtTime(isMuted ? 0 : 0.8, a.ctx.currentTime, 0.15)
  }, [isMuted])
  useEffect(() => () => stopAudio(), [])

  const start = (min) => {
    totalRef.current = min * 60; endAtRef.current = Date.now() + min * 60 * 1000; startRef.current = Date.now()
    setRemaining(min * 60); setPhase('play')
    const a = buildAudio(); if (a && a.ctx.state === 'suspended') a.ctx.resume()
  }

  useEffect(() => {
    if (phase !== 'play') return
    let chordI = 0
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      setRemaining(rem)
      const a = audioRef.current
      if (a) {
        const t = 1 - rem / totalRef.current
        const beat = 11 - t * 3 // 11→8Hz로 천천히 내려감
        a.oscR.frequency.setTargetAtTime(200 + beat, a.ctx.currentTime, 0.6)
      }
      if (rem <= 0) { clearInterval(iv); bell(); setPhase('done') }
    }, 700)
    const ci = setInterval(() => {
      const a = audioRef.current; if (!a) return
      chordI = (chordI + 1) % CHORDS.length
      CHORDS[chordI].forEach((f, i) => a.pads[i] && a.pads[i].frequency.setTargetAtTime(f, a.ctx.currentTime, 4))
    }, 42000)
    return () => { clearInterval(iv); clearInterval(ci) }
  }, [phase])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 36%, #241a3a 0%, #0e1020 80%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>집중 파동</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><WaveOrb /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              몰입 분위기를 만드는 인공 사운드예요.<br />
              소리가 천천히 바뀌고, 커졌다 작아져요.
            </p>
            <p className="text-[12px] text-white/45 mb-8">이어폰을 끼면 좀 더 또렷해요 · 효과는 사람마다 달라요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {COURSES.map((m) => (
                <button key={m} onClick={() => start(m)}
                  className="py-4 rounded-2xl bg-white/12 text-white border border-white/25 hover:bg-white/20 transition" style={{ fontWeight: 600 }}>
                  {m}분
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'play') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <style>{`
          @keyframes fw-bg{0%{background:radial-gradient(ellipse at 50% 40%,#241a3a 0%,#0e1020 80%)}33%{background:radial-gradient(ellipse at 50% 40%,#153036 0%,#0a141c 80%)}66%{background:radial-gradient(ellipse at 50% 40%,#2a1830 0%,#100a1e 80%)}100%{background:radial-gradient(ellipse at 50% 40%,#241a3a 0%,#0e1020 80%)}}
          .fw-bg{animation:fw-bg 44s ease-in-out infinite}
          @keyframes fw-orb{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.16);opacity:1}}
          .fw-orb{animation:fw-orb 11s ease-in-out infinite}
          @keyframes fw-ripple{0%{transform:scale(.7);opacity:.4}100%{transform:scale(2.1);opacity:0}}
          .fw-ripple{animation:fw-ripple 5.5s ease-out infinite}
        `}</style>
        <div className="fw-bg min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
          <div className="relative flex items-center justify-center mb-14" style={{ width: 260, height: 260 }}>
            <div className="fw-ripple absolute rounded-full" style={{ width: 150, height: 150, border: '1px solid rgba(180,150,240,0.4)' }} />
            <div className="fw-ripple absolute rounded-full" style={{ width: 150, height: 150, border: '1px solid rgba(120,200,220,0.4)', animationDelay: '2.7s' }} />
            <div className="fw-orb"><WaveOrb big shift /></div>
          </div>
          <p className="text-white/45 text-[13px] tabular-nums mb-12">남은 시간 {fmt(remaining)}</p>
          <button onClick={() => setPhase('done')} className="px-8 py-3 rounded-full text-white/45 hover:text-white/75 transition text-[13px]">끝내기</button>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 36%, #241a3a 0%, #0e1020 80%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><WaveOrb /></div>
            <p className="font-serif text-[28px] text-white mb-2" style={{ fontWeight: 600 }}>
              {Math.round(totalRef.current / 60)}분, 흘러갔어요
            </p>
            <p className="text-white/70 text-sm font-light mb-12 leading-relaxed">
              소리에 기대 잠깐 머물렀어요.<br />여운을 안고 천천히 돌아와요.
            </p>
            <button onClick={() => start(Math.round(totalRef.current / 60))} className="w-full py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition mb-3">다시</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 신비한 그라데이션 구체 — 안쪽에서 성운처럼 색이 소용돌이치고, 코어 광채·후광·림
function WaveOrb({ big = false, shift = false }) {
  const s = big ? 150 : 70
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" aria-hidden="true" className={shift ? 'fw-hue' : undefined}>
      <style>{`@keyframes fw-sw{to{transform:rotate(360deg)}}@keyframes fw-sw2{to{transform:rotate(-360deg)}}.fw-sw{animation:fw-sw 34s linear infinite;transform-origin:60px 60px}.fw-sw2{animation:fw-sw2 47s linear infinite;transform-origin:60px 60px}@keyframes fw-hue{0%,100%{filter:hue-rotate(0deg)}33%{filter:hue-rotate(-36deg)}66%{filter:hue-rotate(30deg)}}.fw-hue{animation:fw-hue 44s ease-in-out infinite}`}</style>
      <defs>
        <radialGradient id="fw-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8f7be0" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#5fc0c0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#5fc0c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fw-body" cx="40%" cy="34%" r="74%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#dccdff" />
          <stop offset="55%" stopColor="#7d63d8" />
          <stop offset="100%" stopColor="#241a3a" />
        </radialGradient>
        <radialGradient id="fw-core" cx="42%" cy="38%" r="42%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="fw-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter>
        <clipPath id="fw-clip"><circle cx="60" cy="60" r="34" /></clipPath>
      </defs>

      {/* 후광 */}
      <circle cx="60" cy="60" r="57" fill="url(#fw-halo)" />
      {/* 구체 본체 */}
      <circle cx="60" cy="60" r="34" fill="url(#fw-body)" />
      {/* 안쪽 성운(구체에 클립, 느리게 소용돌이) */}
      <g clipPath="url(#fw-clip)">
        <g className="fw-sw" filter="url(#fw-blur)">
          <ellipse cx="46" cy="50" rx="21" ry="13" fill="#6fe0d0" opacity="0.5" />
          <ellipse cx="75" cy="70" rx="18" ry="12" fill="#e08ad0" opacity="0.45" />
        </g>
        <g className="fw-sw2" filter="url(#fw-blur)">
          <ellipse cx="71" cy="47" rx="16" ry="11" fill="#9b7bf0" opacity="0.5" />
          <ellipse cx="49" cy="74" rx="15" ry="10" fill="#7fd0ff" opacity="0.4" />
        </g>
      </g>
      {/* 코어 광채 */}
      <circle cx="60" cy="60" r="34" fill="url(#fw-core)" />
      {/* 스페큘러 하이라이트 */}
      <ellipse cx="49" cy="46" rx="8" ry="5" fill="#ffffff" opacity="0.7" transform="rotate(-25 49 46)" />
      {/* 림 */}
      <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(150,120,240,0.22)" strokeWidth="1" />
    </svg>
  )
}
