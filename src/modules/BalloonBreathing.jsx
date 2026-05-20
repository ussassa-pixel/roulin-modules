import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

export default function BalloonBreathing({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [voiceOn, setVoiceOn] = useState(true)
  const [isPressed, setIsPressed] = useState(false)
  const [balloonSize, setBalloonSize] = useState(80)
  const [breathState, setBreathState] = useState('idle')
  const [completedCycles, setCompletedCycles] = useState(0)
  const intervalRef = useRef(null)
  const lastSpokenRef = useRef(null)

  const MIN_SIZE = 80
  const MAX_SIZE = 280

  const speak = (text) => {
    if (!voiceOn) return
    if (lastSpokenRef.current === text) return
    lastSpokenRef.current = text
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 0.7
    window.speechSynthesis.speak(utterance)
  }

  const handlePressStart = () => {
    setIsPressed(true)
    setBreathState('inhaling')
    speak('들이마셔요')
    intervalRef.current = setInterval(() => {
      setBalloonSize((prev) => Math.min(MAX_SIZE, prev + 4))
    }, 50)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (balloonSize >= MAX_SIZE - 20) {
      setBreathState('holding')
      speak('잠깐')
      setTimeout(() => {
        setBreathState('exhaling')
        speak('천천히 내쉬어요')
      }, 800)
    } else {
      setBreathState('exhaling')
      speak('천천히 내쉬어요')
    }

    intervalRef.current = setInterval(() => {
      setBalloonSize((prev) => {
        if (prev <= MIN_SIZE) {
          clearInterval(intervalRef.current)
          setBreathState('idle')
          lastSpokenRef.current = null
          setCompletedCycles((c) => c + 1)
          return MIN_SIZE
        }
        return prev - 3
      })
    }, 50)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>

        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-stone-50 to-sky-50 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-2xl text-stone-700 mb-3 font-light">풍선 호흡</p>
            <p className="text-sm text-stone-500 mb-8 leading-relaxed">
              화면을 누르면 풍선이 부풀어요<br />
              누르는 동안 들이마시고, 떼는 동안 내쉬어요
            </p>

            <div className="flex justify-center mb-12">
              <BalloonIcon size={160} color="pink" />
            </div>

            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full text-sm text-stone-600 hover:bg-white transition mb-6"
            >
              <span className="text-base">{voiceOn ? '🔊' : '🔇'}</span>
              음성 안내 {voiceOn ? '켜짐' : '꺼짐'}
            </button>

            <button
              onClick={() => setPhase('running')}
              className="w-full p-5 bg-white/80 backdrop-blur rounded-2xl hover:bg-white transition text-stone-700"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    const stateText = {
      idle: '화면을 길게 눌러주세요',
      inhaling: '들이마셔요',
      holding: '잠깐 그대로',
      exhaling: '천천히 내쉬어요',
    }

    const balloonColor = breathState === 'inhaling' ? 'pink-deeper'
                       : breathState === 'holding'  ? 'pink-full'
                       : breathState === 'exhaling' ? 'sky-soft'
                       : 'pink'

    return (
      <div className="min-h-screen relative bg-gradient-to-br from-pink-50 via-stone-50 to-sky-50">
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 z-20 text-sm"
        >
          나가기
        </button>

        <button
          onClick={() => {
            setVoiceOn(!voiceOn)
            window.speechSynthesis.cancel()
          }}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur rounded-full text-xs text-stone-600 hover:bg-white transition z-20"
        >
          <span>{voiceOn ? '🔊' : '🔇'}</span>
          {voiceOn ? '음성 켜짐' : '음성 꺼짐'}
        </button>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-200/20 blur-3xl animate-breath-slow" />
        </div>

        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={isPressed ? handlePressEnd : undefined}
          onTouchStart={(e) => { e.preventDefault(); handlePressStart() }}
          onTouchEnd={(e) => { e.preventDefault(); handlePressEnd() }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-12" style={{ minHeight: '320px', alignItems: 'center' }}>
              <BalloonIcon size={balloonSize} color={balloonColor} animated />
            </div>

            <p
              key={breathState}
              className="text-2xl text-stone-700 font-light mb-4 animate-fade-in"
              style={{ minHeight: '36px' }}
            >
              {stateText[breathState]}
            </p>

            <p className="text-stone-400 text-sm">호흡 {completedCycles}회</p>

            {completedCycles >= 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPhase('rating')
                  window.speechSynthesis.cancel()
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="mt-8 px-6 py-3 bg-white/80 backdrop-blur rounded-full text-stone-600 hover:bg-white transition text-sm animate-fade-in"
              >
                마무리
              </button>
            )}
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

function BalloonIcon({ size = 160, color = 'pink', animated = false }) {
  const colorMap = {
    'pink':        { body: '#fbcfe8', shine: '#fce7f3', stroke: '#f9a8d4' },
    'pink-deeper': { body: '#f9a8d4', shine: '#fbcfe8', stroke: '#ec4899' },
    'pink-full':   { body: '#f472b6', shine: '#fbcfe8', stroke: '#db2777' },
    'sky-soft':    { body: '#bae6fd', shine: '#e0f2fe', stroke: '#7dd3fc' },
  }
  const { body, shine, stroke } = colorMap[color] || colorMap.pink

  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: animated ? 'all 100ms ease-out' : 'none' }}
    >
      <ellipse
        cx="100"
        cy="100"
        rx="75"
        ry="90"
        fill={body}
        stroke={stroke}
        strokeWidth="1.5"
        opacity="0.9"
        style={{ transition: animated ? 'fill 800ms ease, stroke 800ms ease' : 'none' }}
      />
      <ellipse cx="80" cy="75" rx="15" ry="25" fill={shine} opacity="0.7" />
      <path d="M 92 188 L 100 195 L 108 188 Z" fill={stroke} />
      <path
        d="M 100 195 Q 95 220, 100 245"
        stroke={stroke}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}
