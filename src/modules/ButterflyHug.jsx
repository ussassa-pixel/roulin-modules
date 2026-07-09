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

// X자로 교차한 반투명 팔·손 실루엣 — activeSide 박자에 맞춰 해당 손이 토닥인다.
function HandShape() {
  // 원점 기준: 손바닥(아래) + 네 손가락(위를 향함)
  return (
    <g fill="#fff">
      <ellipse cx="0" cy="11" rx="27" ry="20" />
      <rect x="-24" y="-19" width="11" height="26" rx="5.5" transform="rotate(-13 -18.5 -6)" />
      <rect x="-10" y="-25" width="11" height="31" rx="5.5" transform="rotate(-4 -4.5 -9)" />
      <rect x="4"   y="-25" width="11" height="31" rx="5.5" transform="rotate(5 9.5 -9)" />
      <rect x="18"  y="-18" width="11" height="25" rx="5.5" transform="rotate(14 23.5 -5)" />
    </g>
  )
}

function CrossedArmsHug({ activeSide }) {
  const armStroke = 'rgba(255,255,255,0.15)'
  const handStyle = (active) => ({
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transition: 'transform .26s ease, opacity .26s ease',
    transform: active ? 'translateY(8px) scale(1.1)' : 'translateY(0) scale(1)',
    opacity: active ? 0.55 : 0.24,
  })
  return (
    <svg width="248" height="248" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 교차한 두 전완 (X자) */}
      <path d="M 66 252 Q 118 208 192 106" stroke={armStroke} strokeWidth="30" strokeLinecap="round" />
      <path d="M 234 252 Q 182 208 108 106" stroke={armStroke} strokeWidth="30" strokeLinecap="round" />
      {/* 왼쪽 어깨에 얹은 손 (activeSide==='left'일 때 토닥) */}
      <g style={handStyle(activeSide === 'left')}>
        <g transform="translate(108 104) rotate(17)"><HandShape /></g>
      </g>
      {/* 오른쪽 어깨에 얹은 손 (activeSide==='right'일 때 토닥) */}
      <g style={handStyle(activeSide === 'right')}>
        <g transform="translate(192 104) rotate(-17)"><HandShape /></g>
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
