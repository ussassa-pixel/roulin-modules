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
  const { speak, isMuted, toggleMute } = useSpeech()

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
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3 leading-snug">
              한 잔,<br />천천히 마셔볼게요
            </p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-14">
              물, 차, 커피, 무엇이든 좋아요
            </p>
            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition"
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
