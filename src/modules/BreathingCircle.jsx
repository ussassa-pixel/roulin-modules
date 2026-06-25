import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

const CYCLE = [
  { name: 'inhale', duration: 4000 },
  { name: 'hold',   duration: 1000 },
  { name: 'exhale', duration: 6000 },
  { name: 'rest',   duration: 1000 },
]

const PHASE_TEXT = {
  inhale: '들이마셔요',
  hold:   '잠깐',
  exhale: '천천히 내쉬어요',
  rest:   '',
}

const SCALE      = { inhale: 1.4,  hold: 1.4,   exhale: 0.7,    rest: 0.7 }
const TRANSITION = { inhale: '4000ms', hold: '200ms', exhale: '6000ms', rest: '200ms' }

// 별 파티클 (고정 위치)
const STARS = [
  { x: 8,  y: 12, r: 1.2, o: 0.5, d: '0s'   },
  { x: 88, y: 8,  r: 0.8, o: 0.4, d: '1.5s' },
  { x: 15, y: 78, r: 1.0, o: 0.6, d: '3s'   },
  { x: 92, y: 72, r: 0.7, o: 0.3, d: '0.8s' },
  { x: 45, y: 5,  r: 1.5, o: 0.5, d: '2.2s' },
  { x: 72, y: 18, r: 0.9, o: 0.4, d: '4s'   },
  { x: 5,  y: 45, r: 1.1, o: 0.6, d: '1.2s' },
  { x: 95, y: 40, r: 0.8, o: 0.3, d: '3.5s' },
  { x: 25, y: 92, r: 1.3, o: 0.5, d: '0.5s' },
  { x: 78, y: 88, r: 0.9, o: 0.4, d: '2.8s' },
  { x: 60, y: 95, r: 1.0, o: 0.3, d: '1.8s' },
  { x: 38, y: 88, r: 0.7, o: 0.5, d: '4.5s' },
  { x: 82, y: 55, r: 1.2, o: 0.4, d: '2.0s' },
  { x: 12, y: 58, r: 0.8, o: 0.6, d: '3.2s' },
  { x: 55, y: 2,  r: 0.9, o: 0.3, d: '1.0s' },
  { x: 3,  y: 30, r: 1.1, o: 0.5, d: '5s'   },
  { x: 97, y: 25, r: 0.7, o: 0.4, d: '0.3s' },
  { x: 48, y: 97, r: 1.3, o: 0.3, d: '2.5s' },
]

export default function BreathingCircle({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [duration, setDuration] = useState(60)
  const [breathPhase, setBreathPhase] = useState('exhale')
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    if (phase !== 'running') return
    let currentIndex = 0
    setBreathPhase(CYCLE[0].name)

    const next = () => {
      currentIndex = (currentIndex + 1) % CYCLE.length
      setBreathPhase(CYCLE[currentIndex].name)
      timeoutId = setTimeout(next, CYCLE[currentIndex].duration)
    }
    let timeoutId = setTimeout(next, CYCLE[0].duration)
    return () => clearTimeout(timeoutId)
  }, [phase])

  useEffect(() => {
    if (phase !== 'running') return
    setSecondsLeft(duration)
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(countdown); setPhase('rating'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdown)
  }, [phase, duration])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>호흡 원</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
              원이 커지면 들이마시고<br />작아지면 내쉽니다
            </p>

            <div className="flex justify-center mb-12">
              <div className="w-28 h-28 rounded-full animate-breath-slow" style={{
                background: 'radial-gradient(circle at 38% 34%, #ffffff 0%, #bae6fd 30%, #38bdf8 65%, #0369a1 100%)',
                boxShadow: '0 0 30px rgba(56,189,248,0.35)',
              }} />
            </div>

            <p className="text-[12px] text-r-gray-soft mb-5">시간을 선택해주세요</p>
            <div className="space-y-3">
              {[{ label: '1분', val: 60 }, { label: '3분', val: 180 }, { label: '5분', val: 300 }].map(({ label, val }) => (
                <button
                  key={val}
                  onClick={() => { setDuration(val); setPhase('running') }}
                  className="w-full py-4 bg-white rounded-full text-[14px] text-ink border border-line hover:border-[#DCD5C4] transition active:scale-[0.98]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    const s = SCALE[breathPhase]
    const t = TRANSITION[breathPhase]

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #0d1f35 0%, #050d18 100%)' }}
      >
        {/* 별 파티클 */}
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-breath"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.r * 2}px`,
              height: `${star.r * 2}px`,
              background: 'white',
              opacity: star.o,
              animationDelay: star.d,
              animationDuration: '8s',
            }}
          />
        ))}

        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-white/30 hover:text-white/60 transition z-10"
        >
          나가기
        </button>

        {/* 맥동 링 + 구체 */}
        <div className="flex items-center justify-center mb-12 relative" style={{ width: '280px', height: '280px' }}>
          {/* 링 3 (가장 바깥) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '200px', height: '200px',
              border: '1px solid rgba(56,189,248,0.08)',
              transform: `scale(${s * 1.65})`,
              transition: `transform ${t} ease-in-out`,
            }}
          />
          {/* 링 2 */}
          <div
            className="absolute rounded-full"
            style={{
              width: '200px', height: '200px',
              border: '1px solid rgba(56,189,248,0.15)',
              transform: `scale(${s * 1.35})`,
              transition: `transform ${t} ease-in-out`,
            }}
          />
          {/* 링 1 (바로 바깥) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '200px', height: '200px',
              border: '1.5px solid rgba(56,189,248,0.28)',
              transform: `scale(${s * 1.12})`,
              transition: `transform ${t} ease-in-out`,
            }}
          />

          {/* 구체 */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 28% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 8%, transparent 25%),
                radial-gradient(circle at 38% 34%, #ffffff 0%, #bae6fd 18%, #38bdf8 48%, #0369a1 78%, #082f49 100%)
              `,
              boxShadow: `
                0 0 60px rgba(56,189,248,0.5),
                0 0 120px rgba(14,165,233,0.25),
                inset 0 -8px 20px rgba(2,48,80,0.4)
              `,
              transform: `scale(${s})`,
              transition: `transform ${t} ease-in-out`,
            }}
          />
        </div>

        <p key={breathPhase} className="text-[20px] text-white/70 font-light mb-6 animate-fade-in" style={{ minHeight: '32px' }}>
          {PHASE_TEXT[breathPhase]}
        </p>

        <p className="text-[13px] text-white/25 font-light">
          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
        </p>
      </div>
    )
  }

  if (phase === 'rating') {
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )
  }

  return null
}
