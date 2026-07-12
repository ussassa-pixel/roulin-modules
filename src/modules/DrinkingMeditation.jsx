import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { useSpeech } from '../context/SpeechContext'

const STEPS = [
  { main: '컵을 바라봐요', sub: '색, 모양, 빛이 닿는 부분', duration: 15 },
  { main: '컵을 들어요', sub: '손에 닿는 온도, 무게', duration: 15 },
  { main: '입에 가까이 가져가요', sub: '어떤 냄새가 나나요', duration: 20 },
  { main: '한 모금, 천천히', sub: '입 안의 온도, 맛, 질감', duration: 30 },
  { main: '한 모금 더', sub: '이번엔 무엇이 다른가요', duration: 30 },
  { main: '잠깐 그대로', sub: '한 모금이 몸에 들어왔어요', duration: 10 },
]

export default function DrinkingMeditation({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const { speak, stop, isMuted, toggleMute } = useSpeech()
  useEffect(() => () => stop(), [phase, stop])

  useEffect(() => {
    if (phase === 'intro') speak('한 잔, 천천히 마셔볼게요. 물, 차, 커피, 무엇이든 좋아요.')
  }, [phase, speak])

  useEffect(() => {
    if (phase !== 'running') return
    const step = STEPS[stepIndex]
    if (step) speak(`${step.main}. ${step.sub}`)
  }, [phase, stepIndex, speak])

  useEffect(() => {
    if (phase !== 'running') return
    if (stepIndex >= STEPS.length) { setPhase('rating'); return }
    const timer = setTimeout(() => setStepIndex((prev) => prev + 1), STEPS[stepIndex].duration * 1000)
    return () => clearTimeout(timer)
  }, [phase, stepIndex])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
              한 잔,<br />천천히 마셔볼게요
            </p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-14">
              물, 차, 커피, 무엇이든 괜찮습니다
            </p>
            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide active:scale-[0.98] transition"
            >
              준비됐어요
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    const currentStep = STEPS[stepIndex]
    if (!currentStep) return null

    return (
      <div className="bg-session-drink min-h-screen relative">
        <button
          onClick={toggleMute}
          className="absolute top-6 left-6 z-20 text-[11px] tracking-wider font-light text-white/40 hover:text-white/70 transition"
        >
          {isMuted ? '소리 켜기' : '소리 끄기'}
        </button>
        <button
          onClick={onExit}
          className="absolute top-6 right-6 z-20 text-[11px] tracking-wider font-light text-white/40 hover:text-white/70 transition"
        >
          나가기
        </button>

        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-sm text-center">
            <div className="flex justify-center mb-10">
              <RealCup stepIndex={stepIndex} total={STEPS.length} />
            </div>
            <p key={`main-${stepIndex}`} className="font-serif text-[30px] text-white mb-4 animate-fade-up">
              {currentStep.main}
            </p>
            <p key={`sub-${stepIndex}`} className="text-[15px] text-white/50 font-light animate-fade-in">
              {currentStep.sub}
            </p>

            <div className="flex justify-center gap-2 mt-24">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-px rounded-full transition-all duration-700 ${
                    i < stepIndex ? 'w-6 bg-white/50'
                    : i === stepIndex ? 'w-6 bg-white/80'
                    : 'w-6 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* 준비되면 기다리지 않고 직접 진행 — 새 단계 음성이 이전 음성을 즉시 끊는다 */}
            <button
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="mt-10 px-6 py-2.5 rounded-full text-[12px] tracking-wide text-white/40 hover:text-white/70 border border-white/15 transition"
            >
              다음
            </button>
          </div>
        </div>
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

// 관찰용 실제 컵 — 도자기 머그 + 김 + 마실수록 줄어드는 음료 + 입에 가져갈 때 기울임
function RealCup({ stepIndex = 0 }) {
  const level = stepIndex <= 2 ? 1 : stepIndex === 3 ? 0.66 : 0.36
  const tilt = stepIndex === 2 ? -6 : (stepIndex === 3 || stepIndex === 4) ? -13 : 0
  const surfaceY = 82 + (1 - level) * 30
  const surfaceRx = 37 - (1 - level) * 9
  const hot = stepIndex <= 2

  return (
    <svg width="170" height="182" viewBox="0 0 200 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cup-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e9e4da" />
          <stop offset="22%" stopColor="#fbf8f2" />
          <stop offset="55%" stopColor="#ded7c9" />
          <stop offset="100%" stopColor="#c3baa8" />
        </linearGradient>
        <radialGradient id="cup-liquid" cx="42%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#7b4a26" />
          <stop offset="55%" stopColor="#5a3417" />
          <stop offset="100%" stopColor="#3e2410" />
        </radialGradient>
        <linearGradient id="cup-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2f1a" />
          <stop offset="100%" stopColor="#2b1a0e" />
        </linearGradient>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="100" cy="186" rx="48" ry="8" fill="rgba(0,0,0,0.28)" />

      {/* 김 (뜨거울 때) */}
      {hot && (
        <g stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none">
          <path className="animate-steam" style={{ transformOrigin: '82px 58px' }} d="M82 62 q -6 -10 2 -18 q 6 -8 0 -18" />
          <path className="animate-steam" style={{ transformOrigin: '100px 56px', animationDelay: '1.1s' }} d="M100 60 q 6 -10 -2 -18 q -6 -8 0 -20" />
          <path className="animate-steam" style={{ transformOrigin: '118px 58px', animationDelay: '2.1s' }} d="M118 62 q -6 -10 2 -18 q 6 -8 0 -16" />
        </g>
      )}

      {/* 컵 + 손잡이 (입에 가져갈 때 기울임) */}
      <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '100px 165px', transition: 'transform .8s ease' }}>
        <path d="M150 96 C 178 96 182 140 148 140" stroke="#d8cfbd" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M150 96 C 178 96 182 140 148 140" stroke="#b7ad98" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />

        <path d="M56 78 L64 156 Q65 166 75 168 L125 168 Q135 166 136 156 L144 78 Z" fill="url(#cup-body)" />
        <path d="M64 84 L70 154" stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        <path d="M137 84 L130 154" stroke="rgba(120,100,70,0.4)" strokeWidth="6" strokeLinecap="round" />

        {/* 안쪽 벽 */}
        <ellipse cx="100" cy="80" rx="44" ry="12" fill="url(#cup-inner)" />
        {/* 음료 표면 */}
        <ellipse cx="100" cy={surfaceY} rx={surfaceRx} ry={surfaceRx * 0.26} fill="url(#cup-liquid)" />
        <ellipse cx="90" cy={surfaceY - 2} rx={surfaceRx * 0.5} ry={surfaceRx * 0.12} fill="rgba(255,240,220,0.28)" />

        {/* 도자기 림 */}
        <ellipse cx="100" cy="80" rx="44" ry="12" fill="none" stroke="#f3efe6" strokeWidth="3" opacity="0.85" />
        <ellipse cx="100" cy="80" rx="44" ry="12" fill="none" stroke="rgba(120,100,70,0.35)" strokeWidth="1" />
      </g>
    </svg>
  )
}
