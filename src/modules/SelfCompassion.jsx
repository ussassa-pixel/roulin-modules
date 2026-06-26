import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function SelfCompassion({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [pickedMessage, setPickedMessage] = useState(null)

  const steps = [
    {
      guide: '한 손을 가슴에 가만히 얹어 봅니다',
      sub: '손의 온기가 느껴지나요',
      duration: 8,
    },
    {
      guide: '지금 좀 힘들구나, 하고 인정합니다',
      sub: '괜찮은 척하지 않아도 괜찮습니다',
      duration: 8,
    },
    {
      guide: '나에게 건네는 말',
      sub: '',
      duration: 0,
      isMessageStep: true,
    },
  ]

  const messages = [
    '이만하면 충분히 하고 있어',
    '지금 힘든 건 당연해',
    '나도 나에게 친절할 수 있어',
    '완벽하지 않아도 괜찮아',
    '이 순간도 지나갈 거야',
  ]

  const currentStep = steps[stepIndex]

  useEffect(() => {
    if (phase !== 'running') return
    if (currentStep.isMessageStep) return

    const timer = setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1)
      }
    }, currentStep.duration * 1000)
    return () => clearTimeout(timer)
  }, [phase, stepIndex])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-rose-200/25 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>자기 다독임</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-sm text-r-gray mb-8 leading-relaxed font-light">
              힘든 순간, 나에게 친절을 건네보는 연습입니다
            </p>

            <div className="flex justify-center mb-8">
              <HeartHandIcon />
            </div>

            <p className="text-xs text-r-gray-soft mb-12 leading-relaxed">
              어색하게 느껴질 수 있습니다.<br />
              억지로 하지 않아도 괜찮고, 언제든 멈춰도 됩니다.
            </p>

            <button
              onClick={() => setPhase('running')}
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
    if (currentStep.isMessageStep) {
      return (
        <ModuleFrame onExit={onExit}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-200/15 blur-3xl animate-breath-slow" />
          </div>
          <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
            <div className="max-w-md w-full">
              <p className="text-center text-navy mb-2 text-lg font-light">나에게 건네는 말</p>
              <p className="text-center text-r-gray-soft mb-10 text-xs">
                마음에 드는 말을 골라, 속으로 천천히 건네 봅니다
              </p>

              <div className="space-y-3 mb-10">
                {messages.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => setPickedMessage(msg)}
                    className={`w-full py-4 rounded-2xl transition border ${
                      pickedMessage === msg
                        ? 'bg-amber-soft text-navy border-amber/40'
                        : 'bg-white text-ink border-line hover:border-[#DCD5C4]'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPhase('done')}
                className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
              >
                마무리
              </button>
            </div>
          </div>
        </ModuleFrame>
      )
    }

    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl animate-breath-slow" />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center">
            <p
              key={`guide-${stepIndex}`}
              className="text-2xl text-navy font-light mb-4 animate-fade-up leading-relaxed"
            >
              {currentStep.guide}
            </p>
            <p
              key={`sub-${stepIndex}`}
              className="text-r-gray animate-fade-in"
            >
              {currentStep.sub}
            </p>

            <div className="flex justify-center gap-2 mt-16">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-700 ${
                    i < stepIndex   ? 'w-8 bg-amber/60'
                    : i === stepIndex ? 'w-8 bg-amber'
                    : 'w-8 bg-line'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl animate-breath-slow" />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <HeartHandIcon />
            </div>
            {pickedMessage && (
              <p className="font-serif text-xl text-navy mb-8 leading-relaxed" style={{ fontWeight: 600 }}>
                "{pickedMessage}"
              </p>
            )}
            <p className="text-r-gray mb-12 leading-relaxed text-sm font-light">
              방금 나에게 건넨 말,<br />
              필요할 때 또 떠올려도 괜찮습니다.
            </p>
            <button
              onClick={onExit}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              닫기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 프리미엄 글래스 젬 하트 — 따뜻한 후광 위로 감싸는 두 손
function HeartHandIcon() {
  const heart = 'M 50 40 C 42 26, 24 28, 24 44 C 24 58, 44 70, 50 78 C 56 70, 76 58, 76 44 C 76 28, 58 26, 50 40 Z'
  return (
    <svg width="104" height="100" viewBox="0 0 104 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heart-halo" cx="50%" cy="44%" r="50%">
          <stop offset="0%"  stopColor="#fda4af" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#fb7185" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heart-body" cx="40%" cy="32%" r="78%">
          <stop offset="0%"   stopColor="#ffe4e6" />
          <stop offset="32%"  stopColor="#fda4af" />
          <stop offset="70%"  stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d63" />
        </radialGradient>
        <linearGradient id="hand-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6c9a8" />
          <stop offset="100%" stopColor="#e0a07a" />
        </linearGradient>
      </defs>

      <ellipse cx="52" cy="46" rx="50" ry="46" fill="url(#heart-halo)" />

      {/* 감싸는 두 손 (부드러운 컵 모양) */}
      <path d="M 16 60 Q 28 92, 52 92 Q 76 92, 88 60 Q 82 74, 52 80 Q 22 74, 16 60 Z"
        fill="url(#hand-grad)" opacity="0.55" />
      <path d="M 16 60 Q 28 92, 52 92 Q 76 92, 88 60" stroke="#cf8f68" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* 젬 하트 */}
      <path d={heart} fill="url(#heart-body)" opacity="0.95" />
      {/* 좌상단 글래스 광택 */}
      <path d="M 50 44 C 44 34, 32 35, 30 45 C 29 52, 38 60, 46 64 C 40 56, 40 48, 50 44 Z" fill="white" opacity="0.32" />
      {/* 외곽 림 */}
      <path d={heart} fill="none" stroke="#e11d63" strokeWidth="1" opacity="0.3" strokeLinejoin="round" />
      {/* 스페큘러 하이라이트 */}
      <ellipse cx="38" cy="42" rx="4.5" ry="6" fill="white" opacity="0.6" transform="rotate(-25 38 42)" />
    </svg>
  )
}
