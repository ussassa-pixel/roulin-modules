import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 몸 훑기 — '잠이 안 올 때' 코너.
// 누워 있는 몸을 머리부터 발끝까지, 스캔 바가 천천히 훑고 내려간다.
// 각 부위에 도착하면 잠깐 머물며 유도 음성이 그곳의 힘을 풀어준다(바디 스캔).
// 스캐너처럼 느리고 또박또박. 음성이 꺼져 있으면 글로 같은 속도로 진행.
const NIGHT_BG = { background: 'radial-gradient(ellipse at 50% 34%, #141d38 0%, #0a1022 68%, #05070f 100%)' }

// y: 누운 몸(세로 배치) 위에서 아래로의 위치(0~100)
const STEPS = [
  { part: '정수리', y: 5, line: '머리 꼭대기부터 시작할게요. 정수리의 힘을 스르르 풀어요.' },
  { part: '이마와 눈', y: 13, line: '이마와 눈으로 천천히 내려와요. 미간을 펴고, 눈꺼풀을 무겁게 두어요.' },
  { part: '턱과 얼굴', y: 20, line: '턱과 얼굴이 느슨해져요. 입을 살짝 벌려도 좋아요.' },
  { part: '목', y: 27, line: '목을 지나가요. 뒤통수와 목의 긴장을 내려놓아요.' },
  { part: '어깨', y: 34, line: '어깨로 내려와요. 어깨를 아래로 툭, 하루의 무게를 내려놓아요.' },
  { part: '팔과 손', y: 44, line: '팔을 따라 손끝까지 내려가요. 팔이 무거워지고, 손이 스르르 풀려요.' },
  { part: '가슴', y: 46, line: '가슴으로 와요. 숨이 천천히 오르내리는 걸 가만히 느껴 봐요.' },
  { part: '배', y: 56, line: '배로 내려와요. 배가 부드러워지고, 따뜻하게 풀려요.' },
  { part: '허리와 등', y: 64, line: '등과 허리를 지나가요. 바닥에 닿은 등이 무겁게 가라앉아요.' },
  { part: '골반', y: 71, line: '골반으로 내려와요. 몸을 받치던 힘까지 다 내려놓아요.' },
  { part: '다리', y: 83, line: '허벅지와 다리를 따라 내려가요. 다리가 점점 무거워져요.' },
  { part: '발', y: 96, line: '발끝까지 다 왔어요. 온몸의 힘이 완전히 풀렸어요.' },
]

// 느린 스캔 페이싱 — 부위로 이동(훑기) → 도착 후 안내 → 잠시 머묾
const TRAVEL_MS = 2800        // 다음 부위로 바가 훑고 내려가는 시간
const DWELL_AFTER_SPEAK = 2000 // 안내가 끝난 뒤 머무는 시간
const STEP_MUTED = 7200        // 음소거 시 부위별 읽는 시간

export default function BodyScan({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const { speak, stop, isMuted } = useSpeech()
  const runRef = useRef(0)
  const pausedRef = useRef(false); pausedRef.current = paused
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const timerRef = useRef(null)

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }

  const advance = (idx, token) => {
    if (token !== runRef.current || pausedRef.current) return
    if (idx + 1 >= STEPS.length) { stop(); setPhase('done'); return }
    runStep(idx + 1, token)
  }

  // 한 부위: 바가 그 위치로 훑고 내려간 뒤(도착) → 안내 → 머묾 → 다음
  const runStep = (idx, token) => {
    if (token !== runRef.current) return
    setI(idx) // 바가 STEPS[idx].y로 CSS 전이(훑기)
    timerRef.current = setTimeout(async () => {
      if (token !== runRef.current || pausedRef.current) return
      if (!mutedRef.current) {
        try { await speak(STEPS[idx].line) } catch { /* noop */ }
        if (token !== runRef.current || pausedRef.current) return
        timerRef.current = setTimeout(() => advance(idx, token), DWELL_AFTER_SPEAK)
      } else {
        timerRef.current = setTimeout(() => advance(idx, token), STEP_MUTED)
      }
    }, TRAVEL_MS)
  }

  const begin = () => {
    const token = ++runRef.current
    setPaused(false); pausedRef.current = false
    setI(0); setPhase('play')
    runStep(0, token)
  }
  const togglePause = () => {
    if (!paused) { setPaused(true); pausedRef.current = true; clearTimer(); stop() }
    else { setPaused(false); pausedRef.current = false; const token = ++runRef.current; runStep(i, token) }
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
            <div className="flex justify-center mb-8"><Scanner y={8} scanning /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              누워서 눈을 감고,<br />몸을 위에서 아래로 천천히 훑어 내려가요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">부위마다 잠깐 머물며 힘을 풀어요. 소리를 켜면 목소리가 함께해요.</p>
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
            <div className="flex justify-center mb-7"><Scanner y={100} soft /></div>
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
          <Scanner y={step.y} scanning={!paused} />
          <p className="text-amber/80 text-[13px] tracking-wide mt-9 mb-2">{step.part}</p>
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

// 누운 몸(세로) + 위에서 아래로 훑는 스캔 바. y(0~100)에 바가 위치.
function Scanner({ y, scanning = false, soft = false }) {
  const W = 150, H = 250
  const barY = 10 + (y / 100) * (H - 20)
  const scannedH = barY // 훑고 지나간 영역 높이
  return (
    <div className="relative" style={{ width: W, height: H }}>
      <svg width={W} height={H} viewBox="0 0 150 250" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="bs-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" /><stop offset="1" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
          <linearGradient id="bs-scanned" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(240,197,120,0.34)" /><stop offset="1" stopColor="rgba(240,197,120,0.10)" />
          </linearGradient>
          <clipPath id="bs-clip">
            {/* 누운 몸 실루엣 */}
            <circle cx="75" cy="26" r="17" />
            <rect x="52" y="42" width="46" height="88" rx="22" />
            <rect x="36" y="52" width="15" height="66" rx="7.5" />
            <rect x="99" y="52" width="15" height="66" rx="7.5" />
            <rect x="56" y="120" width="17" height="112" rx="8.5" />
            <rect x="77" y="120" width="17" height="112" rx="8.5" />
          </clipPath>
        </defs>
        {/* 베개 */}
        <ellipse cx="75" cy="30" rx="34" ry="16" fill="rgba(255,255,255,0.05)" />
        {/* 몸 */}
        <g clipPath="url(#bs-clip)">
          <rect x="0" y="0" width="150" height="250" fill="url(#bs-body)" />
          {/* 훑고 지나간 부분 — 따뜻하게 풀린 영역 */}
          <rect x="0" y="0" width="150" height={scannedH} fill="url(#bs-scanned)" style={{ transition: `height ${TRAVEL_MS}ms ease-in-out` }} />
          <rect x="0" y="0" width="150" height="250" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </g>
      </svg>

      {/* 스캔 바 — 위에서 아래로 훑고 내려간다 */}
      {!soft && (
        <div className="absolute left-0 right-0 pointer-events-none" style={{ top: barY, transform: 'translateY(-50%)', transition: `top ${TRAVEL_MS}ms ease-in-out` }}>
          <div style={{ height: 18, background: 'linear-gradient(to bottom, rgba(240,197,120,0) 0%, rgba(240,197,120,0.28) 50%, rgba(240,197,120,0) 100%)' }} />
          <div className={scanning ? 'bs-glow' : ''} style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, marginTop: -1, background: 'linear-gradient(to right, rgba(240,197,120,0) 0%, rgba(246,207,122,0.95) 50%, rgba(240,197,120,0) 100%)', boxShadow: '0 0 12px 2px rgba(240,197,120,0.6)' }} />
        </div>
      )}
      <style>{`@keyframes bs-gl{0%,100%{opacity:.55}50%{opacity:1}}.bs-glow{animation:bs-gl 2s ease-in-out infinite}`}</style>
    </div>
  )
}
