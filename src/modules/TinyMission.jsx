import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'
import pool from '../content/tinyMissions.json'

// 소소한 미션 — '그냥 재밌는 것' 코너.
// 뽑기로 30초~2분짜리 다정하고 엉뚱한 미션 한 개. 하고 나면 살짝 기분이 좋아지는.
// 저장 없음(세션 내 중복만 방지). EndRating 없음 — 리추얼의 결.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 32%, #0f3b3e 0%, #0b2528 68%, #071618 100%)' }
const MISSIONS = pool.missions

export default function TinyMission({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro | pulling | reveal
  const [cur, setCur] = useState(null)
  const seenRef = useRef([])

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  // 뽑힐 때 경쾌한 '또롱'
  const ding = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    ;[523, 659, 784].forEach((f, i) => {
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f
      const g = c.createGain(); const at = t + i * 0.08
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.14, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4)
      o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + 0.42)
    })
  }

  const pick = () => {
    let poolIdx = MISSIONS.map((_, i) => i).filter((i) => !seenRef.current.includes(i))
    if (poolIdx.length === 0) { seenRef.current = []; poolIdx = MISSIONS.map((_, i) => i) }
    const idx = poolIdx[Math.floor(Math.random() * poolIdx.length)]
    seenRef.current.push(idx)
    return MISSIONS[idx]
  }

  const draw = () => {
    setPhase('pulling')
    setTimeout(() => { setCur(pick()); ding(); setPhase('reveal') }, 850)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>소소한 미션</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Capsule /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              귀찮지만 하고 나면 살짝 기분 좋아지는,<br />30초짜리 미션 하나를 뽑아드려요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">안 해도 괜찮아요. 그냥 뽑아 보는 재미로도 충분해요.</p>
            <button onClick={draw}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              미션 뽑기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'pulling') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <style>{`@keyframes tm-shake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-6px) rotate(-7deg)}75%{transform:translateX(6px) rotate(7deg)}}`}</style>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div style={{ animation: 'tm-shake .3s ease-in-out infinite' }}><Capsule /></div>
          <p className="text-white/50 text-[13px] mt-8">뽑는 중…</p>
        </div>
      </ModuleFrame>
    )
  }

  // reveal
  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
        <div className="max-w-md w-full text-center animate-fade-up">
          <div className="text-[52px] mb-5 leading-none">{cur.emoji}</div>
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] px-6 py-8 mb-9">
            <p className="text-amber/70 text-[11px] tracking-widest mb-3">오늘의 소소한 미션</p>
            <p className="text-white text-[19px] font-light leading-relaxed">{cur.text}</p>
          </div>
          <button onClick={draw} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">다른 미션</button>
          <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
        </div>
      </div>
    </ModuleFrame>
  )
}

function Capsule() {
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" fill="none" aria-hidden="true">
      <circle cx="46" cy="46" r="34" fill="url(#tmh)" opacity="0.4" />
      <g transform="rotate(-32 46 46)">
        <rect x="26" y="20" width="40" height="52" rx="20" fill="#f6e6b0" />
        <path d="M26 46a20 20 0 0 1 40 0z" fill="#4fd6c8" />
        <rect x="26" y="20" width="40" height="52" rx="20" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
        <ellipse cx="38" cy="34" rx="5" ry="8" fill="#ffffff" opacity="0.5" />
      </g>
      <defs><radialGradient id="tmh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#4fd6c8" /><stop offset="1" stopColor="#4fd6c8" stopOpacity="0" /></radialGradient></defs>
    </svg>
  )
}
