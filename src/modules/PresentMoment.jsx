import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { useSpeech } from '../context/SpeechContext'

const STEPS = [
  { main: '지금 보이는 것', subs: ['주변을 천천히 둘러봐요', '한 가지에 시선을 멈춰봐요'] },
  { main: '지금 들리는 것', subs: ['주의를 귀로 옮겨요', '가까운 소리, 먼 소리'] },
  { main: '지금 느껴지는 것', subs: ['몸과 옷이 닿는 감각', '공기의 온도, 발의 위치'] },
]

export default function PresentMoment({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [duration, setDuration] = useState(60)
  const [stepIndex, setStepIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const prevStepRef = useRef(-1)
  const { speak, stop, isMuted, toggleMute } = useSpeech()
  useEffect(() => () => stop(), [phase, stop])

  const stepDuration = duration / STEPS.length
  const subDuration = stepDuration / 2

  useEffect(() => {
    if (phase === 'intro') speak('지금, 잠깐 멈춰볼게요. 자세 그대로, 눈은 떠도 좋아요.')
  }, [phase, speak])

  useEffect(() => {
    if (phase !== 'running') return
    const step = STEPS[stepIndex]
    if (!step) return
    if (stepIndex !== prevStepRef.current) {
      speak(`${step.main}. ${step.subs[0]}`)
      prevStepRef.current = stepIndex
    } else if (subIndex === 1) {
      speak(step.subs[1])
    }
  }, [phase, stepIndex, subIndex, speak])

  useEffect(() => {
    if (phase !== 'running') return
    let elapsed = 0
    const interval = setInterval(() => {
      elapsed += 1
      const currentStep = Math.floor(elapsed / stepDuration)
      const intoStep = elapsed - currentStep * stepDuration
      const currentSub = intoStep < subDuration ? 0 : 1
      if (currentStep >= STEPS.length) {
        clearInterval(interval)
        setPhase('rating')
      } else {
        setStepIndex(currentStep)
        setSubIndex(currentSub)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, stepDuration, subDuration])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[30px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
              지금, 잠깐<br />멈춰볼게요
            </p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-14 leading-relaxed">
              자세 그대로, 눈은 떠도 괜찮습니다
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setDuration(60); prevStepRef.current = -1; setStepIndex(0); setSubIndex(0); setPhase('running') }}
                className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide active:scale-[0.98] transition"
              >
                1분
              </button>
              <button
                onClick={() => { setDuration(120); prevStepRef.current = -1; setStepIndex(0); setSubIndex(0); setPhase('running') }}
                className="w-full py-4 bg-white text-ink rounded-full text-[14px] tracking-wide border border-line active:scale-[0.98] transition hover:border-[#DCD5C4]"
              >
                2분
              </button>
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    const currentStep = STEPS[stepIndex]
    if (!currentStep) return null

    return (
      <div className="bg-session-present min-h-screen relative">
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
            <p key={`main-${stepIndex}`} className="font-serif text-[34px] text-white mb-5 animate-fade-up">
              {currentStep.main}
            </p>
            <p key={`sub-${stepIndex}-${subIndex}`} className="text-[15px] text-white/50 font-light animate-fade-in">
              {currentStep.subs[subIndex]}
            </p>

            <div className="flex justify-center gap-3 mt-24">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-px rounded-full transition-all duration-700 ${
                    i < stepIndex ? 'w-8 bg-white/50'
                    : i === stepIndex ? 'w-8 bg-white/80'
                    : 'w-8 bg-white/20'
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
