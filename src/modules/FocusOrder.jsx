import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 순서대로 — '집중이 안 될 때' 코너. Trail Making(주의·실행기능) 기반.
// 흩어진 숫자를 1부터 차례로 이어간다. 맞게 이으면 트레일이 그려지고 음이 오른다.
// 틀려도 벌칙 없이 부드럽게. 점수 경쟁 아님 — 내 리듬(시간)만 살짝 갱신.
const COUNTS = [8, 12, 16]
const BEST_KEY = 'roulin_trail_best'
const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760] // 펜타토닉 상승

const loadBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') || {} } catch { return {} } }

function scatter(count, w, h, pad, minDist) {
  const pts = []
  for (let n = 1; n <= count; n++) {
    let p, ok = false, tries = 0
    while (!ok && tries < 400) {
      p = { x: pad + Math.random() * (w - 2 * pad), y: pad + Math.random() * (h - 2 * pad) }
      ok = pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minDist)
      tries++
    }
    pts.push({ n, x: p.x, y: p.y })
  }
  return pts
}

export default function FocusOrder({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [count, setCount] = useState(12)
  const [pts, setPts] = useState([])
  const [done, setDone] = useState(0)       // 이어진 개수(다음 목표 = done+1)
  const [wrong, setWrong] = useState(0)     // 흔들 대상 n
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState({ sec: 0, best: null })
  const areaRef = useRef(null)
  const startRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const audio = () => {
    if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (C) acRef.current = new C() }
    const c = acRef.current; if (c && c.state === 'suspended') c.resume(); return c
  }
  const beep = (freq, vol, type = 'sine', dur = 0.16) => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const o = c.createOscillator(); const g = c.createGain()
    o.type = type; o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const startGame = (n) => { setCount(n); setDone(0); setWrong(0); setElapsed(0); setResult({ sec: 0, best: null }); setPhase('play') }

  // 판 생성 + 타이머
  useEffect(() => {
    if (phase !== 'play') return
    const el = areaRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const minDist = Math.max(58, Math.min(rect.width, rect.height) / Math.sqrt(count) * 0.85)
    setPts(scatter(count, rect.width, rect.height, 34, minDist))
    startRef.current = Date.now()
    const iv = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 200)
    return () => clearInterval(iv)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (n) => {
    if (n === done + 1) {
      const nd = done + 1
      setDone(nd)
      beep(PENTA[(nd - 1) % PENTA.length], 0.12, 'triangle')
      if (nd >= count) {
        const sec = Math.round((Date.now() - startRef.current) / 10) / 100
        const best = loadBest(); const prev = best[count]
        const isBest = prev == null || sec < prev
        if (isBest) { best[count] = sec; try { localStorage.setItem(BEST_KEY, JSON.stringify(best)) } catch { /* noop */ } }
        setTimeout(() => setResult({ sec, best: isBest ? null : prev }), 350)
        setTimeout(() => setPhase('done'), 400)
      }
    } else if (n !== done) {
      setWrong(n); beep(196, 0.07, 'triangle', 0.12)
      setTimeout(() => setWrong(0), 320)
    }
  }

  const mm = String(Math.floor(elapsed / 60))
  const ss = String(Math.floor(elapsed % 60)).padStart(2, '0')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>순서대로</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
              흩어진 숫자를 1부터 순서대로<br />톡톡 이어 보세요.
            </p>
            <p className="text-[12px] text-r-gray-soft mb-10">급하지 않아도 돼요. 틀려도 괜찮아요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {COUNTS.map((n, i) => (
                <button key={n} onClick={() => startGame(n)}
                  className="py-4 rounded-2xl bg-white text-navy border border-line hover:border-[#DCD5C4] transition" style={{ fontWeight: 600 }}>
                  {['짧게', '보통', '길게'][i]}<br /><span className="text-[11px] text-r-gray-soft">{n}개</span>
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
        <style>{`@keyframes fo-shake{0%,100%{transform:translate(-50%,-50%)}25%{transform:translate(calc(-50% - 5px),-50%)}75%{transform:translate(calc(-50% + 5px),-50%)}}.fo-shake{animation:fo-shake .3s ease}`}</style>
        <div ref={areaRef} className="min-h-screen bg-cream relative overflow-hidden select-none" style={{ touchAction: 'none' }}>
          <div className="absolute top-16 left-0 right-0 text-center pointer-events-none z-10">
            <p className="text-r-gray-soft text-[12px] tabular-nums">{mm}:{ss} · {done}/{count}</p>
          </div>

          {/* 트레일 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {done >= 2 && (
              <polyline
                points={pts.filter((p) => p.n <= done).sort((a, b) => a.n - b.n).map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none" stroke="#E0A33E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75"
              />
            )}
          </svg>

          {/* 숫자 */}
          {pts.map((p) => {
            const isDone = p.n <= done
            const isNext = p.n === done + 1
            return (
              <button
                key={p.n}
                onClick={() => tap(p.n)}
                className={`absolute rounded-full flex items-center justify-center transition-colors ${wrong === p.n ? 'fo-shake' : ''}`}
                style={{
                  left: p.x, top: p.y, transform: 'translate(-50%, -50%)',
                  width: 42, height: 42, fontWeight: 600, fontSize: 16,
                  color: isDone ? '#0c1a2b' : '#112338',
                  background: isDone ? '#F3E7CC' : '#ffffff',
                  border: isDone ? '1.5px solid rgba(224,163,62,0.7)' : '1.5px solid #E7E2D5',
                  boxShadow: isNext ? '0 0 0 3px rgba(224,163,62,0.12)' : '0 1px 3px rgba(120,100,70,0.12)',
                }}
              >
                {p.n}
              </button>
            )
          })}
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-r-gray-soft text-[13px] mb-1 tracking-wide">1부터 {count}까지 다 이었어요</p>
            <p className="font-serif text-[34px] text-navy mb-2" style={{ fontWeight: 600 }}>{result.sec}초</p>
            {result.best == null
              ? <p className="text-amber text-[13px] mb-10">가장 빠른 리듬이에요 ✨</p>
              : <p className="text-r-gray-soft text-[12px] mb-10">내 최고 {result.best}초</p>}
            <button onClick={() => startGame(count)} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mb-3">
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
