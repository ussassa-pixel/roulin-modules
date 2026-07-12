import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 3·2·1 시작 — '집중이 안 될 때' 코너.
// 착수 마찰을 넘기는 시동 의례: 딱 하나 정하고 → 방해물(폰·알림·간식) 휙 던져 치우고 → 로켓을 꾹 눌러 충전 → 발사.
// 소리는 Web Audio 합성(외부 음원 0), ModuleFrame 음소거 존중.
const FOCUS_BG = { background: 'radial-gradient(ellipse at 50% 30%, #1e2f4a 0%, #0f1c30 74%)' }
const HANDOFF_KEY = 'roulin_focus_task' // 딴생각 주차장에서 넘겨준 '할 일'
const DISTRACTIONS = ['phone', 'notif', 'snack']

export default function FocusLaunch({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [task, setTask] = useState('')

  useEffect(() => {
    try {
      const t = localStorage.getItem(HANDOFF_KEY)
      if (t && t.trim()) { setTask(t); localStorage.removeItem(HANDOFF_KEY) }
    } catch { /* noop */ }
  }, [])

  // ── 소리 (Web Audio 합성) ──
  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted)
  mutedRef.current = isMuted
  const acRef = useRef(null)
  const audio = () => {
    if (!acRef.current) {
      const C = window.AudioContext || window.webkitAudioContext
      if (C) acRef.current = new C()
    }
    const c = acRef.current
    if (c && c.state === 'suspended') c.resume()
    return c
  }
  // 카운트 '띡' — 깔끔하게 딱 떨어지는 게이트 비프(3·2·1 동일)
  const tick = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const o = c.createOscillator(); const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(990, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.16, t + 0.004)
    g.gain.setValueAtTime(0.16, t + 0.06)
    g.gain.linearRampToValueAtTime(0, t + 0.072)
    o.connect(g); g.connect(c.destination)
    o.start(t); o.stop(t + 0.09)
  }
  // 던질 때 '휙'
  const whoosh = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const len = Math.floor(c.sampleRate * 0.3)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const s = c.createBufferSource(); s.buffer = buf
    const f = c.createBiquadFilter(); f.type = 'bandpass'
    f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(2600, t + 0.26); f.Q.value = 0.8
    const g = c.createGain(); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t)
  }
  // 로켓 발사 — 브라운 노이즈 굉음 + 저역 럼블(진짜 발사음 느낌)
  const rocketLaunch = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const dur = 1.8
    const len = Math.floor(c.sampleRate * dur)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2 } // 브라운 노이즈
    const src = c.createBufferSource(); src.buffer = buf
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'
    lp.frequency.setValueAtTime(280, t)
    lp.frequency.exponentialRampToValueAtTime(2600, t + 0.45)
    lp.frequency.linearRampToValueAtTime(1100, t + dur)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.12) // 급격한 점화
    g.gain.setValueAtTime(0.42, t + 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur) // 멀어짐
    const sub = c.createOscillator(); sub.type = 'sine'
    sub.frequency.setValueAtTime(44, t); sub.frequency.linearRampToValueAtTime(72, t + 0.6)
    const sg = c.createGain()
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.24, t + 0.12); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(lp); lp.connect(g); g.connect(c.destination)
    sub.connect(sg); sg.connect(c.destination)
    src.start(t); sub.start(t); sub.stop(t + dur)
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  // ── 방해물 치우기: 여러 개 휙 던지기 ──
  const [flungCount, setFlungCount] = useState(0)
  const fling = () => {
    whoosh()
    setFlungCount((n) => {
      const next = n + 1
      if (next >= DISTRACTIONS.length) setTimeout(() => setPhase('charge'), 430)
      return next
    })
  }

  // ── 로켓 충전(꾹 누르기) ──
  const [charge, setCharge] = useState(0)
  const holdRef = useRef(false)
  const launchedRef = useRef(false)
  const prevNumRef = useRef(3)
  useEffect(() => {
    if (phase !== 'charge') return
    const iv = setInterval(() => {
      if (!holdRef.current) return
      setCharge((c) => Math.min(100, c + 3))
    }, 55)
    return () => clearInterval(iv)
  }, [phase])
  useEffect(() => {
    if (phase !== 'charge') return
    const num = charge >= 100 ? 0 : charge >= 67 ? 1 : charge >= 34 ? 2 : 3
    if (num !== prevNumRef.current) { prevNumRef.current = num; if (num > 0) tick() }
    if (charge >= 100 && !launchedRef.current) {
      launchedRef.current = true
      rocketLaunch()
      setPhase('launch')
      setTimeout(() => setPhase('go'), 950)
    }
  }, [charge, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const frame = (inner, opts = {}) => (
    <ModuleFrame onExit={onExit} dark={opts.dark}>{inner}</ModuleFrame>
  )
  const styleTag = (
    <style>{`
      @keyframes fl-burst{0%{transform:scale(.5);opacity:.55}100%{transform:scale(2.8);opacity:0}}
      .fl-burst{animation:fl-burst .9s ease-out forwards}
      @keyframes fl-pop{0%{transform:scale(.6);opacity:0}45%{transform:scale(1.14);opacity:1}100%{transform:scale(1)}}
      .fl-pop{animation:fl-pop .5s cubic-bezier(.2,.7,.3,1) both}
    `}</style>
  )

  if (phase === 'intro') {
    return frame(
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>3 · 2 · 1 시작</p>
          <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
          <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
            막상 시작이 안 될 때.<br />방해물 치우고, 로켓처럼 발사해요.
          </p>
          <p className="text-[12px] text-r-gray-soft mb-12">잘하려는 게 아니라, 그냥 켜는 거예요.</p>
          <button onClick={() => setPhase('task')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
        </div>
      </div>
    )
  }

  if (phase === 'task') {
    return frame(
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full animate-fade-in">
          <p className="text-center text-navy text-lg font-light mb-1">지금, 딱 이거 하나</p>
          <p className="text-center text-r-gray-soft text-xs mb-8">작게. '보고서'가 아니라 '첫 문단만'.</p>
          <input
            value={task} onChange={(e) => setTask(e.target.value)}
            placeholder="예: 메일 한 통만 보내기" autoFocus
            className="w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition text-center"
          />
          <button
            onClick={() => task.trim() && setPhase('clear')}
            disabled={!task.trim()}
            className={`w-full py-4 rounded-full transition mt-5 ${task.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          >
            정했어요
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'clear') {
    const left = DISTRACTIONS.length - flungCount
    return frame(
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative select-none" style={FOCUS_BG}>
        <p className="text-white/90 text-lg font-light mb-1">방해되는 것들, 휙 던져 치워요</p>
        <p className="text-white/40 text-xs mb-14">잡고 아무 방향으로 튕기면 돼요 · {left}개 남음</p>

        <div className="flex items-end justify-center gap-8 flex-wrap" style={{ minHeight: 140 }}>
          <Flickable onFling={fling}><PhoneAway /></Flickable>
          <Flickable onFling={fling}><NotifBubble /></Flickable>
          <Flickable onFling={fling}><Snack /></Flickable>
        </div>

        <button onClick={() => setPhase('charge')} className="absolute bottom-10 text-[12px] text-white/40 hover:text-white/70 transition">그냥 치우기</button>
      </div>,
      { dark: true }
    )
  }

  if (phase === 'charge') {
    const num = charge >= 100 ? '발사' : charge >= 67 ? '1' : charge >= 34 ? '2' : '3'
    return frame(
      <div className="min-h-screen flex flex-col items-center justify-center p-8 select-none" style={FOCUS_BG}>
        {styleTag}
        <p className="text-white/90 text-lg font-light mb-1">로켓을 꾹 눌러 충전</p>
        <p className="text-white/40 text-xs mb-8">가득 차면 발사돼요 · {num !== '발사' ? num : ''}</p>

        <div className="relative mb-8" style={{ width: 160, height: 200 }}>
          <div className={`absolute left-1/2 -translate-x-1/2 ${charge > 0 && charge < 100 ? 'animate-tremor' : ''}`} style={{ bottom: 30 }}>
            <Rocket flame={charge / 100} />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 rounded-sm" style={{ bottom: 18, width: 70, height: 8, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        <div className="w-56 h-2.5 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.14)' }}>
          <div className="h-full rounded-full" style={{ width: `${charge}%`, background: 'linear-gradient(90deg,#E0A33E,#a7f3d0)', transition: 'width .08s linear' }} />
        </div>

        <button
          onPointerDown={() => { holdRef.current = true; audio() }}
          onPointerUp={() => { holdRef.current = false }}
          onPointerLeave={() => { holdRef.current = false }}
          className="px-12 py-4 rounded-full bg-white/15 text-white border border-white/25 text-[15px] active:bg-white/25 transition"
          style={{ touchAction: 'none' }}
        >
          꾹 누르기
        </button>
      </div>,
      { dark: true }
    )
  }

  if (phase === 'launch') {
    return frame(
      <div className="min-h-screen flex items-center justify-center p-8 overflow-hidden" style={FOCUS_BG}>
        {styleTag}
        <style>{`@keyframes fl-liftoff{0%{transform:translate(-50%,0)}100%{transform:translate(-50%,-320px) scale(.7)}}`}</style>
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 320 }}>
          <div className="absolute rounded-full fl-burst" style={{ width: 150, height: 150, bottom: 30, background: 'radial-gradient(circle, rgba(126,214,165,0.5) 0%, rgba(126,214,165,0) 70%)' }} />
          <Sparks />
          <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', animation: 'fl-liftoff 0.95s cubic-bezier(.4,0,.9,.2) forwards' }}>
            <Rocket flame={1} />
          </div>
          <span className="fl-pop font-serif" style={{ fontWeight: 700, fontSize: 46, letterSpacing: '0.05em', color: '#a7f3d0' }}>발사!</span>
        </div>
      </div>,
      { dark: true }
    )
  }

  if (phase === 'go') {
    return frame(
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          <p className="text-r-gray-soft text-xs mb-3 tracking-wide">지금, 딱 이거 하나</p>
          <p className="font-serif text-[26px] text-navy mb-10 leading-snug" style={{ fontWeight: 600 }}>{task}</p>
          <p className="text-r-gray text-sm font-light mb-12 leading-relaxed">
            발사됐어요.<br />이 화면은 닫고, 그 하나만 해봐요.
          </p>
          <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">닫기</button>
        </div>
      </div>
    )
  }

  return null
}

// 잡고 아무 방향으로 튕기면 날아가 사라지는 래퍼(포인터 캡처로 바깥까지 추적)
function Flickable({ children, onFling }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [flung, setFlung] = useState(false)
  const dref = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  const down = (e) => { dref.current = true; start.current = { x: e.clientX, y: e.clientY }; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ } }
  const move = (e) => { if (!dref.current) return; setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y }) }
  const up = (e) => {
    if (!dref.current) return
    dref.current = false
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y
    const dist = Math.hypot(dx, dy)
    if (dist > 60) { const k = 820 / dist; setDrag({ x: dx * k, y: dy * k }); setFlung(true); onFling && onFling() }
    else setDrag({ x: 0, y: 0 })
  }
  return (
    <div
      onPointerDown={down} onPointerMove={move} onPointerUp={up}
      style={{
        touchAction: 'none', cursor: 'grab',
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.06}deg) scale(${flung ? 0.5 : 1})`,
        opacity: flung ? 0 : 1,
        pointerEvents: flung ? 'none' : 'auto',
        transition: dref.current ? 'none' : 'transform .42s cubic-bezier(.4,0,.7,0), opacity .42s ease',
      }}
    >
      {children}
    </div>
  )
}

function Rocket({ flame = 0 }) {
  const fl = Math.max(0.15, flame)
  return (
    <svg width="72" height="120" viewBox="0 0 72 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g style={{ transformOrigin: '36px 92px', transform: `scaleY(${fl})`, transition: 'transform .12s ease' }}>
        <path d="M28 90 Q36 118 44 90 Q36 100 28 90 Z" fill="#f59e0b" opacity="0.9" />
        <path d="M31 90 Q36 108 41 90 Q36 97 31 90 Z" fill="#fde68a" />
      </g>
      <path d="M36 8 C50 24 50 60 46 90 L26 90 C22 60 22 24 36 8 Z" fill="#eef1f6" />
      <path d="M36 8 C43 16 44 40 44 60 L36 60 Z" fill="#ffffff" opacity="0.5" />
      <circle cx="36" cy="42" r="7" fill="#7dbef0" stroke="#c9d6e6" strokeWidth="2" />
      <path d="M26 78 L16 96 L26 90 Z" fill="#e0518a" />
      <path d="M46 78 L56 96 L46 90 Z" fill="#e0518a" />
      <path d="M28 90 L44 90 L41 96 L31 96 Z" fill="#b7c0cf" />
    </svg>
  )
}

function Sparks() {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg className="absolute fl-burst" width="150" height="150" viewBox="0 0 150 150" style={{ overflow: 'visible', bottom: 30 }} aria-hidden="true">
      {angles.map((a) => (
        <line key={a} x1="75" y1="75" x2="75" y2="34" stroke="rgba(167,243,208,0.85)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 75 75)`} />
      ))}
    </svg>
  )
}

// 방해물 1 — 폰(알림 배지)
function PhoneAway() {
  return (
    <svg width="96" height="112" viewBox="0 0 96 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="fl-phone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#eef1f6" /><stop offset="100%" stopColor="#cfd6e2" /></linearGradient>
      </defs>
      <rect x="30" y="16" width="40" height="80" rx="11" fill="url(#fl-phone)" stroke="#b7c0cf" strokeWidth="1.5" />
      <rect x="35" y="27" width="30" height="58" rx="4" fill="#e7ebf2" />
      <circle cx="50" cy="90" r="2.4" fill="#b7c0cf" />
      <circle cx="72" cy="20" r="11" fill="#ef4444" />
      <text x="72" y="24" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">3</text>
    </svg>
  )
}

// 방해물 2 — SNS 알림 말풍선
function NotifBubble() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 26 Q20 16 32 16 L70 16 Q82 16 82 28 L82 52 Q82 64 70 64 L44 64 L32 76 L34 64 Q20 63 20 52 Z" fill="#8ab4f8" />
      <circle cx="40" cy="40" r="3.5" fill="#fff" />
      <circle cx="52" cy="40" r="3.5" fill="#fff" />
      <circle cx="64" cy="40" r="3.5" fill="#fff" />
      <circle cx="74" cy="22" r="9" fill="#ef4444" />
      <text x="74" y="26" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">9+</text>
    </svg>
  )
}

// 방해물 3 — 간식(도넛)
function Snack() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="44" cy="46" r="30" fill="#e7a977" />
      <circle cx="44" cy="46" r="29" fill="none" stroke="#c98a5a" strokeWidth="2" opacity="0.5" />
      <path d="M18 40 Q30 22 52 20 Q72 19 72 40 Q60 30 44 32 Q28 33 18 40 Z" fill="#f4c9e0" />
      <circle cx="44" cy="46" r="11" fill="#fbf7ee" />
      <g fill="#7dbef0"><rect x="34" y="30" width="4" height="8" rx="2" transform="rotate(30 36 34)" /></g>
      <g fill="#f6bd4e"><rect x="55" y="34" width="4" height="8" rx="2" transform="rotate(-20 57 38)" /></g>
      <g fill="#87d3a6"><rect x="48" y="60" width="4" height="8" rx="2" transform="rotate(50 50 64)" /></g>
    </svg>
  )
}
