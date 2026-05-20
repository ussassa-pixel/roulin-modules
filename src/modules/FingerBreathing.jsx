import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 도트 애니메이션 좌표 (SVG 핑거 좌표와 정확히 맞춤)
// top = 손가락 밑단(시작), peak = 손끝(끝)
const FINGERS = [
  { name: '엄지', top: { x: 38,  y: 218 }, peak: { x: 38,  y: 171 } },
  { name: '검지', top: { x: 83,  y: 233 }, peak: { x: 83,  y: 79  } },
  { name: '중지', top: { x: 128, y: 233 }, peak: { x: 128, y: 62  } },
  { name: '약지', top: { x: 173, y: 233 }, peak: { x: 173, y: 85  } },
  { name: '새끼', top: { x: 214, y: 227 }, peak: { x: 214, y: 142 } },
]

export default function FingerBreathing({ onExit }) {
  const [phase, setPhase] = useState('intro')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-50 flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3">손가락 호흡</p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-10 leading-relaxed">
              점이 손가락을 따라 올라갈 때 들이마시고<br />
              내려올 때 천천히 내쉬어요
            </p>

            <div className="flex justify-center mb-10">
              <HandSVG activeFinger={null} dotPosition={null} />
            </div>

            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return (
      <FingerBreathingRunner
        onComplete={() => setPhase('rating')}
        onExit={onExit}
      />
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

function FingerBreathingRunner({ onComplete, onExit }) {
  const [currentFinger, setCurrentFinger] = useState(0)
  const [direction, setDirection] = useState('up')
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())
  const stateRef = useRef({ finger: 0, direction: 'up' })
  const phaseDuration = 4000

  useEffect(() => {
    startTimeRef.current = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const ratio = Math.min(elapsed / phaseDuration, 1)
      setProgress(ratio)

      if (ratio >= 1) {
        startTimeRef.current = Date.now()
        const { finger, direction } = stateRef.current

        if (direction === 'up') {
          stateRef.current.direction = 'down'
          setDirection('down')
        } else {
          if (finger >= FINGERS.length - 1) {
            clearInterval(interval)
            onComplete()
          } else {
            stateRef.current.finger = finger + 1
            stateRef.current.direction = 'up'
            setCurrentFinger(finger + 1)
            setDirection('up')
          }
        }
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const finger = FINGERS[currentFinger]
  const t = direction === 'up' ? progress : 1 - progress
  const dotPosition = {
    x: finger.top.x + (finger.peak.x - finger.top.x) * t,
    y: finger.top.y + (finger.peak.y - finger.top.y) * t,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex flex-col items-center justify-center p-6 relative">
      <button
        onClick={onExit}
        className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-[#bbb] hover:text-[#666] transition"
      >
        나가기
      </button>

      <div className="max-w-sm w-full text-center">
        <p
          key={`${currentFinger}-${direction}`}
          className="text-[22px] text-[#333] font-light mb-8 animate-fade-in"
          style={{ minHeight: '36px' }}
        >
          {direction === 'up' ? '들이마셔요' : '천천히 내쉬어요'}
        </p>

        <div className="flex justify-center mb-8">
          <HandSVG activeFinger={currentFinger} dotPosition={dotPosition} />
        </div>

        <div className="flex justify-center gap-2">
          {FINGERS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i < currentFinger  ? 'w-8 bg-amber-400'
                : i === currentFinger ? 'w-8 bg-stone-500'
                : 'w-8 bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// SVG 손가락 정의 (cx=중심, topY=손끝 y, bottomY=밑단 y, w=너비)
const FINGER_DEFS = [
  { cx: 38,  topY: 155, bottomY: 225, w: 32 }, // 엄지
  { cx: 83,  topY: 62,  bottomY: 240, w: 34 }, // 검지
  { cx: 128, topY: 44,  bottomY: 240, w: 36 }, // 중지
  { cx: 173, topY: 68,  bottomY: 240, w: 34 }, // 약지
  { cx: 214, topY: 128, bottomY: 234, w: 28 }, // 새끼
]

function HandSVG({ activeFinger, dotPosition }) {
  return (
    <svg width="260" height="285" viewBox="0 0 260 285" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* 손가락마다 가로 그라데이션 (원기둥처럼 보이게) */}
        {FINGER_DEFS.map((f, i) => (
          <linearGradient
            key={i}
            id={`fg-${i}`}
            x1={f.cx - f.w / 2} y1="0"
            x2={f.cx + f.w / 2} y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#c07848" />
            <stop offset="18%"  stopColor="#e8a878" />
            <stop offset="50%"  stopColor="#fde8cc" />
            <stop offset="82%"  stopColor="#e8a878" />
            <stop offset="100%" stopColor="#c07848" />
          </linearGradient>
        ))}

        {/* 활성 손가락 - 좀 더 밝은 그라데이션 */}
        {FINGER_DEFS.map((f, i) => (
          <linearGradient
            key={`a-${i}`}
            id={`fg-a-${i}`}
            x1={f.cx - f.w / 2} y1="0"
            x2={f.cx + f.w / 2} y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%"   stopColor="#c88050" />
            <stop offset="18%"  stopColor="#f0b888" />
            <stop offset="50%"  stopColor="#fff0dd" />
            <stop offset="82%"  stopColor="#f0b888" />
            <stop offset="100%" stopColor="#c88050" />
          </linearGradient>
        ))}

        {/* 손바닥 그라데이션 */}
        <radialGradient id="palm-g" cx="48%" cy="38%" r="65%">
          <stop offset="0%"   stopColor="#fde0b8" />
          <stop offset="55%"  stopColor="#e0986a" />
          <stop offset="100%" stopColor="#c07040" />
        </radialGradient>

        {/* 손톱 그라데이션 */}
        <linearGradient id="nail-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef0e8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f0d8c8" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* ── 손바닥 ── */}
      <ellipse cx="128" cy="250" rx="97" ry="43" fill="url(#palm-g)" />
      {/* 손바닥 하단 경계 (자연스러운 분리선) */}
      <ellipse cx="128" cy="250" rx="97" ry="43" fill="none" stroke="#b06838" strokeWidth="0.6" opacity="0.3" />

      {/* ── 손가락 5개 ── */}
      {FINGER_DEFS.map((f, i) => {
        const r = f.w / 2
        const isActive = activeFinger === i
        const gradId = isActive ? `fg-a-${i}` : `fg-${i}`

        // 손가락 경로: 위가 반원, 아래는 손바닥과 연결
        const path = [
          `M ${f.cx - r} ${f.bottomY}`,
          `L ${f.cx - r} ${f.topY + r}`,
          `A ${r} ${r} 0 0 1 ${f.cx + r} ${f.topY + r}`,
          `L ${f.cx + r} ${f.bottomY}`,
          'Z',
        ].join(' ')

        // 주름선 위치 (손가락 길이의 33%, 58% 지점)
        const fLen = f.bottomY - f.topY - r
        const wrinkle1Y = f.topY + r + fLen * 0.33
        const wrinkle2Y = f.topY + r + fLen * 0.60
        const wW1 = r * 0.75
        const wW2 = r * 0.85

        return (
          <g key={i}>
            {/* 손가락 몸체 */}
            <path
              d={path}
              fill={`url(#${gradId})`}
              opacity={isActive ? 1 : 0.82}
            />

            {/* 손가락 외곽선 (얇고 부드러움) */}
            <path
              d={path}
              fill="none"
              stroke="#a06030"
              strokeWidth="0.7"
              opacity={isActive ? 0.35 : 0.2}
            />

            {/* 손톱 */}
            <ellipse
              cx={f.cx}
              cy={f.topY + r * 1.05}
              rx={r * 0.55}
              ry={r * 0.5}
              fill="url(#nail-g)"
              stroke="#d4a090"
              strokeWidth="0.6"
              opacity="0.8"
            />

            {/* 주름선 2개 */}
            <line x1={f.cx - wW1} y1={wrinkle1Y} x2={f.cx + wW1} y2={wrinkle1Y}
              stroke="#a06030" strokeWidth="0.8" strokeLinecap="round" opacity={isActive ? 0.22 : 0.15} />
            <line x1={f.cx - wW2} y1={wrinkle2Y} x2={f.cx + wW2} y2={wrinkle2Y}
              stroke="#a06030" strokeWidth="0.8" strokeLinecap="round" opacity={isActive ? 0.22 : 0.15} />

            {/* 활성 손가락 테두리 글로우 */}
            {isActive && (
              <path
                d={path}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                opacity="0.4"
                strokeLinejoin="round"
              />
            )}
          </g>
        )
      })}

      {/* ── 움직이는 도트 ── */}
      {dotPosition && (
        <>
          <circle cx={dotPosition.x} cy={dotPosition.y} r="20" fill="white" opacity="0.2" />
          <circle cx={dotPosition.x} cy={dotPosition.y} r="11" fill="white" opacity="0.92" />
          <circle cx={dotPosition.x - 3} cy={dotPosition.y - 3} r="3.5" fill="white" opacity="0.65" />
        </>
      )}
    </svg>
  )
}
