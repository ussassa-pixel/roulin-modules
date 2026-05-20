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

// exhale 상태(작은 원)에서 시작해야 첫 프레임부터 팽창 애니메이션이 보임
const SCALE = { inhale: 1.4, hold: 1.4, exhale: 0.7, rest: 0.7 }
const TRANSITION = { inhale: '4000ms', hold: '200ms', exhale: '6000ms', rest: '200ms' }

export default function BreathingCircle({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [duration, setDuration] = useState(60)
  const [breathPhase, setBreathPhase] = useState('exhale') // 작은 상태에서 시작
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    if (phase !== 'running') return

    let currentIndex = 0
    // 즉시 첫 번째 페이즈(inhale)로 전환 → 작은 원이 바로 커지기 시작
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
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-50 flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3">호흡 원</p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-12 leading-relaxed">
              원이 커지면 들이마시고<br />작아지면 내쉬어요
            </p>

            <div className="flex justify-center mb-12">
              <div className="w-28 h-28 rounded-full bg-sky-300/70 animate-breath-slow" />
            </div>

            <p className="text-[12px] text-[#bbb] mb-5">시간을 선택해주세요</p>
            <div className="space-y-3">
              {[{ label: '1분', val: 60 }, { label: '3분', val: 180 }, { label: '5분', val: 300 }].map(({ label, val }) => (
                <button
                  key={val}
                  onClick={() => { setDuration(val); setPhase('running') }}
                  className="w-full py-4 bg-white rounded-2xl text-[14px] font-light text-[#333] hover:bg-[#f5f5f5] transition active:scale-[0.98]"
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
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #0d1f35 0%, #050d18 100%)' }}
      >
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-white/30 hover:text-white/60 transition"
        >
          나가기
        </button>

        {/* 그라데이션 구체 */}
        <div className="flex items-center justify-center mb-12" style={{ width: '260px', height: '260px' }}>
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 34%, #ffffff 0%, #bae6fd 22%, #38bdf8 52%, #0369a1 80%, #082f49 100%)',
              boxShadow: '0 0 80px rgba(56,189,248,0.45), 0 0 160px rgba(14,165,233,0.2)',
              transform: `scale(${SCALE[breathPhase]})`,
              transition: `transform ${TRANSITION[breathPhase]} ease-in-out`,
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
