import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 5개의 호흡 마디(봉우리). 빛나는 구슬이 baseline → peak(들숨), peak → baseline(날숨)으로 이동.
const BASELINE = 250
const PEAKS = [
  { x: 48,  peak: 150 },
  { x: 104, peak: 96  },
  { x: 160, peak: 74  },
  { x: 216, peak: 104 },
  { x: 268, peak: 160 },
]
const VIEW_W = 316
const VIEW_H = 300

export default function FingerBreathing({ onExit }) {
  const [phase, setPhase] = useState('intro')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>손가락 호흡</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-10 leading-relaxed">
              빛이 올라갈 때 천천히 들이마시고<br />
              내려올 때 천천히 내쉽니다
            </p>

            <div className="flex justify-center mb-10">
              <BreathRidge preview />
            </div>

            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide active:scale-[0.98] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return <FingerBreathingRunner onComplete={() => setPhase('rating')} onExit={onExit} />
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
  const [currentPeak, setCurrentPeak] = useState(0)
  const [direction, setDirection] = useState('up')
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())
  const stateRef = useRef({ peak: 0, direction: 'up' })
  const phaseDuration = 4000

  useEffect(() => {
    startTimeRef.current = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const ratio = Math.min(elapsed / phaseDuration, 1)
      setProgress(ratio)
      if (ratio >= 1) {
        startTimeRef.current = Date.now()
        const { peak, direction } = stateRef.current
        if (direction === 'up') {
          stateRef.current.direction = 'down'
          setDirection('down')
        } else {
          if (peak >= PEAKS.length - 1) {
            clearInterval(interval)
            onComplete()
          } else {
            stateRef.current.peak = peak + 1
            stateRef.current.direction = 'up'
            setCurrentPeak(peak + 1)
            setDirection('up')
          }
        }
      }
    }, 16)
    return () => clearInterval(interval)
  }, [])

  // ease-in-out 으로 호흡처럼 부드럽게
  const eased = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
  const peak = PEAKS[currentPeak]
  const raw = direction === 'up' ? progress : 1 - progress
  const t = eased(raw)
  const beadY = BASELINE + (peak.peak - BASELINE) * t
  const glow = 0.45 + 0.55 * t // 정점에서 가장 밝게

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 38%, #14233b 0%, #0a1322 55%, #060c16 100%)' }}
    >
      <button
        onClick={onExit}
        className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-white/35 hover:text-white/70 transition z-10"
      >
        나가기
      </button>

      <div className="max-w-sm w-full text-center">
        <p
          key={`${currentPeak}-${direction}`}
          className="text-[21px] text-white/80 font-light mb-10 animate-fade-in"
          style={{ minHeight: '32px' }}
        >
          {direction === 'up' ? '천천히 들이마셔요' : '천천히 내쉬어요'}
        </p>

        <div className="flex justify-center mb-10">
          <BreathRidge currentPeak={currentPeak} beadX={peak.x} beadY={beadY} glow={glow} />
        </div>

        <div className="flex justify-center gap-2">
          {PEAKS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i < currentPeak ? 'w-7 bg-amber'
                : i === currentPeak ? 'w-7 bg-amber/90'
                : 'w-7 bg-white/15'
              }`}
              style={i === currentPeak ? { boxShadow: '0 0 10px rgba(224,163,62,0.7)' } : {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// 빛나는 호흡 능선 + 구슬 (실사 일러스트 대신 우아한 추상 트레이싱)
function BreathRidge({ preview = false, currentPeak = -1, beadX, beadY, glow = 0.6 }) {
  // 봉우리들을 부드러운 곡선으로 연결한 능선 path
  const ridge = (() => {
    const pts = PEAKS.map((p) => [p.x, p.peak])
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const mx = (x0 + x1) / 2
      d += ` Q ${mx} ${y0}, ${mx} ${(y0 + y1) / 2} T ${x1} ${y1}`
    }
    return d
  })()

  const dark = !preview
  const ridgeStroke = dark ? 'rgba(255,255,255,0.16)' : 'rgba(17,35,56,0.18)'
  const stemColor = dark ? 'rgba(224,163,62,' : 'rgba(17,35,56,'

  // 미리보기: 가운데 봉우리에 정적인 구슬
  const px = preview ? PEAKS[2].x : beadX
  const py = preview ? PEAKS[2].peak + 18 : beadY

  return (
    <svg width="280" height="266" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bead-core" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fff3da" />
          <stop offset="70%" stopColor="#f4c878" />
          <stop offset="100%" stopColor="#e0a33e" />
        </radialGradient>
        <radialGradient id="bead-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,220,150,0.9)" />
          <stop offset="100%" stopColor="rgba(224,163,62,0)" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(224,163,62,0)" />
          <stop offset="100%" stopColor="rgba(224,163,62,0.28)" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1="20" y1={BASELINE} x2={VIEW_W - 20} y2={BASELINE} stroke={ridgeStroke} strokeWidth="1" strokeDasharray="1 6" strokeLinecap="round" />

      {/* 능선 */}
      <path d={ridge} stroke={ridgeStroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 봉우리 마디 점 */}
      {PEAKS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.peak}
          r={i === currentPeak ? 3.2 : 2.2}
          fill={i <= currentPeak ? '#e0a33e' : (dark ? 'rgba(255,255,255,0.25)' : 'rgba(17,35,56,0.25)')}
          opacity={i === currentPeak ? 1 : 0.7}
        />
      ))}

      {/* 현재 마디: baseline → bead 빛 기둥 */}
      {!preview && (
        <rect x={px - 9} y={Math.min(py, BASELINE)} width="18" height={Math.abs(BASELINE - py)} fill="url(#beam)" rx="9" />
      )}

      {/* 구슬 */}
      <g style={{ transition: preview ? 'none' : 'transform 0.05s linear' }}>
        <circle cx={px} cy={py} r={32} fill="url(#bead-halo)" opacity={glow} />
        <circle cx={px} cy={py} r={13} fill="url(#bead-core)" />
        <circle cx={px - 3.5} cy={py - 3.5} r={3.2} fill="#ffffff" opacity="0.85" />
      </g>
    </svg>
  )
}
