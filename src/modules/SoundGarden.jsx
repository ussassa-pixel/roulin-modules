import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function SoundGarden({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [ripples, setRipples] = useState([])
  const audioCtxRef = useRef(null)

  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioContext()
    }
  }

  const playChime = (yRatio) => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    const noteIndex = Math.floor((1 - yRatio) * (scale.length - 1))
    const freq = scale[noteIndex]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.frequency.value = freq * 2.01
    osc2.type = 'sine'
    gain2.gain.setValueAtTime(0, ctx.currentTime)
    gain2.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.04)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0)

    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.frequency.value = freq * 3.0
    osc3.type = 'sine'
    gain3.gain.setValueAtTime(0, ctx.currentTime)
    gain3.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.04)
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

    for (const [o, g] of [[osc, gain], [osc2, gain2], [osc3, gain3]]) {
      o.connect(g); g.connect(ctx.destination); o.start()
    }
    osc.stop(ctx.currentTime + 2.8)
    osc2.stop(ctx.currentTime + 2.0)
    osc3.stop(ctx.currentTime + 1.2)
  }

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    const yRatio = y / rect.height

    playChime(yRatio)

    const hue = Math.floor((1 - yRatio) * 80) + 170 // 170(청록)~250(보라)
    const baseId = Date.now() + Math.random()

    // 3겹 동심원 (각각 크기·딜레이·투명도 다름)
    const newRipples = [
      { id: baseId,       x, y, hue, size: 36, delay: '0ms',   dur: 2.8, opacity: 0.7 },
      { id: baseId + 0.1, x, y, hue, size: 36, delay: '180ms', dur: 3.2, opacity: 0.45 },
      { id: baseId + 0.2, x, y, hue, size: 36, delay: '380ms', dur: 3.8, opacity: 0.25 },
    ]
    setRipples((prev) => [...prev, ...newRipples])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== baseId && r.id !== baseId + 0.1 && r.id !== baseId + 0.2))
    }, 4200)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>소리 정원</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-sm text-r-gray mb-12 leading-relaxed font-light">
              화면을 탭하면 소리가 울립니다<br />
              위아래로 음이 달라져요<br />
              <span className="text-xs text-r-gray-soft">천천히, 마음 가는 대로</span>
            </p>
            <button
              onClick={() => { initAudio(); setPhase('running') }}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return (
      <div
        className="min-h-screen relative overflow-hidden cursor-pointer select-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #2d1b69 0%, #0f172a 60%, #0c1a2e 100%)' }}
        onMouseDown={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap(e) }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onExit() }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute top-6 right-6 text-white/40 hover:text-white/70 z-30 text-sm transition"
        >
          나가기
        </button>

        {/* 별 배경 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-breath"
            style={{
              left: `${(i * 37 + 11) % 97}%`,
              top: `${(i * 53 + 7) % 93}%`,
              width: `${1 + (i % 3) * 0.5}px`,
              height: `${1 + (i % 3) * 0.5}px`,
              background: 'white',
              opacity: 0.15 + (i % 5) * 0.06,
              animationDuration: `${6 + (i % 4) * 2}s`,
              animationDelay: `${(i * 0.7) % 5}s`,
            }}
          />
        ))}

        {/* 세로 음계 가이드 (희미한 수평선) */}
        {[0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((ratio, i) => (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${ratio * 100}%`,
              height: '1px',
              background: `rgba(255,255,255,0.04)`,
            }}
          />
        ))}

        {ripples.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/30 text-sm animate-fade-in">아무 곳이나 탭해보세요</p>
          </div>
        )}

        {/* 물결들 */}
        {ripples.map((r) => (
          <div
            key={r.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: r.x,
              top: r.y,
              width: `${r.size}px`,
              height: `${r.size}px`,
              transform: 'translate(-50%, -50%)',
              border: `1.5px solid hsla(${r.hue}, 80%, 72%, ${r.opacity})`,
              animationDelay: r.delay,
              animation: `ripple ${r.dur}s ease-out ${r.delay} forwards`,
              boxShadow: `0 0 12px hsla(${r.hue}, 80%, 72%, ${r.opacity * 0.4})`,
            }}
          />
        ))}
      </div>
    )
  }

  return null
}
