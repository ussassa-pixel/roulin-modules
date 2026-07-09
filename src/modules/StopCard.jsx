import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

const OBSERVE_TEXTS = [
  '지금 무엇을 느끼고 있나요',
  '몸은 어떤 상태인가요',
  '어떤 행동을 하려고 했나요',
]

export default function StopCard({ onExit }) {
  const [phase, setPhase] = useState('stop')
  const [observeIndex, setObserveIndex] = useState(0)
  const { speak, stop } = useSpeech()
  useEffect(() => () => stop(), [phase, stop])

  useEffect(() => {
    if (phase === 'stop') speak('STOP. 지금, 하던 것을 멈춰요.')
    if (phase === 'breath') speak('숨 한 번.')
    if (phase === 'proceed') speak('이제 정하세요. 같은 행동을 해도 괜찮아요. 다른 행동을 선택해도 괜찮아요.')
  }, [phase, speak])

  useEffect(() => {
    if (phase !== 'observe') return
    speak(OBSERVE_TEXTS[observeIndex])
  }, [phase, observeIndex, speak])

  useEffect(() => {
    if (phase !== 'stop') return
    // "STOP. 지금, 하던 것을 멈춰요." 음성이 ~2.4초 + 재생 시작 지연이 있어,
    // 다음 단계로 넘어가며 음성이 끊기지 않도록 넉넉히 5초 머문다.
    const timer = setTimeout(() => setPhase('breath'), 5000)
    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'breath') return
    const timer = setTimeout(() => setPhase('observe'), 10000)
    return () => clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'observe') return
    const interval = setInterval(() => {
      setObserveIndex((prev) => {
        if (prev >= OBSERVE_TEXTS.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'stop') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="text-center animate-fade-in flex flex-col items-center">
            {/* 강렬한 빨간 원 안의 STOP */}
            <div className="relative mb-10" style={{ width: 260, height: 260 }}>
              <div className="absolute inset-0 rounded-full animate-stop-pulse" style={{ background: '#DC2626', opacity: 0.18 }} />
              <div
                className="absolute inset-0 m-auto rounded-full flex items-center justify-center"
                style={{
                  width: 220, height: 220,
                  background: 'radial-gradient(circle at 38% 32%, #ef4444 0%, #dc2626 55%, #b91c1c 100%)',
                  border: '7px solid #fff',
                  boxShadow: '0 0 0 3px #dc2626, 0 12px 40px rgba(220,38,38,0.4)',
                }}
              >
                <span className="font-serif text-white tracking-[0.06em]" style={{ fontWeight: 700, fontSize: 62 }}>STOP</span>
              </div>
            </div>
            <p className="text-[16px] font-light text-[#b91c1c] tracking-wide">
              지금, 하던 것을 멈춰요
            </p>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'breath') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="bg-session-stop min-h-screen flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="font-serif text-[28px] text-white mb-16 animate-fade-in">
              숨 한 번
            </p>
            <div
              className="rounded-full bg-white/20 mx-auto animate-breath"
              style={{ width: '100px', height: '100px' }}
            />
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'observe') {
    const isLast = observeIndex >= OBSERVE_TEXTS.length - 1

    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center">
            <p className="text-[11px] tracking-[0.2em] text-amber uppercase mb-12 animate-fade-in" style={{ fontWeight: 600 }}>
              관찰
            </p>
            <p
              key={observeIndex}
              className="font-serif text-[26px] text-navy mb-16 animate-fade-in leading-snug"
              style={{ fontWeight: 600 }}
            >
              {OBSERVE_TEXTS[observeIndex]}
            </p>
            {isLast && (
              <button
                onClick={() => setPhase('proceed')}
                className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide animate-fade-in active:scale-[0.98] transition-transform"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'proceed') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-in">
            <p className="font-serif text-[28px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>이제 정하세요</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />
            <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
              같은 행동을 해도 괜찮습니다
            </p>
            <p className="text-[14px] text-r-gray font-light mb-16 leading-relaxed">
              다른 행동을 선택해도 괜찮습니다
            </p>
            <button
              onClick={onExit}
              className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide active:scale-[0.98] transition-transform"
            >
              돌아가기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}
