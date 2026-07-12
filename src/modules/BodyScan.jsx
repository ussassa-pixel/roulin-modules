import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 몸 훑기 — '잠이 안 올 때' 코너.
// 머리부터 발끝까지, 유도 음성에 맞춰 빛나는 점이 몸 실루엣을 타고 내려간다.
// 각 부위의 힘을 스르르 푸는 바디 스캔. 음성이 꺼져 있으면 글로 천천히 진행.
const NIGHT_BG = { background: 'radial-gradient(ellipse at 50% 30%, #141d38 0%, #0a1022 68%, #05070f 100%)' }

// y는 실루엣(0~100) 상의 세로 위치
const STEPS = [
  { part: '머리', y: 12, line: '머리와 이마의 힘을 스르르 풀어요. 생각도 함께 내려놓아요.' },
  { part: '얼굴', y: 20, line: '눈과 턱의 힘을 빼요. 얼굴이 부드러워져요.' },
  { part: '어깨', y: 30, line: '어깨를 아래로 툭 떨어뜨려요. 하루의 무게를 내려놓아요.' },
  { part: '팔', y: 42, line: '팔과 손이 무거워져요. 손끝까지 힘이 풀려요.' },
  { part: '가슴', y: 40, line: '가슴이 천천히 오르내려요. 숨을 길게 내쉬어요.' },
  { part: '배', y: 52, line: '배가 부드럽게 풀려요. 따뜻해지는 걸 느껴 봐요.' },
  { part: '다리', y: 70, line: '허벅지와 다리가 무거워져요. 바닥으로 가라앉아요.' },
  { part: '발', y: 90, line: '발끝까지 힘이 다 풀렸어요. 온몸이 편안해요.' },
]
const STEP_MS = 8500 // 음성이 없을 때(음소거) 단계 간격

export default function BodyScan({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const { speak, stop, isMuted } = useSpeech()
  const runRef = useRef(0)       // 진행 토큰(중복 방지)
  const pausedRef = useRef(false); pausedRef.current = paused
  const timerRef = useRef(null)

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }

  // 한 단계 실행: 음성이 켜져 있으면 발화가 끝나면 다음, 꺼져 있으면 고정 간격
  const runStep = async (idx, token) => {
    if (token !== runRef.current) return
    setI(idx)
    const step = STEPS[idx]
    if (!isMuted) {
      try { await speak(step.line) } catch { /* noop */ }
      if (token !== runRef.current) return
      if (pausedRef.current) return
      timerRef.current = setTimeout(() => next(idx, token), 900)
    } else {
      timerRef.current = setTimeout(() => next(idx, token), STEP_MS)
    }
  }
  const next = (idx, token) => {
    if (token !== runRef.current || pausedRef.current) return
    if (idx + 1 >= STEPS.length) { setPhase('done'); return }
    runStep(idx + 1, token)
  }

  const begin = () => {
    const token = ++runRef.current
    setPaused(false); pausedRef.current = false
    setPhase('play')
    runStep(0, token)
  }
  const togglePause = () => {
    if (!paused) { // → 일시정지
      setPaused(true); pausedRef.current = true; clearTimer(); stop()
    } else {       // → 다시 이어가기
      setPaused(false); pausedRef.current = false
      const token = ++runRef.current
      runStep(i, token)
    }
  }
  const skip = () => {
    clearTimer(); stop()
    const token = ++runRef.current
    if (i + 1 >= STEPS.length) setPhase('done')
    else { setPaused(false); pausedRef.current = false; runStep(i + 1, token) }
  }

  useEffect(() => () => { runRef.current++; clearTimer(); stop() }, [stop])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={NIGHT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>몸 훑기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Body activeY={12} /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              머리부터 발끝까지,<br />안내에 맞춰 힘을 하나씩 풀어요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">누워서 들어도 좋아요. 소리를 켜면 목소리가 함께해요.</p>
            <button onClick={begin}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#05070f' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><Body activeY={95} soft /></div>
            <p className="font-serif text-[24px] text-white/85 mb-2" style={{ fontWeight: 600 }}>온몸이 풀렸어요</p>
            <p className="text-white/50 text-sm font-light mb-12 leading-relaxed">이대로 숨을 길게 내쉬며,<br />천천히 잠으로 가라앉아요.</p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/80 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">한 번 더</button>
            <button onClick={onExit} className="w-full py-4 bg-white/85 text-navy rounded-full hover:bg-white transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  const step = STEPS[i]
  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={NIGHT_BG}>
        <div className="max-w-md w-full flex flex-col items-center">
          <Body activeY={step.y} />
          <p className="text-amber/80 text-[12px] tracking-wide mt-8 mb-2">{step.part}</p>
          <p className="text-white/80 text-[16px] font-light text-center leading-relaxed min-h-[3rem] px-2">{step.line}</p>
          <div className="flex items-center gap-3 mt-8">
            <button onClick={togglePause} className="px-6 py-2.5 rounded-full bg-white/10 text-white/80 border border-white/20 text-[13px] hover:bg-white/20 transition">
              {paused ? '이어가기' : '잠깐 멈춤'}
            </button>
            <button onClick={skip} className="px-6 py-2.5 rounded-full text-white/45 text-[13px] hover:text-white/70 transition">
              다음 →
            </button>
          </div>
          <p className="text-white/25 text-[11px] mt-6 tabular-nums">{i + 1} / {STEPS.length}</p>
        </div>
      </div>
    </ModuleFrame>
  )
}

// 몸 실루엣 + 지금 부위에서 빛나는 점
function Body({ activeY, soft = false }) {
  return (
    <svg width="86" height="200" viewBox="0 0 86 200" fill="none" aria-hidden="true">
      {/* 실루엣 */}
      <g fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <circle cx="43" cy="20" r="13" />
        <rect x="30" y="34" width="26" height="52" rx="12" />
        <rect x="15" y="40" width="11" height="44" rx="5.5" />
        <rect x="60" y="40" width="11" height="44" rx="5.5" />
        <rect x="31" y="86" width="11" height="66" rx="5.5" />
        <rect x="44" y="86" width="11" height="66" rx="5.5" />
      </g>
      {/* 진행선(위→아래) */}
      <line x1="43" y1="8" x2="43" y2={`${8 + (activeY / 100) * 184}`} stroke="rgba(240,197,120,0.25)" strokeWidth="2" strokeLinecap="round" />
      {/* 빛나는 점 */}
      <circle cx="43" cy={`${8 + (activeY / 100) * 184}`} r={soft ? 7 : 6} fill="url(#bsg)">
        {!soft && <animate attributeName="r" values="5.5;7.5;5.5" dur="2.6s" repeatCount="indefinite" />}
      </circle>
      <circle cx="43" cy={`${8 + (activeY / 100) * 184}`} r="15" fill="url(#bsh)" opacity="0.5" />
      <defs>
        <radialGradient id="bsg" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#fff7e6" /><stop offset="0.5" stopColor="#f6cf7a" /><stop offset="1" stopColor="#e0a33e" /></radialGradient>
        <radialGradient id="bsh" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#f0c578" /><stop offset="1" stopColor="#f0c578" stopOpacity="0" /></radialGradient>
      </defs>
    </svg>
  )
}
