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
  const { speak } = useSpeech()

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
    const timer = setTimeout(() => setPhase('breath'), 3000)
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
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="text-center animate-fade-in">
            <p className="font-serif text-[80px] text-[#1C1C1E] tracking-[0.1em] leading-none mb-5">
              STOP
            </p>
            <p className="text-[15px] font-light text-[#999] tracking-wide">
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
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center">
            <p className="text-[11px] tracking-[0.2em] text-[#bbb] uppercase mb-12 animate-fade-in">
              관찰
            </p>
            <p
              key={observeIndex}
              className="font-serif text-[26px] text-[#111] mb-16 animate-fade-in leading-snug"
            >
              {OBSERVE_TEXTS[observeIndex]}
            </p>
            {isLast && (
              <button
                onClick={() => setPhase('proceed')}
                className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide animate-fade-in active:scale-[0.98] transition-transform"
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
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-in">
            <p className="font-serif text-[28px] text-[#111] mb-3 leading-snug">이제 정하세요</p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-8" />
            <p className="text-[14px] text-[#999] font-light mb-2 leading-relaxed">
              같은 행동을 해도 괜찮아요
            </p>
            <p className="text-[14px] text-[#999] font-light mb-16 leading-relaxed">
              다른 행동을 선택해도 괜찮아요
            </p>
            <button
              onClick={onExit}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition-transform"
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
