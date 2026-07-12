import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 딴짓 잡기 — '집중이 안 될 때' 코너.
// 집중하다 딴생각이 든 걸 '알아챈' 순간마다 톡 잡는다(메타인지·마음챙김).
// 알아챔 = 성공. 많이 잡는 게 목표가 아니라 알아채는 연습. 자책·점수·실패 없음.
const FOCUS_BG = { background: 'radial-gradient(ellipse at 50% 34%, #1c2b46 0%, #0e1a2c 76%)' }
const DURATIONS = [2, 3, 5]
const PHRASES = ['잘 돌아왔어요', '알아챘네요', '좋아요, 지금으로', '다시 여기', '톡, 잡았다']

export default function FocusCatch({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [remaining, setRemaining] = useState(0)
  const [progress, setProgress] = useState(0)
  const [catches, setCatches] = useState(0)
  const [floaters, setFloaters] = useState([])
  const totalRef = useRef(0)
  const endAtRef = useRef(0)
  const fid = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const audio = () => {
    if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (C) acRef.current = new C() }
    const c = acRef.current; if (c && c.state === 'suspended') c.resume(); return c
  }
  // 잡을 때 — 부드럽고 기분 좋은 '톡·딩'
  const catchChime = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const note = (f, s, d, v, type = 'triangle') => {
      const o = c.createOscillator(); const g = c.createGain()
      o.type = type; o.frequency.setValueAtTime(f, t + s)
      g.gain.setValueAtTime(0, t + s); g.gain.linearRampToValueAtTime(v, t + s + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + s + d)
      o.connect(g); g.connect(c.destination); o.start(t + s); o.stop(t + s + d + 0.02)
    }
    note(880, 0, 0.16, 0.11)      // A5
    note(1320, 0.05, 0.22, 0.10, 'sine') // E6 반짝
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const start = (min) => {
    totalRef.current = min * 60
    endAtRef.current = Date.now() + min * 60 * 1000
    setRemaining(min * 60); setProgress(0); setCatches(0); setFloaters([]); setPhase('play')
  }

  useEffect(() => {
    if (phase !== 'play') return
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      setRemaining(rem)
      setProgress(Math.min(1, 1 - rem / totalRef.current))
      if (rem <= 0) { clearInterval(iv); setPhase('done') }
    }, 250)
    return () => clearInterval(iv)
  }, [phase])

  const catchIt = () => {
    setCatches((c) => c + 1)
    catchChime()
    const id = ++fid.current
    const msg = PHRASES[id % PHRASES.length]
    setFloaters((f) => [...f, { id, msg }])
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 950)
  }

  const mm = String(Math.floor(remaining / 60))
  const ss = String(remaining % 60).padStart(2, '0')

  const styleTag = (
    <style>{`
      @keyframes fc-pop{0%{transform:scale(0) translateY(6px);opacity:0}55%{transform:scale(1.25);opacity:1}100%{transform:scale(1)}}
      .fc-pop{animation:fc-pop .5s cubic-bezier(.2,.8,.3,1) both}
      @keyframes fc-float{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-46px);opacity:0}}
      .fc-float{animation:fc-float .95s ease-out forwards}
      @keyframes fc-ring{0%{transform:scale(.6);opacity:.5}100%{transform:scale(1.8);opacity:0}}
      .fc-ring{animation:fc-ring .5s ease-out forwards}
    `}</style>
  )

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FOCUS_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>딴짓 잡기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-5" />
            <div className="flex justify-center mb-7"><Star size={34} /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              집중하다 딴생각이 드는 건 자연스러워요.<br />
              중요한 건 <span className="text-amber">"아, 딴생각 중이네"</span> 하고 알아채는 순간이에요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">알아챌 때마다 톡 잡아 주세요. 많이 잡는 게 목표가 아니에요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {DURATIONS.map((m) => (
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
        <div className="min-h-screen flex flex-col items-center p-6 pt-16 relative" style={FOCUS_BG}>
          {styleTag}
          <div className="absolute top-0 left-0 h-[3px] bg-amber/70" style={{ width: `${progress * 100}%`, transition: 'width .25s linear' }} />

          {/* 잡은 별들 — 별자리처럼 쌓임 */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xs mb-1" style={{ minHeight: 26 }}>
            {Array.from({ length: catches }).map((_, i) => (
              <span key={i} className={i === catches - 1 ? 'fc-pop' : ''}><Star size={14} /></span>
            ))}
          </div>
          <p className="text-white/40 text-[12px] mb-10">{catches > 0 ? `${catches}번 알아챘어요` : '흩어지면, 알아채고 톡'}</p>

          {/* 숨 앵커 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="rounded-full bg-white/15 animate-breath" style={{ width: 108, height: 108 }} />
            <p className="text-white/45 text-[13px] font-light mt-10">숨에 가만히 머물러요 · {mm}:{ss}</p>
          </div>

          {/* 잡기 버튼 */}
          <div className="relative w-full max-w-xs mb-4">
            {floaters.map((f) => (
              <span key={f.id} className="fc-float absolute left-1/2 -translate-x-1/2 -top-6 text-amber text-[13px] whitespace-nowrap">
                {f.msg}
              </span>
            ))}
            <button
              onClick={catchIt}
              className="relative w-full py-5 rounded-full bg-amber/90 text-navy text-[16px] active:scale-[0.98] transition"
              style={{ fontWeight: 600, boxShadow: '0 0 24px 4px rgba(224,163,62,0.35)' }}
            >
              <span key={catches} className="fc-ring absolute inset-0 rounded-full pointer-events-none" style={{ border: '2px solid rgba(224,163,62,0.7)' }} />
              딴생각 왔다, 톡
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    const zero = catches === 0
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FOCUS_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto mb-6" style={{ minHeight: 20 }}>
              {Array.from({ length: Math.min(catches, 40) }).map((_, i) => <Star key={i} size={15} />)}
            </div>
            <p className="font-serif text-[30px] text-white mb-2" style={{ fontWeight: 600 }}>
              {zero ? '꽤 머물렀네요' : `${catches}번 알아챘어요`}
            </p>
            <p className="text-white/70 text-sm font-light mb-12 leading-relaxed">
              {zero
                ? '흩어져도 괜찮아요. 알아채면 언제든 다시 돌아올 수 있어요.'
                : '딴생각을 알아챈 그 순간마다,\n다시 지금으로 돌아온 거예요. 그게 연습이에요.'}
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

// 빛나는 별
function Star({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 4px rgba(246,207,122,0.7))' }}>
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" fill="#f6cf7a" />
    </svg>
  )
}
