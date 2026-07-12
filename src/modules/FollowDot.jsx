import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 한 점 따라가기 — '집중이 안 될 때' 코너의 지속주의(smooth pursuit) 게임.
// 천천히 떠다니는 빛을 손끝/시선으로 따라간다. 얹으면 밝아지고 소리가 차오른다.
// 점수·실패 없음: '함께 머문 시간'만. 놓쳐도 다시 얹으면 됨.
const SESSION_MS = 70000
const R = 60 // 근접 반경(px)
const BG = { background: 'radial-gradient(ellipse at 50% 40%, #1a2942 0%, #0e1a2c 75%)' }

export default function FollowDot({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState({ on: 0, total: 0 })

  const areaRef = useRef(null)
  const orbRef = useRef(null)
  const haloRef = useRef(null)
  const cursorRef = useRef(null)
  const st = useRef({ pointer: null, onMs: 0, glow: 0, start: 0, w: 0, h: 0 })
  const rafRef = useRef(0)

  // ── 은은한 프레즌스 사운드(빛에 얹으면 차오름) ──
  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null); const gainRef = useRef(null)
  const startAudio = () => {
    if (mutedRef.current) return
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return
      const c = new C(); acRef.current = c
      const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 392
      const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 588 // 완전5도
      const g2 = c.createGain(); g2.gain.value = 0.5
      const g = c.createGain(); g.gain.value = 0.0001; gainRef.current = g
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900
      o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(c.destination)
      o1.start(); o2.start()
    } catch { /* noop */ }
  }
  const stopAudio = () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } acRef.current = null; gainRef.current = null }

  const begin = () => { setProgress(0); setPhase('play'); startAudio() }

  const end = () => {
    cancelAnimationFrame(rafRef.current)
    stopAudio()
    const s = st.current
    setResult({ on: Math.round(s.onMs / 1000), total: Math.round(SESSION_MS / 1000) })
    setPhase('done')
  }

  useEffect(() => {
    if (phase !== 'play') return
    const el = areaRef.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const s = st.current
    s.w = rect.width; s.h = rect.height; s.start = performance.now(); s.onMs = 0; s.glow = 0; s.pointer = null
    let last = performance.now()
    const loop = (now) => {
      const dt = now - last; last = now
      const t = now - s.start
      if (t >= SESSION_MS) { end(); return }
      const { w, h } = s
      const cx = w / 2, cy = h / 2
      // 다중 사인 = 유기적으로 천천히 떠다님
      const ox = cx + w * 0.34 * Math.sin(t * 0.00055) + w * 0.11 * Math.sin(t * 0.00021 + 1.3)
      const oy = cy + h * 0.30 * Math.sin(t * 0.00043 + 0.7) + h * 0.10 * Math.sin(t * 0.00017 + 2.1)
      let close = 0
      if (s.pointer) {
        const d = Math.hypot(s.pointer.x - ox, s.pointer.y - oy)
        close = d < R ? 1 : d < R * 2 ? 1 - (d - R) / R : 0
      }
      if (close > 0.6) s.onMs += dt
      s.glow += (close - s.glow) * Math.min(1, dt / 120)
      if (orbRef.current) orbRef.current.style.transform = `translate3d(calc(${ox}px - 50%), calc(${oy}px - 50%), 0)`
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(calc(${ox}px - 50%), calc(${oy}px - 50%), 0) scale(${0.7 + s.glow * 1.0})`
        haloRef.current.style.opacity = String(0.22 + s.glow * 0.55)
      }
      if (cursorRef.current) {
        cursorRef.current.style.opacity = s.pointer ? '1' : '0'
        if (s.pointer) cursorRef.current.style.transform = `translate3d(calc(${s.pointer.x}px - 50%), calc(${s.pointer.y}px - 50%), 0)`
      }
      if (gainRef.current && acRef.current) gainRef.current.gain.setTargetAtTime(s.glow * 0.06, acRef.current.currentTime, 0.1)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'play') return
    const iv = setInterval(() => {
      setProgress(Math.min(1, (performance.now() - st.current.start) / SESSION_MS))
    }, 200)
    return () => clearInterval(iv)
  }, [phase])

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopAudio() }, [])

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    st.current.pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>한 점 따라가기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-5" />
            <div className="flex justify-center mb-8"><Orb /></div>
            <p className="text-[14px] text-white/70 font-light mb-2 leading-relaxed">
              천천히 떠다니는 빛을<br />손끝으로 살며시 따라가 보세요.
            </p>
            <p className="text-[12px] text-white/40 mb-12">놓쳐도 괜찮아요. 다시 얹으면 돼요.</p>
            <button onClick={begin} className="px-10 py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition text-[15px]">
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'play') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div
          ref={areaRef}
          className="min-h-screen relative overflow-hidden select-none"
          style={{ ...BG, touchAction: 'none' }}
          onPointerMove={onMove}
          onPointerDown={onMove}
        >
          {/* 진행 바 */}
          <div className="absolute top-0 left-0 h-[3px] bg-amber/70" style={{ width: `${progress * 100}%`, transition: 'width .2s linear' }} />
          {/* 후광 */}
          <div ref={haloRef} className="absolute left-0 top-0 pointer-events-none"
            style={{ width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,197,120,0.55) 0%, rgba(240,197,120,0) 70%)', willChange: 'transform, opacity' }} />
          {/* 손끝 표시(은은) */}
          <div ref={cursorRef} className="absolute left-0 top-0 pointer-events-none rounded-full"
            style={{ width: 30, height: 30, border: '1.5px solid rgba(255,255,255,0.28)', opacity: 0, transition: 'opacity .2s', willChange: 'transform' }} />
          {/* 빛 구슬 */}
          <div ref={orbRef} className="absolute left-0 top-0 pointer-events-none" style={{ willChange: 'transform' }}>
            <Orb />
          </div>
          <p className="absolute bottom-10 left-0 right-0 text-center text-white/30 text-[12px] font-light">빛을 따라가 보세요</p>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-6"><Orb /></div>
            <p className="text-white/60 text-[13px] mb-1">함께 머문 시간</p>
            <p className="font-serif text-[34px] text-white mb-2" style={{ fontWeight: 600 }}>{result.on}초</p>
            <p className="text-white/40 text-[12px] mb-10">{result.total}초 중</p>
            <p className="text-white/70 text-sm font-light mb-12 leading-relaxed">
              흩어졌다가도 다시 돌아왔다면,<br />그걸로 충분해요.
            </p>
            <button onClick={begin} className="w-full py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition mb-3">다시</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 빛나는 앰버 젬
function Orb() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'radial-gradient(circle at 36% 32%, #fff7e6 0%, #f6cf7a 45%, #e0a33e 100%)',
      boxShadow: '0 0 22px 6px rgba(224,163,62,0.55), 0 0 6px 1px rgba(255,240,200,0.8)',
    }} />
  )
}
