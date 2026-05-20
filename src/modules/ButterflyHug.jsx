import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { useSpeech } from '../context/SpeechContext'

export default function ButterflyHug({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [duration, setDuration] = useState(60)
  const [activeSide, setActiveSide] = useState('left')
  const [secondsLeft, setSecondsLeft] = useState(60)
  const { speak, isMuted, toggleMute } = useSpeech()

  useEffect(() => {
    if (phase === 'intro') {
      speak('나비 포옹이에요. 양손을 가슴 위에 X자로 얹고, 화면에 맞춰 좌우 번갈아 가볍게 토닥여요.')
    }
  }, [phase, speak])

  useEffect(() => {
    if (phase !== 'running') return
    const interval = setInterval(() => {
      setActiveSide((prev) => (prev === 'left' ? 'right' : 'left'))
    }, 1000)
    return () => clearInterval(interval)
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
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3 leading-snug">
              나비 포옹
            </p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-14 leading-relaxed">
              양손을 가슴 위에 X자로 얹고<br />
              화면에 맞춰 좌우 번갈아 가볍게 토닥여요
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setDuration(60); setPhase('running') }}
                className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition"
              >
                1분
              </button>
              <button
                onClick={() => { setDuration(120); setPhase('running') }}
                className="w-full py-4 bg-white text-[#333] rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition hover:bg-[#EDEDE9]"
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
    return (
      <div className="bg-session-butterfly min-h-screen relative">
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

        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <p className="text-[12px] text-white/30 font-light mb-16 tracking-wide">화면에 맞춰 토닥토닥</p>

          <div className="flex justify-center items-center gap-12 mb-16">
            <div className={`w-28 h-28 rounded-full transition-all duration-700 ${
              activeSide === 'left'
                ? 'bg-white/25 scale-110'
                : 'bg-white/10 scale-90'
            }`}
              style={activeSide === 'left' ? { boxShadow: '0 0 60px rgba(255,255,255,0.12)' } : {}}
            />
            <div className={`w-28 h-28 rounded-full transition-all duration-700 ${
              activeSide === 'right'
                ? 'bg-white/25 scale-110'
                : 'bg-white/10 scale-90'
            }`}
              style={activeSide === 'right' ? { boxShadow: '0 0 60px rgba(255,255,255,0.12)' } : {}}
            />
          </div>

          <p className="text-[13px] text-white/30 font-light mb-2">
            남은 시간 {secondsLeft}초
          </p>
          <p className="text-[12px] text-white/20 font-light">
            불편하면 언제든 멈춰도 괜찮아요
          </p>
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
