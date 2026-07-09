import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { useSpeech } from '../context/SpeechContext'

export default function ButterflyHug({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [duration, setDuration] = useState(60)
  const [activeSide, setActiveSide] = useState('left')
  const [secondsLeft, setSecondsLeft] = useState(60)
  const { speak, stop, isMuted, toggleMute } = useSpeech()

  useEffect(() => {
    if (phase === 'intro') {
      speak('나비 포옹이에요. 양손을 가슴 위에 X자로 얹고, 화면에 맞춰 좌우 번갈아 가볍게 토닥여요.')
    }
  }, [phase, speak])

  // 단계가 바뀌거나 나갈 때 이전 음성 정지(인트로 음성이 진행 화면으로 새어나오지 않게)
  useEffect(() => () => stop(), [phase, stop])

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
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
              나비 포옹
            </p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-14 leading-relaxed">
              양손을 가슴 위에 X자로 얹고<br />
              화면에 맞춰 좌우 번갈아 가볍게 토닥입니다
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setDuration(60); setPhase('running') }}
                className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide active:scale-[0.98] transition"
              >
                1분
              </button>
              <button
                onClick={() => { setDuration(120); setPhase('running') }}
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
    return (
      <div className="bg-session-butterfly min-h-screen relative overflow-hidden">
        {/* 두 원 뒤로 크고 흐릿한 나비 실루엣 */}
        <ButterflyGhost
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
          style={{ marginTop: -26 }}
        />
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
          <p className="text-[12px] text-white/30 font-light mb-16 tracking-wide">화면에 맞춰 토닥토닥</p>

          <div className="flex justify-center items-center mb-16">
            <CrossedArmsHug activeSide={activeSide} />
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

// 자연스러운 손 실루엣 — 손바닥 + 부드럽게 모인 손가락(원점 기준, 위를 향함)
function NaturalHand() {
  return (
    <g fill="#fff">
      {/* 손바닥 + 네 손가락(윗변이 완만히 물결져 손가락을 암시) */}
      <path d="M -16 8
        C -18 -2 -16 -10 -11 -14
        C -11 -20 -5 -20 -5 -14
        C -4 -21 2 -21 2 -14
        C 3 -20 9 -20 9 -13
        C 10 -18 15 -17 15 -10
        C 18 -3 17 6 13 11
        C 8 17 -3 18 -9 15
        C -13 13 -15 12 -16 8 Z" />
      {/* 엄지 */}
      <path d="M -15 3 C -23 0 -24 -8 -18 -11 C -13 -13 -9 -8 -12 -2 C -13 0 -14 2 -15 3 Z" />
    </g>
  )
}

// 사람 상반신 실루엣이 스스로를 안는(나비 포옹) 모습 — activeSide 박자에 손이 토닥인다.
function CrossedArmsHug({ activeSide }) {
  const body = 'rgba(255,255,255,0.12)'
  const arm = 'rgba(255,255,255,0.2)'
  const handStyle = (active) => ({
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transition: 'transform .26s ease, opacity .26s ease',
    transform: active ? 'translateY(7px) scale(1.09)' : 'translateY(0) scale(1)',
    opacity: active ? 0.6 : 0.3,
  })
  return (
    <svg width="252" height="252" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 머리 · 목 · 몸통 실루엣 (뒤) */}
      <g fill={body}>
        <circle cx="150" cy="50" r="30" />
        <rect x="135" y="74" width="30" height="36" rx="10" />
        <path d="M 92 300 C 84 224 82 168 92 132 Q 100 108 128 104 L 172 104 Q 200 108 208 132 C 218 168 216 224 208 300 Z" />
      </g>

      {/* 교차한 두 팔 (팔꿈치는 아래 중앙, 손은 반대쪽 어깨) */}
      <g stroke={arm} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 112 122 L 138 212 L 190 134" strokeWidth="29" />
        <path d="M 188 122 L 162 212 L 110 134" strokeWidth="29" />
      </g>

      {/* 왼쪽 어깨의 손 (activeSide==='left'일 때 토닥) */}
      <g style={handStyle(activeSide === 'left')}>
        <g transform="translate(110 132) rotate(26)"><NaturalHand /></g>
      </g>
      {/* 오른쪽 어깨의 손 (activeSide==='right'일 때 토닥) */}
      <g style={handStyle(activeSide === 'right')}>
        <g transform="translate(190 132) rotate(-26)"><NaturalHand /></g>
      </g>
    </svg>
  )
}

// 두 원 뒤에 겹쳐 보이는, 크고 아주 흐릿한 나비 실루엣
function ButterflyGhost({ className = '', style }) {
  return (
    <svg
      className={className}
      style={{ filter: 'blur(2.5px)', ...style }}
      width="384" height="352" viewBox="0 0 420 384" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    >
      <defs>
        <radialGradient id="bf-wing" cx="50%" cy="44%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <g opacity="0.13" fill="url(#bf-wing)">
        {/* 윗날개 */}
        <ellipse cx="150" cy="150" rx="95" ry="70" transform="rotate(-20 150 150)" />
        <ellipse cx="270" cy="150" rx="95" ry="70" transform="rotate(20 270 150)" />
        {/* 아랫날개 */}
        <ellipse cx="168" cy="254" rx="70" ry="58" transform="rotate(24 168 254)" opacity="0.85" />
        <ellipse cx="252" cy="254" rx="70" ry="58" transform="rotate(-24 252 254)" opacity="0.85" />
        {/* 몸통 · 머리 */}
        <ellipse cx="210" cy="202" rx="11" ry="112" fill="#fff" fillOpacity="0.55" />
        <circle cx="210" cy="94" r="13" fill="#fff" fillOpacity="0.55" />
      </g>
      {/* 더듬이 */}
      <g opacity="0.13" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M 210 90 Q 189 58, 166 52" />
        <path d="M 210 90 Q 231 58, 254 52" />
      </g>
    </svg>
  )
}
