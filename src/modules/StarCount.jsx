import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 별 세기 — '잠이 안 올 때' 코너.
// 양 세기의 리이매진. 탭할 때마다 밤하늘에 별이 하나씩 놓이고, 셀수록 하늘이 깊어진다.
// 목표·점수 없음. 눈이 무거워지면 그대로 두면 되는, 스르르 가라앉는 결.
const NIGHT_BG = { background: 'radial-gradient(ellipse at 50% 20%, #1a2544 0%, #0c1226 60%, #070a16 100%)' }
const ENOUGH = 20

export default function StarCount({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [stars, setStars] = useState([])
  const areaRef = useRef(null)
  const idRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => {
    if (mutedRef.current) return null
    try {
      if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() }
      if (acRef.current.state === 'suspended') acRef.current.resume()
      return acRef.current
    } catch { return null }
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  // 아주 여린 별 소리 — 배음 두 겹의 사인, 길게 사라짐
  const chime = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    const base = 520 + Math.random() * 340
    ;[base, base * 1.5].forEach((f, i) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f
      const g = c.createGain()
      const peak = i === 0 ? 0.07 : 0.03
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400
      o.connect(g); g.connect(lp); lp.connect(c.destination); o.start(t); o.stop(t + 1.7)
    })
  }

  const place = (e) => {
    const el = areaRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    if (y > 90) return // 하단 문구 영역은 제외
    chime()
    setStars((s) => [...s, { id: idRef.current++, x, y, s: 0.7 + Math.random() * 0.8, d: (Math.random() * 2).toFixed(2) }])
  }

  const count = stars.length
  // 셀수록 하늘이 짙어짐(어둠 오버레이)
  const dark = Math.min(0.55, count * 0.022)

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={NIGHT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>별 세기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><StarMark /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              화면을 톡 누를 때마다<br />밤하늘에 별이 하나씩 놓여요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">천천히 세어 보세요. 눈이 무거워지면 그대로 두어도 돼요.</p>
            <button onClick={() => setPhase('play')}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={NIGHT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><StarMark /></div>
            <p className="font-serif text-[26px] text-white mb-2" style={{ fontWeight: 600 }}>별 {count}개를 세었어요</p>
            <p className="text-white/65 text-sm font-light mb-12 leading-relaxed">
              충분해요. 이제 하늘을 그대로 두고,<br />숨을 길게 내쉬어 볼까요.
            </p>
            <button onClick={() => setPhase('play')} className="w-full py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition mb-3">더 세기</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <style>{`@keyframes sc-tw{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}.sc-tw{animation:sc-tw 3.6s ease-in-out infinite}`}</style>
      <div
        ref={areaRef}
        onPointerDown={place}
        className="min-h-screen relative overflow-hidden select-none"
        style={{ ...NIGHT_BG, touchAction: 'none' }}
      >
        {/* 셀수록 짙어지는 하늘 */}
        <div className="absolute inset-0 pointer-events-none transition-[background-color] duration-1000" style={{ background: `rgba(4,6,14,${dark})` }} />

        {stars.map((st) => (
          <span key={st.id} className="sc-tw" style={{
            position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, width: 6 * st.s, height: 6 * st.s,
            marginLeft: -3 * st.s, marginTop: -3 * st.s, borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, #fbeeb0 45%, rgba(251,238,176,0) 100%)',
            boxShadow: `0 0 ${6 * st.s}px ${1.5 * st.s}px rgba(251,238,176,0.7)`,
            animationDelay: `${st.d}s`, pointerEvents: 'none',
          }} />
        ))}

        {/* 하단 안내 + 카운트 */}
        <div className="absolute inset-x-0 bottom-0 pb-10 flex flex-col items-center pointer-events-none">
          <p className="text-white/70 tabular-nums text-[15px] mb-1">{count > 0 ? `${count}` : ''}</p>
          <p className="text-white/40 text-[12px] font-light">
            {count === 0 ? '하늘 아무 곳이나 톡 눌러 별을 놓아요' : count < ENOUGH ? '천천히… 하나 더' : '충분히 세었어요'}
          </p>
          {count >= ENOUGH && (
            <button onClick={() => setPhase('done')} className="mt-3 px-6 py-2 rounded-full bg-white/12 text-white/80 border border-white/20 text-[13px] pointer-events-auto hover:bg-white/20 transition">
              이제 그만 세기
            </button>
          )}
        </div>
      </div>
    </ModuleFrame>
  )
}

function StarMark() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="20" fill="url(#scg)" opacity="0.35" />
      <path d="M26 12l3.2 8.6L38 24l-8.8 3.4L26 36l-3.2-8.6L14 24l8.8-3.4z" fill="url(#scg2)" />
      <defs>
        <radialGradient id="scg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fbeeb0" /><stop offset="1" stopColor="#fbeeb0" stopOpacity="0" /></radialGradient>
        <radialGradient id="scg2" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#fff7e6" /><stop offset="0.5" stopColor="#f6cf7a" /><stop offset="1" stopColor="#e0a33e" /></radialGradient>
      </defs>
    </svg>
  )
}
