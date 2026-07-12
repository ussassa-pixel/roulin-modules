import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 가만히 — '집중이 안 될 때' 코너.
// 빛에 손끝을 얹고 가만히 있으면 반딧불이가 하나둘 다가와 모이고, 움직이면 흩어진다.
// 충동 억제·그라운딩(STOP 결). 벌칙·점수 없음 — 흔들려도 다시 가만히.
const FOCUS_BG = { background: 'radial-gradient(ellipse at 50% 44%, #17273f 0%, #0b1524 82%)' }
const DURS = [30, 60, 90]
const ZONE = 90
const MOVE = 6
const N_FF = 14

export default function FocusStill({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [still, setStill] = useState(false)
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [ff, setFf] = useState([])
  const targetRef = useRef(60000)
  const stillMsRef = useRef(0)
  const holdRef = useRef(false)
  const movedAtRef = useRef(0)
  const lastPosRef = useRef(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const areaRef = useRef(null)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null); const gainRef = useRef(null)
  const startAudio = () => {
    if (mutedRef.current || acRef.current) return
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return
      const c = new C(); acRef.current = c
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 356
      const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 534
      const g2 = c.createGain(); g2.gain.value = 0.5
      const g = c.createGain(); g.gain.value = 0.0001; gainRef.current = g
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 850
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(c.destination)
      o.start(); o2.start()
    } catch { /* noop */ }
  }
  const stopAudio = () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } acRef.current = null; gainRef.current = null }
  useEffect(() => () => stopAudio(), [])

  const start = (sec) => {
    targetRef.current = sec * 1000; stillMsRef.current = 0
    holdRef.current = false; movedAtRef.current = 0; lastPosRef.current = null
    setProgress(0); setStill(false); setHolding(false); setPhase('play'); startAudio()
  }

  useEffect(() => {
    if (phase !== 'play') return
    const el = areaRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      const cx = r.width / 2, cy = r.height / 2
      centerRef.current = { x: cx, y: cy }
      const R = Math.min(r.width, r.height) * 0.42
      const list = []
      for (let i = 0; i < N_FF; i++) {
        const ga = (i / N_FF) * Math.PI * 2 + (i % 2) * 0.4
        const gr = 44 + (i % 3) * 16
        const sa = Math.random() * Math.PI * 2
        list.push({
          gx: cx + Math.cos(ga) * gr, gy: cy + Math.sin(ga) * gr,
          sx: cx + Math.cos(sa) * (R + Math.random() * 40), sy: cy + Math.sin(sa) * (R + Math.random() * 40),
          delay: (Math.random() * 2).toFixed(2),
        })
      }
      setFf(list)
    }
    const iv = setInterval(() => {
      const now = performance.now()
      const isStill = holdRef.current && (now - movedAtRef.current > 150)
      setStill(isStill)
      if (isStill) stillMsRef.current += 100
      else stillMsRef.current = Math.max(0, stillMsRef.current - 130)
      const p = Math.min(1, stillMsRef.current / targetRef.current)
      setProgress(p)
      if (gainRef.current && acRef.current) gainRef.current.gain.setTargetAtTime(isStill ? 0.05 : 0.0001, acRef.current.currentTime, 0.12)
      if (p >= 1) { clearInterval(iv); setPhase('done') }
    }, 100)
    return () => clearInterval(iv)
  }, [phase])

  const relPos = (e) => { const r = areaRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const inZone = (p) => Math.hypot(p.x - centerRef.current.x, p.y - centerRef.current.y) <= ZONE
  const down = (e) => {
    const p = relPos(e); if (!inZone(p)) return
    holdRef.current = true; movedAtRef.current = 0; lastPosRef.current = p; setHolding(true)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  const move = (e) => {
    if (!holdRef.current) return
    const p = relPos(e); const last = lastPosRef.current
    if (!inZone(p) || (last && Math.hypot(p.x - last.x, p.y - last.y) > MOVE)) movedAtRef.current = performance.now()
    lastPosRef.current = p
  }
  const up = () => { holdRef.current = false; setHolding(false); movedAtRef.current = performance.now() }

  const gathered = Math.round(progress * N_FF)

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FOCUS_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>가만히</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Gem glow={1} /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              빛에 손끝을 얹고 가만히 있으면,<br />반딧불이가 하나둘 다가와요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">움직이면 흩어져요. 흔들려도 괜찮아요, 다시 가만히.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {DURS.map((s) => (
                <button key={s} onClick={() => start(s)}
                  className="py-4 rounded-2xl bg-white/12 text-white border border-white/25 hover:bg-white/20 transition" style={{ fontWeight: 600 }}>
                  {s}초
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
        <style>{`@keyframes fs-tw{0%,100%{opacity:.7}50%{opacity:1}}.fs-tw{animation:fs-tw 2.4s ease-in-out infinite}`}</style>
        <div
          ref={areaRef}
          className="min-h-screen relative overflow-hidden select-none flex flex-col items-center justify-center"
          style={{ ...FOCUS_BG, touchAction: 'none' }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        >
          {/* 반딧불이 */}
          {ff.map((f, i) => {
            const on = i < gathered
            return (
              <span key={i} className={on ? 'fs-tw' : ''} style={{
                position: 'absolute', left: 0, top: 0, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5, borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, #f6e58a 40%, #c9d97a 100%)',
                boxShadow: '0 0 9px 2px rgba(232,222,130,0.75)',
                transform: `translate3d(${on ? f.gx : f.sx}px, ${on ? f.gy : f.sy}px, 0)`,
                opacity: on ? undefined : 0.26,
                transition: 'transform 1.3s cubic-bezier(.3,.7,.3,1), opacity .8s ease',
                animationDelay: `${f.delay}s`,
                pointerEvents: 'none',
              }} />
            )
          })}

          {/* 손끝의 빛 */}
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
            <div className="absolute rounded-full pointer-events-none" style={{
              width: 150, height: 150, background: 'radial-gradient(circle, rgba(240,197,120,0.5) 0%, rgba(240,197,120,0) 70%)',
              transform: `scale(${0.7 + (still ? 0.5 : 0.15) + progress * 0.5})`, opacity: 0.3 + progress * 0.5 + (still ? 0.2 : 0),
              transition: 'transform .6s ease, opacity .6s ease',
            }} />
            <Gem glow={0.5 + progress * 0.5} still={still} />
          </div>

          <p className="text-white/45 text-[13px] font-light mt-10">
            {holding ? (still ? '가만히… 다가와요' : '흔들렸어요 · 다시 가만히') : '손끝을 빛 위에 올려 두세요'}
            {gathered > 0 && <span className="text-white/30"> · {gathered}/{N_FF}</span>}
          </p>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FOCUS_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><Gem glow={1} still /></div>
            <p className="font-serif text-[28px] text-white mb-2" style={{ fontWeight: 600 }}>반딧불이가 다 모였어요</p>
            <p className="text-white/70 text-sm font-light mb-12 leading-relaxed">
              {Math.round(targetRef.current / 1000)}초 동안, 흔들려도 다시 돌아왔어요.<br />그 자체가 연습이에요.
            </p>
            <button onClick={() => start(Math.round(targetRef.current / 1000))} className="w-full py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition mb-3">다시</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 손끝의 빛 젬 — 가만할수록 밝게
function Gem({ glow = 0.5, still = false }) {
  const g = Math.max(0.3, glow)
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: 'radial-gradient(circle at 36% 32%, #fff7e6 0%, #f6cf7a 45%, #e0a33e 100%)',
      boxShadow: `0 0 ${14 + g * 22}px ${3 + g * 6}px rgba(224,163,62,${0.35 + g * 0.35}), 0 0 8px 2px rgba(255,240,200,0.85)`,
      transform: still ? 'scale(1.06)' : 'scale(1)', transition: 'box-shadow .5s ease, transform .5s ease',
    }} />
  )
}
