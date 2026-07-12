import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 식히기 — '화가 날 때' 코너.
// 벌겋게 달아오른 화면을, 느린 호흡을 한 번씩 마칠 때마다 파랗게 식힌다.
// 들숨 4초(커짐) · 날숨 6초(작아짐)를 여섯 번. 온도가 내려가며 색이 바뀐다.
const CYCLES = 6
const INHALE = 4000, EXHALE = 6000

// 뜨거움(0) → 서늘함(1) 색 보간
const HOT = [214, 74, 52], COOL = [58, 120, 192]
const lerp = (a, b, t) => Math.round(a + (b - a) * t)
const mix = (t) => `rgb(${lerp(HOT[0], COOL[0], t)}, ${lerp(HOT[1], COOL[1], t)}, ${lerp(HOT[2], COOL[2], t)})`

export default function CoolDown({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [breath, setBreath] = useState('in') // 'in' | 'out'
  const [done, setDone] = useState(0)         // 마친 호흡 수
  const runRef = useRef(0)
  const doneRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null); const humRef = useRef(null)
  // 낮게 깔리는 험 — 식을수록 음이 낮아지고 부드러워짐
  const startHum = () => {
    if (mutedRef.current) return
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return
      const c = new C(); acRef.current = c
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 150
      const g = c.createGain(); g.gain.value = 0.0001; humRef.current = { o, g, c }
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500
      o.connect(g); g.connect(lp); lp.connect(c.destination); o.start()
    } catch { /* noop */ }
  }
  const stopHum = () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } acRef.current = null; humRef.current = null }
  useEffect(() => () => { runRef.current++; stopHum() }, [])

  const cool = doneRef.current / CYCLES // 0→1

  const begin = () => {
    doneRef.current = 0; setDone(0); setBreath('in'); setPhase('play')
    startHum()
    const token = ++runRef.current
    loop(token)
  }
  // 들숨 → 날숨 → (한 호흡 완료) 반복
  const loop = (token) => {
    if (token !== runRef.current) return
    setBreath('in')
    setTimeout(() => {
      if (token !== runRef.current) return
      setBreath('out')
      setTimeout(() => {
        if (token !== runRef.current) return
        doneRef.current += 1; setDone(doneRef.current)
        // 험을 조금 낮춘다
        const h = humRef.current; if (h) { h.o.frequency.setTargetAtTime(150 - doneRef.current * 12, h.c.currentTime, 0.4); h.g.gain.setTargetAtTime(0.05 * (1 - doneRef.current / CYCLES) + 0.008, h.c.currentTime, 0.4) }
        if (doneRef.current >= CYCLES) { stopHum(); setPhase('done'); return }
        loop(token)
      }, EXHALE)
    }, INHALE)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #3a1414 0%, #241016 72%, #160a10 100%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>식히기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8">
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: `radial-gradient(circle at 38% 34%, #ffffff55, ${mix(0)})`, boxShadow: `0 0 28px 6px ${mix(0)}66` }} />
            </div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              달아오른 걸 느린 숨으로 식혀요.<br />숨을 마칠 때마다 한 단계씩 서늘해져요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">원이 커지면 들이쉬고, 작아지면 길게 내쉬어요.</p>
            <button onClick={begin}
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #16283f 0%, #0e1a2c 75%, #0a1120 100%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7">
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: `radial-gradient(circle at 38% 34%, #ffffff66, ${mix(1)})`, boxShadow: `0 0 30px 6px ${mix(1)}66` }} />
            </div>
            <p className="font-serif text-[25px] text-white mb-2" style={{ fontWeight: 600 }}>한결 식었어요</p>
            <p className="text-white/65 text-sm font-light mb-12 leading-relaxed">
              화가 완전히 사라지진 않아도 괜찮아요.<br />조금 서늘해진 지금, 그걸로 충분해요.
            </p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">한 번 더</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  const c = mix(cool)
  const cNext = mix(Math.min(1, (doneRef.current + 1) / CYCLES))
  const grow = breath === 'in'
  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(ellipse at 50% 42%, ${c}44 0%, #100a12 78%)`, transition: 'background 2s ease' }}>
        <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
          {/* 후광 */}
          <div className="absolute rounded-full" style={{ width: 220, height: 220, background: `radial-gradient(circle, ${cNext}55 0%, ${cNext}00 70%)`, transform: `scale(${grow ? 1.25 : 0.8})`, transition: `transform ${grow ? INHALE : EXHALE}ms ease-in-out` }} />
          {/* 호흡 원 */}
          <div className="rounded-full" style={{
            width: 130, height: 130,
            background: `radial-gradient(circle at 38% 34%, #ffffff66 0%, ${cNext} 55%, ${c} 100%)`,
            boxShadow: `0 0 40px 10px ${cNext}55, inset -8px -10px 20px rgba(0,0,0,0.25)`,
            transform: `scale(${grow ? 1.5 : 0.72})`, transition: `transform ${grow ? INHALE : EXHALE}ms ease-in-out, background 2s ease`,
          }} />
        </div>
        <p className="text-white/85 text-[17px] font-light mt-12">{grow ? '천천히 들이쉬어요' : '길게 내쉬어요'}</p>
        <p className="text-white/40 text-[12px] mt-2 tabular-nums">{done} / {CYCLES}</p>
      </div>
    </ModuleFrame>
  )
}
