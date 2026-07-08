import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { speakSmart, stopSpeaking } from '../lib/tts'

// 몸 풀어주기 — 연습형. 점진적 근이완(PMR/Jacobson) + 짧은 바디스캔(MBSR).
// 산출물 없음. 통증 부위 강제 금지(카피). 반복이 정상(습관 형성).
const PARTS = [
  { name: '어깨', tense: '어깨를 귀 쪽으로 끌어올려 꽉—', rest: '이제 툭, 놓아요.\n풀린 느낌에 잠깐 머물러요.' },
  { name: '손', tense: '두 손을 주먹 쥐어 꽉—', rest: '스르르 펴며 놓아요.\n손끝까지 풀리는 느낌.' },
  { name: '얼굴', tense: '눈과 미간, 턱을 살짝 조여—', rest: '스윽 풀어요.\n얼굴이 부드러워지는 느낌.' },
  { name: '몸 전체', tense: '온몸을 아주 살짝 조여—', rest: '한 번에 툭.\n몸 전체가 가라앉는 느낌.' },
]
const BEATS = [
  { kind: 'intro', part: '', text: '자리를 편하게 두고,\n준비되면 시작할게요.', dur: 6 },
  ...PARTS.flatMap((p) => [
    { kind: 'tense', part: p.name, text: p.tense, dur: 6 },
    { kind: 'rest', part: p.name, text: p.rest, dur: 15 },
  ]),
]

export default function BodyRelease({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [feel, setFeel] = useState('')
  const [note, setNote] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>몸 풀어주기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          몸이 하루를 기억하고 있어요.<br />잠깐 풀어줄게요.
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">약 2분 · 앉아서도 누워서도</p>
        <button onClick={() => setPhase('guide')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'guide')
    return <BodyGuide onDone={() => setPhase('settle')} onExit={onExit} />

  if (phase === 'settle') {
    const words = ['가벼움', '무거움', '따뜻함', '그대로']
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 몸은 어때요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">가까운 걸 골라도, 안 골라도 괜찮아요</p>
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
        {feel === '그대로' && <p className="text-center text-[12px] text-r-gray-soft mb-4">그대로여도 괜찮아요.</p>}
        <input
          className="w-full rounded-2xl border border-line bg-white px-5 py-3.5 text-ink text-[14px] outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition mb-6"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="다른 말로 적고 싶다면 (선택)"
        />
        <button onClick={() => setPhase('close')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">마무리</button>
      </div>
    )
  }

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[21px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>몸이 조금은 알아챘을 거예요.<br />오늘은 여기까지.</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-12" />
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">닫기</button>
      </div>
    )

  if (phase === 'rating')
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )

  return null
}

// 부위별 가이드 시퀀스 — 자동 진행 + 일시정지/건너뛰기(이탈 허용) + 음성 토글(기본 off)
function BodyGuide({ onDone, onExit }) {
  const [i, setI] = useState(0)
  const [prog, setProg] = useState(0)
  const [paused, setPaused] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const elapsed = useRef(0)
  const pausedRef = useRef(false)
  const voiceRef = useRef(false)
  pausedRef.current = paused
  voiceRef.current = voiceOn

  const speak = (text) => speakSmart(text)

  useEffect(() => {
    if (i >= BEATS.length) { onDone(); return }
    elapsed.current = 0; setProg(0)
    if (voiceRef.current) speak(BEATS[i].text)
    const dur = BEATS[i].dur * 1000
    const id = setInterval(() => {
      if (pausedRef.current) return
      elapsed.current += 100
      const p = Math.min(elapsed.current / dur, 1)
      setProg(p)
      if (p >= 1) { clearInterval(id); setI((x) => x + 1) }
    }, 100)
    return () => clearInterval(id)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopSpeaking(), [])

  const beat = BEATS[Math.min(i, BEATS.length - 1)]
  const R = 80, C = 2 * Math.PI * R
  const ringColor = beat.kind === 'tense' ? '#E0A33E' : beat.kind === 'rest' ? '#7c89e8' : '#c9c2b2'
  const countLabel = beat.kind === 'tense' ? Math.max(0, Math.ceil((1 - prog) * beat.dur)) : ''

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #FBF9F1 0%, #F5F3EB 65%)' }}>
      <button onClick={() => setVoiceOn((x) => { const n = !x; if (!n) stopSpeaking(); return n })} className="absolute top-6 left-6 text-[11px] tracking-wider font-light text-r-gray-soft hover:text-navy transition z-10">
        {voiceOn ? '음성 켜짐' : '음성 꺼짐'}
      </button>
      <button onClick={onExit} className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-r-gray-soft hover:text-navy transition z-10">나가기</button>

      {beat.part && <p className="text-[12px] tracking-[0.14em] text-amber mb-6">{beat.part}</p>}

      <div className="relative mb-8 flex items-center justify-center" style={{ width: 176, height: 176 }}>
        <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90">
          <circle cx="88" cy="88" r={R} fill="none" stroke="#E7E2D5" strokeWidth="5" />
          <circle cx="88" cy="88" r={R} fill="none" stroke={ringColor} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - prog)} style={{ transition: 'stroke-dashoffset .1s linear, stroke .4s' }} />
        </svg>
        {/* 부위별 따라하기 애니메이션 */}
        <PartFigure part={beat.part} tensed={beat.kind === 'tense'} />
        {countLabel !== '' && (
          <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-light text-amber/80" style={{ bottom: 8 }}>{countLabel}</span>
        )}
      </div>

      <p key={i} className="text-center text-[18px] text-navy/80 font-light animate-fade-in whitespace-pre-line leading-relaxed mb-10" style={{ minHeight: '56px' }}>
        {beat.text}
      </p>

      <div className="flex items-center gap-3">
        <button onClick={() => setPaused((x) => !x)} className="px-5 py-2.5 rounded-full bg-white border border-line text-ink text-[13px] hover:border-[#DCD5C4] transition">
          {paused ? '이어서' : '잠깐 멈춤'}
        </button>
        <button onClick={() => setI((x) => x + 1)} className="px-5 py-2.5 rounded-full text-r-gray text-[13px] hover:text-navy transition">건너뛰기</button>
      </div>

      <button onClick={onDone} className="mt-6 text-[12px] text-r-gray-soft hover:text-navy transition">그만하고 마무리</button>
      <p className="absolute bottom-8 left-0 right-0 text-center text-[11px] text-r-gray-soft">아픈 부위는 건너뛰어도 돼요.</p>
    </div>
  )
}

// ── 부위별 따라하기 그림 (조임 ↔ 탁! 풀림) ──
const STROKE = '#33415a'
// 조일 때: 빠르게 당김 / 놓을 때: 탁, 살짝 튕기며 풀림(overshoot)
const contract = 'cubic-bezier(.5,0,.9,.35)'
const release = 'cubic-bezier(.34,1.7,.5,1)'
const org = { transformBox: 'fill-box', transformOrigin: 'center' }

function PartFigure({ part, tensed }) {
  const common = { width: 116, height: 116, viewBox: '0 0 120 120', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', className: 'relative z-10' }
  const T = (prop = 'transform') => `${prop} ${tensed ? '.24s' : '.72s'} ${tensed ? contract : release}`
  // 조이는 동안엔 근육 떨림, 놓으면 멈춤
  const wrap = (svg) => <div className={tensed ? 'animate-tremor' : ''}>{svg}</div>

  if (part === '어깨')
    return wrap(
      <svg {...common}>
        <circle cx="60" cy="28" r="15" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <circle cx="55" cy="26" r="2" fill={STROKE} /><circle cx="65" cy="26" r="2" fill={STROKE} />
        <g style={{ transform: tensed ? 'translateY(-22px) scaleY(1.06)' : 'translateY(0) scaleY(1)', transition: T(), ...org }}>
          <path d="M 20 96 Q 20 66, 60 63 Q 100 66, 100 96" fill="none" stroke={STROKE} strokeWidth="11" strokeLinecap="round" />
          <path d="M 30 92 L 30 112 M 90 92 L 90 112" stroke={STROKE} strokeWidth="7" strokeLinecap="round" opacity="0.5" />
        </g>
        <g style={{ opacity: tensed ? 0.7 : 0, transform: tensed ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity .35s, transform .35s' }} stroke="#E0A33E" strokeWidth="2.6" strokeLinecap="round">
          <path d="M 28 56 l 6 -7 l 6 7" fill="none" /><path d="M 80 56 l 6 -7 l 6 7" fill="none" />
        </g>
      </svg>
    )

  if (part === '손')
    return wrap(
      <svg {...common}>
        {/* 편 손 (놓으면 탁 펴짐) */}
        <g style={{ opacity: tensed ? 0 : 1, transform: tensed ? 'scale(0.8)' : 'scale(1)', transition: `opacity .22s, transform ${tensed ? '.24s ' + contract : '.7s ' + release}`, ...org }}>
          <rect x="40" y="62" width="40" height="42" rx="15" fill="#fff" stroke={STROKE} strokeWidth="3" />
          {[44, 53.5, 63, 72.5].map((x, i) => (
            <rect key={i} x={x - 3.5} y={22 + (i === 0 || i === 3 ? 8 : 0)} width="7" height={44 - (i === 0 || i === 3 ? 8 : 0)} rx="3.5" fill="#fff" stroke={STROKE} strokeWidth="3" />
          ))}
          <rect x="30" y="66" width="7" height="22" rx="3.5" fill="#fff" stroke={STROKE} strokeWidth="3" transform="rotate(-40 33 78)" />
        </g>
        {/* 주먹 (조이면 꽉) */}
        <g style={{ opacity: tensed ? 1 : 0, transform: tensed ? 'scale(1)' : 'scale(0.86)', transition: `opacity .22s, transform .24s ${contract}`, ...org }}>
          <rect x="36" y="52" width="48" height="46" rx="18" fill="#fff" stroke={STROKE} strokeWidth="3" />
          {[46, 56, 66, 76].map((x, i) => <path key={i} d={`M ${x} 54 q 4 -6 8 0`} fill="none" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />)}
          <path d="M 36 72 q -8 4 -2 16" fill="#fff" stroke={STROKE} strokeWidth="3" />
        </g>
      </svg>
    )

  if (part === '얼굴')
    return wrap(
      <svg {...common}>
        <circle cx="60" cy="60" r="36" fill="#fff" stroke={STROKE} strokeWidth="3" />
        {/* 편안한 얼굴 (놓으면 탁 펴짐) */}
        <g style={{ opacity: tensed ? 0 : 1, transform: tensed ? 'scale(0.9)' : 'scale(1)', transition: `opacity .22s, transform ${tensed ? '.24s ' + contract : '.7s ' + release}`, ...org }} stroke={STROKE} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 40 48 q 6 -3 12 0" /><path d="M 68 48 q 6 -3 12 0" />
          <ellipse cx="46" cy="58" rx="3.5" ry="4.5" fill={STROKE} stroke="none" /><ellipse cx="74" cy="58" rx="3.5" ry="4.5" fill={STROKE} stroke="none" />
          <path d="M 48 76 q 12 8 24 0" />
        </g>
        {/* 찡그린 얼굴 (조이면 안으로) */}
        <g style={{ opacity: tensed ? 1 : 0, transform: tensed ? 'scale(1)' : 'scale(1.06)', transition: `opacity .22s, transform .24s ${contract}`, ...org }} stroke={STROKE} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 40 52 q 7 -6 13 -2" /><path d="M 80 52 q -7 -6 -13 -2" />
          <path d="M 42 60 h 9" /><path d="M 69 60 h 9" />
          <path d="M 50 78 h 20" />
        </g>
      </svg>
    )

  if (part === '몸 전체')
    return wrap(
      <svg {...common}>
        <g style={{ transform: tensed ? 'scale(0.82) translateY(7px)' : 'scale(1)', transition: T(), ...org }}>
          <circle cx="60" cy="26" r="13" fill="#fff" stroke={STROKE} strokeWidth="3" />
          <path d="M 44 46 Q 60 40, 76 46 L 72 92 Q 60 98, 48 92 Z" fill="#fff" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M 45 50 Q 30 66, 34 88" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round"
            style={{ transform: tensed ? 'translateX(9px)' : 'translateX(0)', transition: T(), ...org }} />
          <path d="M 75 50 Q 90 66, 86 88" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round"
            style={{ transform: tensed ? 'translateX(-9px)' : 'translateX(0)', transition: T(), ...org }} />
        </g>
      </svg>
    )

  return null
}
