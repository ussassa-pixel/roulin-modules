import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 집중력 카드 — '집중이 안 될 때' 코너. 메모리 매칭(작업기억·주의).
// 뒤집어 같은 짝을 찾는다. 3D 플립·글래스 카드. 점수 경쟁 아님 — 내 시간/횟수만 살짝 갱신.
const PAIRS = [6, 8, 10]
const BEST_KEY = 'roulin_memory_best'
const GLYPHS = [
  { key: 'star', color: '#f6bd4e' }, { key: 'moon', color: '#8ea6e8' }, { key: 'heart', color: '#f08aa6' },
  { key: 'leaf', color: '#7dc98a' }, { key: 'drop', color: '#6fc3e0' }, { key: 'flower', color: '#e59ad0' },
  { key: 'sun', color: '#f2a35b' }, { key: 'cloud', color: '#a9b7c9' }, { key: 'gem', color: '#b79df8' },
  { key: 'sprout', color: '#86c98f' },
]
const loadBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {} } catch { return {} } }
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[r[i], r[j]] = [r[j], r[i]] } return r }

export default function FocusMemory({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [pairs, setPairs] = useState(8)
  const [cards, setCards] = useState([]) // {id, g, matched}
  const [up, setUp] = useState([])       // 현재 뒤집힌 카드 id (0~2)
  const [moves, setMoves] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState({ sec: 0, moves: 0, best: null })
  const lockRef = useRef(false)
  const finishedRef = useRef(false)
  const startRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const audio = () => {
    if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (C) acRef.current = new C() }
    const c = acRef.current; if (c && c.state === 'suspended') c.resume(); return c
  }
  const note = (f, s, d, v, type = 'sine') => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const o = c.createOscillator(); const g = c.createGain()
    o.type = type; o.frequency.setValueAtTime(f, t + s)
    g.gain.setValueAtTime(0, t + s); g.gain.linearRampToValueAtTime(v, t + s + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + s + d)
    o.connect(g); g.connect(c.destination); o.start(t + s); o.stop(t + s + d + 0.02)
  }
  const sFlip = () => note(620, 0, 0.09, 0.07, 'sine')
  const sMatch = () => { note(784, 0, 0.14, 0.11, 'triangle'); note(1175, 0.08, 0.2, 0.1, 'sine') }
  const sMiss = () => note(200, 0, 0.13, 0.06, 'triangle')
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const startGame = (p) => {
    const gl = GLYPHS.slice(0, p)
    const deck = shuffle([...gl, ...gl].map((g, i) => ({ id: i, g })))
    setCards(deck); setUp([]); setMoves(0); setElapsed(0); setResult({ sec: 0, moves: 0, best: null })
    lockRef.current = false; finishedRef.current = false; setPairs(p); setPhase('play')
  }

  useEffect(() => {
    if (phase !== 'play') return
    startRef.current = Date.now()
    const iv = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 250)
    return () => clearInterval(iv)
  }, [phase])

  const flip = (card) => {
    if (lockRef.current || card.matched || up.includes(card.id)) return
    sFlip()
    const nextUp = [...up, card.id]
    setUp(nextUp)
    if (nextUp.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextUp.map((id) => cards.find((c) => c.id === id))
      lockRef.current = true
      if (a.g.key === b.g.key) {
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)))
          setUp([]); sMatch(); lockRef.current = false
        }, 360)
      } else {
        sMiss()
        setTimeout(() => { setUp([]); lockRef.current = false }, 820)
      }
    }
  }

  // 전부 맞으면 완료(한 번만)
  useEffect(() => {
    if (phase !== 'play' || finishedRef.current) return
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      finishedRef.current = true
      const sec = Math.round((Date.now() - startRef.current) / 100) / 10
      const best = loadBest(); const prev = best[pairs]
      const isBest = prev == null || sec < (prev.sec ?? Infinity)
      if (isBest) { best[pairs] = { sec, moves }; try { localStorage.setItem(BEST_KEY, JSON.stringify(best)) } catch { /* noop */ } }
      setTimeout(() => { setResult({ sec, moves, best: isBest ? null : prev }); setPhase('done') }, 550)
    }
  }, [cards, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(elapsed / 60))
  const ss = String(Math.floor(elapsed % 60)).padStart(2, '0')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>집중력 카드</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
              뒤집어 같은 짝을 찾아보세요.<br />어디에 뭐가 있었는지 가만히 기억하며.
            </p>
            <p className="text-[12px] text-r-gray-soft mb-10">천천히 해도 돼요. 기억하는 연습이에요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {PAIRS.map((p, i) => (
                <button key={p} onClick={() => startGame(p)}
                  className="py-4 rounded-2xl bg-white text-navy border border-line hover:border-[#DCD5C4] transition" style={{ fontWeight: 600 }}>
                  {['쉬움', '보통', '많이'][i]}<br /><span className="text-[11px] text-r-gray-soft">{p}쌍</span>
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
      <ModuleFrame onExit={onExit}>
        <style>{`
          .mc-card{perspective:640px}
          .mc-inner{position:relative;width:100%;height:100%;transition:transform .45s cubic-bezier(.3,.7,.3,1);transform-style:preserve-3d}
          .mc-inner.up{transform:rotateY(180deg)}
          .mc-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center;border-radius:15px}
          .mc-front{transform:rotateY(180deg)}
        `}</style>
        <div className="min-h-screen bg-cream flex flex-col items-center p-6 pt-14">
          <p className="text-r-gray-soft text-[12px] tabular-nums tracking-wide mb-5">{mm}:{ss} · {moves}번</p>
          <div className="grid gap-2.5 w-full" style={{ maxWidth: 380, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {cards.map((c) => {
              const isUp = up.includes(c.id) || c.matched
              return (
                <div key={c.id} className="mc-card" style={{ aspectRatio: '3 / 4' }} onClick={() => flip(c)}>
                  <div className={`mc-inner ${isUp ? 'up' : ''}`}>
                    <div className="mc-face mc-back" style={{
                      background: 'linear-gradient(150deg, #16283f 0%, #24405f 100%)',
                      boxShadow: '0 3px 8px rgba(17,35,56,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
                      border: '1px solid rgba(224,163,62,0.25)',
                    }}>
                      <BackStar />
                    </div>
                    <div className="mc-face mc-front" style={{
                      background: 'radial-gradient(circle at 38% 30%, #ffffff 0%, #f6f2e8 100%)',
                      border: `1.5px solid ${c.matched ? c.g.color : '#E7E2D5'}`,
                      boxShadow: c.matched
                        ? `0 0 16px 3px ${c.g.color}88, inset 0 1px 1px rgba(255,255,255,0.7)`
                        : '0 2px 7px rgba(120,100,70,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
                      opacity: c.matched ? 0.92 : 1,
                    }}>
                      <Glyph k={c.g.key} color={c.g.color} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-r-gray-soft text-[13px] mb-1 tracking-wide">{pairs}쌍을 다 맞췄어요</p>
            <p className="font-serif text-[34px] text-navy mb-1" style={{ fontWeight: 600 }}>{result.sec}초</p>
            <p className="text-r-gray-soft text-[12px] mb-2">{result.moves}번 뒤집어서</p>
            {result.best == null
              ? <p className="text-amber text-[13px] mb-10">가장 빠른 기억이에요 ✨</p>
              : <p className="text-r-gray-soft text-[12px] mb-10">내 최고 {result.best.sec}초</p>}
            <button onClick={() => startGame(pairs)} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mb-3">
              다시 (새 배치)
            </button>
            <button onClick={onExit} className="w-full py-4 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 카드 뒷면 워터마크 별
function BackStar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" fill="rgba(224,163,62,0.6)" />
    </svg>
  )
}

// 카드 앞면 심볼
function Glyph({ k, color }) {
  const s = 30
  const wrap = (inner) => <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">{inner}</svg>
  switch (k) {
    case 'star': return wrap(<path d="M16 2c.9 8 5.8 12.9 14 14-8.2 1.1-13.1 6-14 14-.9-8-5.8-12.9-14-14C10.2 14.9 15.1 10 16 2Z" fill={color} />)
    case 'moon': return wrap(<path d="M22 6a11 11 0 1 0 4 12A9 9 0 0 1 22 6Z" fill={color} />)
    case 'heart': return wrap(<path d="M16 27C6 20 4 14 4 11a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 3-2 9-12 16Z" fill={color} />)
    case 'leaf': return wrap(<path d="M6 26C6 12 18 6 27 6c0 14-12 20-21 20Z" fill={color} /> )
    case 'drop': return wrap(<path d="M16 4c6 8 9 12 9 16a9 9 0 0 1-18 0c0-4 3-8 9-16Z" fill={color} />)
    case 'flower': return wrap(<g fill={color}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="16" cy="8" rx="4.5" ry="8" transform={`rotate(${a} 16 16)`} />)}<circle cx="16" cy="16" r="4" fill="#fff" opacity="0.85" /></g>)
    case 'sun': return wrap(<g fill={color}><circle cx="16" cy="16" r="7" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <rect key={a} x="15" y="1" width="2" height="5" rx="1" transform={`rotate(${a} 16 16)`} />)}</g>)
    case 'cloud': return wrap(<path d="M9 22a5 5 0 0 1 0-10 7 7 0 0 1 13-2 5 5 0 0 1 1 12Z" fill={color} />)
    case 'gem': return wrap(<g fill={color}><path d="M16 4l10 8-10 16L6 12Z" /><path d="M6 12h20" stroke="#fff" strokeWidth="1" opacity="0.5" /></g>)
    case 'sprout': return wrap(<g><path d="M16 28V14" stroke={color} strokeWidth="2.5" strokeLinecap="round" /><path d="M16 16C10 16 6 12 6 8c5 0 10 2 10 8Z" fill={color} /><path d="M16 18c6 0 10-4 10-8-5 0-10 2-10 8Z" fill={color} /></g>)
    default: return wrap(<circle cx="16" cy="16" r="9" fill={color} />)
  }
}
