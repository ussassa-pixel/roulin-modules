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
      setTimeout(() => { setBreathState('exhaling'); speak('천천히 내쉬어요') }, 800)
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
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-sky-200/20 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>풍선 호흡</p>
            <p className="text-sm text-r-gray mb-8 leading-relaxed font-light">
              화면을 누르면 풍선이 부풀어요<br />
              누르는 동안 들이마시고, 떼는 동안 내쉽니다
            </p>
            <div className="flex justify-center mb-12">
              <BalloonSVG size={160} fillRatio={0.5} state="idle" />
            </div>
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-line rounded-full text-sm text-r-gray hover:border-[#DCD5C4] transition mb-6"
            >
              <span>{voiceOn ? '🔊' : '🔇'}</span>
              음성 안내 {voiceOn ? '켜짐' : '꺼짐'}
            </button>
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
    const stateText = {
      idle: '화면을 길게 눌러주세요',
      inhaling: '들이마셔요',
      holding: '잠깐 그대로',
      exhaling: '천천히 내쉬어요',
    }
    const fillRatio = (balloonSize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)

    return (
      <div className="min-h-screen relative bg-cream">
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-r-gray-soft hover:text-navy z-20 text-[11px] tracking-wider font-light"
        >
          나가기
        </button>
        <button
          onClick={() => { setVoiceOn(!voiceOn); window.speechSynthesis.cancel() }}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-full text-xs text-r-gray hover:border-[#DCD5C4] transition z-20"
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
              <BalloonSVG size={balloonSize} fillRatio={fillRatio} state={breathState} />
            </div>

            <p key={breathState} className="text-2xl text-navy font-light mb-4 animate-fade-in" style={{ minHeight: '36px' }}>
              {stateText[breathState]}
            </p>

            <p className="text-r-gray-soft text-sm">호흡 {completedCycles}회</p>

            {completedCycles >= 3 && (
              <button
                onClick={(e) => { e.stopPropagation(); setPhase('rating'); window.speechSynthesis.cancel() }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="mt-8 px-6 py-3 bg-white border border-line rounded-full text-ink hover:border-[#DCD5C4] transition text-sm animate-fade-in"
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

function BalloonSVG({ size, fillRatio = 0, state = 'idle' }) {
  const w = size
  const h = size * 1.35
  const cx = w / 2
  const rx = w * 0.42
  const ry = h * 0.38

  // 상태별 색
  const colors = {
    idle:     { top: '#fbcfe8', mid: '#f9a8d4', bot: '#ec4899', shine: '#fff0f8' },
    inhaling: { top: '#f9a8d4', mid: '#ec4899', bot: '#db2777', shine: '#fff0f8' },
    holding:  { top: '#f472b6', mid: '#db2777', bot: '#be185d', shine: '#ffe4f0' },
    exhaling: { top: '#bae6fd', mid: '#7dd3fc', bot: '#38bdf8', shine: '#f0fbff' },
  }
  const c = colors[state] || colors.idle

  const bodyY = h * 0.36
  const knotY = h * 0.73
  const stringY = h * 0.95

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'width 100ms ease-out, height 100ms ease-out', filter: `drop-shadow(0 8px 24px ${c.mid}88)` }}
    >
      <defs>
        {/* 풍선 메인 그라데이션 (radial — 왼쪽 위가 밝음) */}
        <radialGradient id={`bg-${state}`} cx="35%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor={c.shine} />
          <stop offset="25%"  stopColor={c.top} />
          <stop offset="65%"  stopColor={c.mid} />
          <stop offset="100%" stopColor={c.bot} />
        </radialGradient>
        {/* 하이라이트 그라데이션 */}
        <radialGradient id={`hl-${state}`} cx="38%" cy="30%" r="45%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.85" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {/* 아래 반사 */}
        <radialGradient id={`ref-${state}`} cx="65%" cy="75%" r="35%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 풍선 본체 */}
      <ellipse cx={cx} cy={bodyY} rx={rx} ry={ry}
        fill={`url(#bg-${state})`}
        style={{ transition: 'fill 600ms ease' }}
      />
      {/* 주 하이라이트 */}
      <ellipse cx={cx} cy={bodyY} rx={rx} ry={ry} fill={`url(#hl-${state})`} />
      {/* 아래 반사 */}
      <ellipse cx={cx} cy={bodyY} rx={rx} ry={ry} fill={`url(#ref-${state})`} />

      {/* 작은 반짝이 (왼쪽 위) */}
      <ellipse
        cx={cx - rx * 0.28}
        cy={bodyY - ry * 0.38}
        rx={rx * 0.14}
        ry={ry * 0.18}
        fill="white"
        opacity="0.7"
        style={{ transform: 'rotate(-20deg)', transformOrigin: `${cx - rx * 0.28}px ${bodyY - ry * 0.38}px` }}
      />

      {/* 꼭지 */}
      <path
        d={`M ${cx - rx * 0.08} ${bodyY + ry - 2} L ${cx} ${knotY} L ${cx + rx * 0.08} ${bodyY + ry - 2} Z`}
        fill={c.bot}
        opacity="0.9"
      />

      {/* 끈 (살짝 곡선) */}
      <path
        d={`M ${cx} ${knotY} Q ${cx - 8} ${(knotY + stringY) / 2}, ${cx + 4} ${stringY}`}
        stroke={c.mid}
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
