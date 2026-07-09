import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'
import charmPool from '../content/luckyCharms.json'

// 행운 캡슐 — 뽑기 기계 리추얼(v4 ⑥ 계열). 손잡이를 돌리면 캡슐이 톡 떨어지고,
// 열면 오늘의 작은 징표(네잎클로버·별·깃털…)와 한 줄이 나온다.
// 근거를 주장하지 않는 순수 의례 — 운명 단정 금지, 끝은 지지로.
// 리추얼이므로 EndRating 없음.
const DRAWN_KEY = 'roulin_capsule_drawn' // 최근 뽑은 징표 id — 연속 중복 방지
const DRAWN_MAX = 5

function drawCharm() {
  let recent = []
  try {
    const raw = JSON.parse(localStorage.getItem(DRAWN_KEY) || '[]')
    if (Array.isArray(raw)) recent = raw
  } catch { /* noop */ }
  let pool = charmPool.items.filter((it) => !recent.includes(it.id))
  if (pool.length === 0) pool = [...charmPool.items]
  const prize = pool[Math.floor(Math.random() * pool.length)]
  try {
    const log = recent.filter((x) => x !== prize.id)
    log.push(prize.id)
    localStorage.setItem(DRAWN_KEY, JSON.stringify(log.slice(-DRAWN_MAX)))
  } catch { /* noop */ }
  return prize
}

// ── 징표 아이콘 (코드 SVG — 글래스 젬 패밀리 톤) ──
function CharmIcon({ type, className }) {
  const base = { viewBox: '0 0 48 48', className, 'aria-hidden': true }
  switch (type) {
    case 'clover':
      return (
        <svg {...base}>
          {[[24, 14.5], [33.5, 24], [24, 33.5], [14.5, 24]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7.5" fill="#E0A33E" opacity="0.92" />
          ))}
          <circle cx="24" cy="24" r="2.5" fill="#FFF6E4" />
          <path d="M27 31 C29 36 28 40 26 43" stroke="#C88A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'star':
      return (
        <svg {...base}>
          <path d="M24 4c1.2 10.5 7.5 16.8 17.5 17.5-10 .7-16.3 7-17.5 17.5C22.8 28.5 16.5 22.2 6.5 21.5 16.5 20.8 22.8 14.5 24 4Z" fill="#E0A33E" />
          <circle cx="35" cy="11" r="1.6" fill="#E0A33E" opacity="0.6" />
        </svg>
      )
    case 'feather':
      return (
        <svg {...base}>
          <path d="M33 8 C21 12 12 26 11 40 C25 37 33 24 33 8 Z" fill="#F3E7CC" stroke="#E0A33E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M30 13 C23 20 16 30 13 38" stroke="#C88A2E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...base}>
          <path d="M31 6 A18 18 0 1 0 31 42 A14.5 14.5 0 1 1 31 6 Z" fill="#E0A33E" />
          <circle cx="34" cy="14" r="1.4" fill="#E0A33E" opacity="0.55" />
        </svg>
      )
    case 'key':
      return (
        <svg {...base} fill="none" stroke="#E0A33E" strokeWidth="3" strokeLinecap="round">
          <circle cx="17" cy="17" r="7.5" />
          <path d="M22.5 22.5 L37 37" />
          <path d="M31 31 L35 27" />
          <path d="M34.5 34.5 L38.5 30.5" />
        </svg>
      )
    case 'seed':
      return (
        <svg {...base}>
          <path d="M24 7 C33.5 19 33.5 30 24 40 C14.5 30 14.5 19 24 7 Z" fill="#F3E7CC" stroke="#E0A33E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 15 C24 22 24 29 24 35" stroke="#C88A2E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 'ribbon':
      return (
        <svg {...base}>
          <path d="M24 24 C15 13 5 17 8 24 C5 31 15 35 24 24 Z" fill="#F3E7CC" stroke="#E0A33E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M24 24 C33 13 43 17 40 24 C43 31 33 35 24 24 Z" fill="#F3E7CC" stroke="#E0A33E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 28 L17 39 M28 28 L31 39" stroke="#E0A33E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="24" r="3.5" fill="#E0A33E" />
        </svg>
      )
    case 'pebble':
      return (
        <svg {...base}>
          <ellipse cx="24" cy="36" rx="15" ry="5.5" fill="#E0A33E" opacity="0.35" />
          <ellipse cx="24" cy="28" rx="11" ry="5" fill="#E0A33E" opacity="0.6" />
          <ellipse cx="24" cy="20" rx="7" ry="4.5" fill="#E0A33E" />
        </svg>
      )
    default:
      return null
  }
}

// 미니 캡슐(돔 안 장식)
function MiniCapsule({ color, className }) {
  return (
    <span className={`absolute w-7 h-7 ${className}`} aria-hidden="true">
      <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full" style={{ background: color }} />
      <span className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-white/95" />
      <span className="absolute left-1.5 top-1 w-1.5 h-1.5 rounded-full bg-white/80" />
    </span>
  )
}

export default function LuckyCapsule({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → dropped → open
  const [turning, setTurning] = useState(false)
  const [prize, setPrize] = useState(null)
  const audioRef = useRef(null)
  const { isMuted } = useSpeech()

  // ── 소리 (코드 합성, 소리끄기 존중) ──
  const ctx = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    if (!audioRef.current) audioRef.current = new Ctx()
    if (audioRef.current.state === 'suspended') audioRef.current.resume()
    return audioRef.current
  }
  const snap = (c, at, freq, dur, vol) => {
    const len = Math.ceil(c.sampleRate * dur)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
    const src = c.createBufferSource()
    src.buffer = buf
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = freq
    bp.Q.value = 0.9
    const g = c.createGain()
    const t = c.currentTime + at
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    src.connect(bp); bp.connect(g); g.connect(c.destination)
    src.start(t)
  }
  const tone = (c, at, f0, f1, dur, vol) => {
    const o = c.createOscillator()
    const g = c.createGain()
    const t = c.currentTime + at
    o.type = 'sine'
    o.frequency.setValueAtTime(f0, t)
    o.frequency.exponentialRampToValueAtTime(f1, t + dur)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(g); g.connect(c.destination)
    o.start(t); o.stop(t + dur + 0.02)
  }
  const playRatchet = () => { // 드르륵 — 손잡이
    if (isMuted) return
    const c = ctx(); if (!c) return
    for (let i = 0; i < 6; i++) snap(c, i * 0.11, 3800, 0.025, 0.14)
  }
  const playThunk = () => { // 툭 — 캡슐 낙하
    if (isMuted) return
    const c = ctx(); if (!c) return
    tone(c, 0, 220, 90, 0.12, 0.35)
    snap(c, 0.02, 900, 0.06, 0.2)
  }
  const playPop = () => { // 뽁 + 반짝 — 캡슐 개봉
    if (isMuted) return
    const c = ctx(); if (!c) return
    tone(c, 0, 520, 240, 0.1, 0.3)
    snap(c, 0.05, 5200, 0.14, 0.1)
  }

  const turn = () => {
    if (turning) return
    setTurning(true)
    setPrize(drawCharm())
    playRatchet()
    setTimeout(() => { playThunk(); setPhase('dropped') }, 850)
  }
  const openCapsule = () => {
    playPop()
    setPhase('open')
  }

  return (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          {phase === 'intro' && (
            <>
              <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>행운 캡슐</p>
              <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
              <p className="text-[14px] text-r-gray font-light mb-10 leading-relaxed">
                오늘의 작은 징표가 들어 있어요.<br />손잡이를 천천히 돌려봐요.
              </p>

              {/* 뽑기 기계 */}
              <div className="relative mx-auto mb-10 w-56">
                {/* 돔 */}
                <div
                  className="relative mx-auto w-44 h-44 rounded-full border border-[#DCD5C4] overflow-hidden"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(233,238,242,0.45) 100%)', boxShadow: 'inset 0 -14px 24px rgba(17,35,56,0.06)' }}
                >
                  <MiniCapsule color="#E0A33E" className="left-7 bottom-6 rotate-[-14deg]" />
                  <MiniCapsule color="#8BA898" className="left-[70px] bottom-4 rotate-[8deg]" />
                  <MiniCapsule color="#7C9AB8" className="right-7 bottom-7 rotate-[20deg]" />
                  <MiniCapsule color="#D9A5A0" className="left-12 bottom-14 rotate-[26deg]" />
                  <MiniCapsule color="#E0A33E" className="right-12 bottom-16 rotate-[-22deg]" />
                  {/* 유리 하이라이트 */}
                  <span className="absolute left-5 top-4 w-14 h-8 rounded-full bg-white/70 blur-[6px] rotate-[-24deg]" aria-hidden="true" />
                </div>
                {/* 몸통 */}
                <div
                  className="relative mx-auto -mt-7 w-52 rounded-3xl pt-10 pb-6"
                  style={{ background: 'linear-gradient(160deg, #1E3A5C 0%, #112338 60%, #0A1626 100%)', boxShadow: '0 18px 36px rgba(17,35,56,0.24)' }}
                >
                  {/* 손잡이 */}
                  <button
                    onClick={turn}
                    aria-label="손잡이 돌리기"
                    className="mx-auto flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber/60 bg-amber-soft transition-transform duration-[800ms] hover:scale-105"
                    style={{ transform: turning ? 'rotate(210deg)' : 'rotate(0deg)' }}
                  >
                    <span className="w-1.5 h-8 rounded-full bg-amber" />
                  </button>
                  {/* 배출구 */}
                  <div className="mx-auto mt-5 w-20 h-9 rounded-xl" style={{ background: '#07101D', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6)' }} />
                </div>
              </div>

              <button onClick={turn} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition" disabled={turning}>
                {turning ? '달그락…' : '손잡이 돌리기'}
              </button>
            </>
          )}

          {phase === 'dropped' && (
            <>
              <p className="eyebrow mb-10">톡 — 캡슐이 나왔어요</p>
              <button
                onClick={openCapsule}
                aria-label="캡슐 열기"
                className="relative mx-auto block w-28 h-28 mb-10 transition-transform hover:scale-105"
                style={{ animation: 'capDrop 0.6s cubic-bezier(0.3, 1.4, 0.5, 1) both' }}
              >
                <span className="absolute -inset-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,163,62,0.20) 0%, rgba(224,163,62,0) 70%)' }} />
                <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full" style={{ background: 'linear-gradient(150deg, #F0C878 0%, #E0A33E 70%)' }} />
                <span className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-white" style={{ boxShadow: 'inset 0 -6px 12px rgba(17,35,56,0.08)' }} />
                <span className="absolute inset-x-3 top-1/2 h-px bg-black/10" />
                <span className="absolute left-5 top-3.5 w-5 h-3 rounded-full bg-white/70 blur-[2px] rotate-[-20deg]" />
              </button>
              <style>{`@keyframes capDrop {
                0%   { transform: translateY(-110px) scale(0.7); opacity: 0; }
                55%  { transform: translateY(10px) scale(1.03); opacity: 1; }
                75%  { transform: translateY(-6px) scale(1); }
                100% { transform: translateY(0) scale(1); }
              }`}</style>
              <p className="text-[12px] text-r-gray-soft">캡슐을 톡, 눌러서 열어봐요.</p>
            </>
          )}

          {phase === 'open' && prize && (
            <>
              <p className="eyebrow mb-8">오늘의 징표</p>

              {/* 열린 캡슐 반쪽들 */}
              <div className="relative flex items-end justify-center gap-16 mb-[-34px]" aria-hidden="true">
                <span className="relative w-14 h-14" style={{ animation: 'halfL 0.5s ease both' }}>
                  <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full" style={{ background: 'linear-gradient(150deg, #F0C878, #E0A33E)' }} />
                  <span className="absolute inset-x-0 bottom-0 h-1/2" />
                </span>
                <span className="relative w-14 h-14" style={{ animation: 'halfR 0.5s ease both' }}>
                  <span className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-white" style={{ boxShadow: 'inset 0 -4px 8px rgba(17,35,56,0.08)' }} />
                </span>
              </div>

              {/* 징표 카드 — 위로 뽑기 공개 카드와 같은 결 */}
              <div className="mb-10" style={{ perspective: '1000px' }}>
                <div
                  className="relative mx-auto w-72 rounded-3xl overflow-hidden flex flex-col items-center justify-center px-8 py-10"
                  style={{
                    animation: 'charmUp 0.65s 0.2s cubic-bezier(0.2, 0.75, 0.3, 1) both',
                    background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
                    boxShadow: '0 26px 52px rgba(17,35,56,0.18), 0 5px 14px rgba(17,35,56,0.08)',
                  }}
                >
                  <span className="absolute inset-[8px] rounded-[20px] border border-amber/40 pointer-events-none" />
                  <span className="absolute inset-[13px] rounded-2xl border border-amber/12 pointer-events-none" />
                  <span className="relative flex items-center justify-center w-20 h-20 mb-3">
                    <span className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,163,62,0.22) 0%, rgba(224,163,62,0) 72%)' }} />
                    <CharmIcon type={prize.charm} className="w-12 h-12" />
                  </span>
                  <p className="text-[11px] tracking-[0.14em] text-amber mb-3" style={{ fontWeight: 600 }}>{prize.name}</p>
                  <p className="font-serif text-[17px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>{prize.text}</p>
                  <span className="mt-6 w-8 h-px bg-amber/50" />
                </div>
                <style>{`
                  @keyframes halfL { 0% { transform: translate(28px, 0) rotate(0); opacity: 0.4; } 100% { transform: translate(0, 0) rotate(-18deg); opacity: 1; } }
                  @keyframes halfR { 0% { transform: translate(-28px, 0) rotate(0); opacity: 0.4; } 100% { transform: translate(0, 0) rotate(18deg); opacity: 1; } }
                  @keyframes charmUp { 0% { transform: translateY(18px) scale(0.94); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
                `}</style>
              </div>

              <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
                오늘의 몫으로 챙길게요
              </button>
              <p className="mt-4 text-[12px] text-r-gray-soft">캡슐은 다시 채워둘게요.</p>
            </>
          )}
        </div>
      </div>
    </ModuleFrame>
  )
}
