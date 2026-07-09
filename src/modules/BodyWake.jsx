import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'

// 몸 깨우기 (v4.1 body_wake) — 연습형·상향(활성). body_release(이완·하향)의 정반대 방향.
// 라우터 구분: "긴장돼요" → bodyrelease / "처져요·늘어져요" → bodywake.
// 90초 · 3동작 · 자리에서 가능 · 장비 없음. 산출물 없음, 반복 정상.
// 안전 카피 고정: "불편한 동작은 건너뛰어도 돼요." EndRating 없음 — settle이 체크인을 대신한다.
const MOVES = [
  { name: '기지개 크게', text: '팔을 위로 쭉— 옆으로 한 번씩.\n숨도 크게.', dur: 30 },
  { name: '어깨·목 돌리기', text: '천천히 크게 세 바퀴,\n반대로 세 바퀴.', dur: 30 },
  { name: '제자리 흔들기', text: '손·팔을 털고, 발도 동동.\n몸에 시동 건다는 느낌으로.', dur: 30 },
]

const STROKE = '#33415a'

// 동작별 따라하기 그림
function MoveFigure({ index }) {
  const common = { width: 116, height: 116, viewBox: '0 0 120 120', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', className: 'relative z-10' }
  const org = { transformBox: 'fill-box', transformOrigin: 'center' }

  if (index === 0) // 기지개 — 팔이 위로 쭉 늘어났다 내려오기
    return (
      <svg {...common}>
        <style>{`@keyframes bwStretch { 0%, 15% { transform: translateY(0) scaleY(1); } 45%, 70% { transform: translateY(-7px) scaleY(1.08); } 100% { transform: translateY(0) scaleY(1); } }`}</style>
        <circle cx="60" cy="30" r="13" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <g style={{ animation: 'bwStretch 3.2s ease-in-out infinite', ...org }}>
          <path d="M 48 50 Q 60 44, 72 50 L 70 92 Q 60 97, 50 92 Z" fill="#fff" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M 50 52 Q 40 34, 46 16" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
          <path d="M 70 52 Q 80 34, 74 16" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
        </g>
        <g stroke="#E0A33E" strokeWidth="2.4" strokeLinecap="round" opacity="0.8">
          <path d="M 34 14 l 4 -5 M 86 14 l -4 -5 M 60 8 l 0 -6" />
        </g>
      </svg>
    )

  if (index === 1) // 어깨·목 돌리기 — 머리 주위를 도는 궤도
    return (
      <svg {...common}>
        <style>{`@keyframes bwOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <circle cx="60" cy="46" r="15" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <path d="M 26 100 Q 26 74, 60 71 Q 94 74, 94 100" fill="none" stroke={STROKE} strokeWidth="10" strokeLinecap="round" />
        <g style={{ animation: 'bwOrbit 3s linear infinite', transformOrigin: '60px 46px' }}>
          <path d="M 60 18 A 28 28 0 0 1 88 46" fill="none" stroke="#E0A33E" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="4 6" />
          <circle cx="60" cy="18" r="3.2" fill="#E0A33E" />
        </g>
      </svg>
    )

  // 제자리 흔들기 — 손발 털기
  return (
    <svg {...common}>
      <style>{`@keyframes bwShake { 0%, 100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-2.5px) rotate(-1.6deg); } 75% { transform: translateX(2.5px) rotate(1.6deg); } }`}</style>
      <g style={{ animation: 'bwShake 0.35s ease-in-out infinite', ...org }}>
        <circle cx="60" cy="28" r="13" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <path d="M 48 48 Q 60 42, 72 48 L 70 88 Q 60 93, 50 88 Z" fill="#fff" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 49 52 Q 36 62, 32 76" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
        <path d="M 71 52 Q 84 62, 88 76" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
        <path d="M 54 90 L 52 106 M 66 90 L 68 106" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
      </g>
      <g stroke="#E0A33E" strokeWidth="2.2" strokeLinecap="round" opacity="0.75">
        <path d="M 24 70 l -6 2 M 26 80 l -6 -1 M 96 70 l 6 2 M 94 80 l 6 -1" />
      </g>
    </svg>
  )
}

export default function BodyWake({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → guide → settle → close
  const [feel, setFeel] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>몸 깨우기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          몸이 좀 처져 있나요?<br />90초면 살짝 깨울 수 있어요.
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">앉은 자리에서도 돼요</p>
        <button onClick={() => setPhase('guide')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          시작하기
        </button>
      </div>
    )

  if (phase === 'guide')
    return <WakeGuide onDone={() => setPhase('settle')} onExit={onExit} />

  if (phase === 'settle') {
    const words = ['가벼움', '살짝 깸', '그대로', '모르겠음']
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금은 어때요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">어느 쪽이어도 괜찮아요</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {words.map((w) => (
            <button
              key={w}
              onClick={() => setFeel(feel === w ? '' : w)}
              className={`py-4 rounded-2xl transition border text-[15px] ${feel === w ? 'bg-amber-soft text-navy border-amber/40' : 'bg-white text-ink border-line hover:border-[#DCD5C4]'}`}
            >
              {w}
            </button>
          ))}
        </div>
        {(feel === '그대로' || feel === '모르겠음') && (
          <p className="text-center text-[12px] text-r-gray-soft mb-4">그대로여도 괜찮아요. 몸이 움직인 건 사실이니까요.</p>
        )}
        <button onClick={() => setPhase('close')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-2">
          마무리
        </button>
      </div>
    )
  }

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[21px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>
          몸은 시동이 걸렸어요.<br />오늘도 여기까지 온 것만으로 충분해요.
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-12" />
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          닫기
        </button>
      </div>
    )

  return null
}

// 3동작 자동 진행 — 30초 카운트다운 링 + 일시정지/건너뛰기 상시
function WakeGuide({ onDone, onExit }) {
  const [i, setI] = useState(0)
  const [prog, setProg] = useState(0)
  const [paused, setPaused] = useState(false)
  const elapsed = useRef(0)
  const pausedRef = useRef(false)
  pausedRef.current = paused

  useEffect(() => {
    if (i >= MOVES.length) { onDone(); return }
    elapsed.current = 0; setProg(0)
    const dur = MOVES[i].dur * 1000
    const id = setInterval(() => {
      if (pausedRef.current) return
      elapsed.current += 100
      const p = Math.min(elapsed.current / dur, 1)
      setProg(p)
      if (p >= 1) { clearInterval(id); setI((x) => x + 1) }
    }, 100)
    return () => clearInterval(id)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  const move = MOVES[Math.min(i, MOVES.length - 1)]
  const R = 80, C = 2 * Math.PI * R
  const remain = Math.max(0, Math.ceil((1 - prog) * move.dur))

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #FBF9F1 0%, #F5F3EB 65%)' }}>
      <button onClick={onExit} className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-r-gray-soft hover:text-navy transition z-10">나가기</button>

      <p className="text-[12px] tracking-[0.14em] text-amber mb-1">{i + 1} / {MOVES.length}</p>
      <p className="text-navy text-[17px] mb-6" style={{ fontWeight: 600 }}>{move.name}</p>

      <div className="relative mb-8 flex items-center justify-center" style={{ width: 176, height: 176 }}>
        <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90">
          <circle cx="88" cy="88" r={R} fill="none" stroke="#E7E2D5" strokeWidth="5" />
          <circle cx="88" cy="88" r={R} fill="none" stroke="#E0A33E" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - prog)} style={{ transition: 'stroke-dashoffset .1s linear' }} />
        </svg>
        <MoveFigure index={i} />
        <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-light text-amber/80" style={{ bottom: 8 }}>{remain}</span>
      </div>

      <p key={i} className="text-center text-[18px] text-navy/80 font-light animate-fade-in whitespace-pre-line leading-relaxed mb-10" style={{ minHeight: '56px' }}>
        {move.text}
      </p>

      <div className="flex items-center gap-3">
        <button onClick={() => setPaused((x) => !x)} className="px-5 py-2.5 rounded-full bg-white border border-line text-ink text-[13px] hover:border-[#DCD5C4] transition">
          {paused ? '이어서' : '잠깐 멈춤'}
        </button>
        <button onClick={() => setI((x) => x + 1)} className="px-5 py-2.5 rounded-full text-r-gray text-[13px] hover:text-navy transition">건너뛰기</button>
      </div>

      <button onClick={onDone} className="mt-6 text-[12px] text-r-gray-soft hover:text-navy transition">그만하고 마무리</button>
      <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] text-r-gray-soft">불편한 동작은 건너뛰어도 돼요.</p>
    </div>
  )
}
