import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// WOOP / MCII — Oettingen(2014). 대조(전결정) + 실행(if-then) 결합.
// 단조로움을 피하려고 각 단계에 W·O·O·P 스테퍼 + 뜻 + 전용 아이콘 + 다른 강조 톤을 준다.
const taCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

const STEPS = [
  { key: 'wish', letter: 'W', en: 'Wish', word: '소망', accent: '#E0A33E', q: '이루고 싶은 게 뭐예요?', hint: '가깝고, 해볼 만한 것으로', ph: '예: 이번 주에 운동을 다시 시작하기' },
  { key: 'outcome', letter: 'O', en: 'Outcome', word: '좋은 점', accent: '#EDB24A', q: '그게 이뤄지면 가장 좋은 점은?', hint: '그 장면을 잠시 그려보세요', ph: '예: 몸이 가벼워지고 마음도 개운할 것 같아요' },
  { key: 'obstacle', letter: 'O', en: 'Obstacle', word: '걸림돌', accent: '#7C8598', q: '내 안의 가장 큰 걸림돌은?', hint: '바깥 상황이 아니라, 내 안에서', ph: '예: 퇴근하면 너무 지쳐서 눕고 싶어져요' },
  { key: 'plan', letter: 'P', en: 'Plan', word: '계획', accent: '#3E6E8E', q: '걸림돌을 만나면, 어떻게 할까요?', hint: '만약 ~하면 / 그러면 ~한다' },
]
const STEP_IDX = { wish: 0, outcome: 1, obstacle: 2, plan: 3 }

export default function Woop({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [wish, setWish] = useState('')
  const [outcome, setOutcome] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [ifPart, setIfPart] = useState('')
  const [thenPart, setThenPart] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6" key={phase}>{inner}</div>
    </ModuleFrame>
  )

  // 소망 → 좋은 점 → 걸림돌: 공통 텍스트 단계 (StepShell + textarea)
  const textStep = (key, value, setValue, next) => {
    const s = STEPS[STEP_IDX[key]]
    return (
      <StepShell idx={STEP_IDX[key]}>
        <textarea className={taCls} rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder={s.ph} autoFocus />
        <button
          onClick={() => value.trim() && setPhase(next)}
          disabled={!value.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={value.trim() ? { background: s.accent } : {}}
        >
          다음
        </button>
      </StepShell>
    )
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-4" style={{ fontWeight: 600 }}>WOOP</p>
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s) => (
            <div key={s.key} className="flex flex-col items-center" style={{ width: 56 }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-white" style={{ background: s.accent, fontWeight: 700 }}>{s.letter}</div>
              <span className="text-[11px] text-r-gray mt-1.5">{s.word}</span>
            </div>
          ))}
        </div>
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          소망 · 좋은 점 · 걸림돌 · 계획,<br />네 걸음으로 마음을 정리해요.
        </p>
        <button onClick={() => setPhase('wish')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'wish') return page(textStep('wish', wish, setWish, 'outcome'))
  if (phase === 'outcome') return page(textStep('outcome', outcome, setOutcome, 'obstacle'))
  if (phase === 'obstacle') return page(textStep('obstacle', obstacle, setObstacle, 'plan'))

  if (phase === 'plan') {
    const s = STEPS[3]
    const ready = ifPart.trim() && thenPart.trim()
    return page(
      <StepShell idx={3}>
        <label className="block text-[12px] text-r-gray mb-1.5 ml-1">만약</label>
        <input className={`${inputCls} mb-4`} value={ifPart} onChange={(e) => setIfPart(e.target.value)} placeholder="예: 퇴근하고 눕고 싶어지면" autoFocus />
        <label className="block text-[12px] text-r-gray mb-1.5 ml-1">그러면</label>
        <input className={inputCls} value={thenPart} onChange={(e) => setThenPart(e.target.value)} placeholder="예: 옷부터 갈아입고 5분만 걷는다" />
        <button
          onClick={() => ready && setPhase('review')}
          disabled={!ready}
          className={`w-full py-4 rounded-full transition mt-6 ${ready ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={ready ? { background: s.accent } : {}}
        >
          정리 보기
        </button>
      </StepShell>
    )
  }

  if (phase === 'review') {
    const rows = [
      { ...STEPS[0], v: wish },
      { ...STEPS[1], v: outcome },
      { ...STEPS[2], v: obstacle },
      { ...STEPS[3], v: `만약 ${ifPart}, 그러면 ${thenPart}.` },
    ]
    return page(
      <div className="max-w-md w-full animate-fade-up">
        <p className="text-center text-r-gray-soft text-xs mb-6 tracking-wide">나의 WOOP</p>
        <div className="space-y-3 mb-8">
          {rows.map((r) => (
            <div key={r.key} className="flex gap-3 rounded-2xl bg-white border border-line p-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-white shrink-0" style={{ background: r.accent, fontWeight: 700, fontSize: 14 }}>{r.letter}</div>
              <div className="min-w-0">
                <p className="text-[11px] mb-0.5" style={{ color: r.accent }}>{r.word}</p>
                <p className="text-ink text-[14px] leading-relaxed">{r.v}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">마무리</button>
      </div>
    )
  }

  if (phase === 'rating')
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )

  return null
}

// 단계 공통 껍데기: W·O·O·P 스테퍼 + 아이콘 + 뜻 + 질문. children = 입력/버튼.
function StepShell({ idx, children }) {
  const s = STEPS[idx]
  return (
    <div className="max-w-md w-full animate-fade-in">
      {/* 스테퍼 */}
      <div className="flex justify-center items-center gap-2 mb-6">
        {STEPS.map((st, i) => (
          <div key={i} className="flex items-center">
            <div
              className="rounded-full flex items-center justify-center font-serif transition-all"
              style={{
                width: i === idx ? 34 : 26, height: i === idx ? 34 : 26,
                background: i <= idx ? st.accent : '#fff',
                color: i <= idx ? '#fff' : '#A8A294',
                border: i <= idx ? 'none' : '1.5px solid #E7E2D5',
                fontWeight: 700, fontSize: i === idx ? 15 : 12,
              }}
            >{st.letter}</div>
            {i < STEPS.length - 1 && <div className="w-4 h-px mx-1" style={{ background: i < idx ? s.accent : '#E7E2D5' }} />}
          </div>
        ))}
      </div>

      {/* 아이콘 + 은은한 글로우 (단계별 다른 톤) */}
      <div className="relative flex justify-center mb-3" style={{ height: 72 }}>
        <div className="absolute rounded-full blur-2xl" style={{ width: 90, height: 90, background: s.accent, opacity: 0.16 }} />
        <div className="relative z-10 animate-fade-up"><StepIcon kind={s.key} accent={s.accent} /></div>
      </div>
      <p className="text-center text-[13px] mb-4" style={{ color: s.accent, fontWeight: 500 }}>{s.en} · {s.word}</p>

      <p className="text-center text-navy text-lg font-light mb-2 leading-relaxed">{s.q}</p>
      <p className="text-center text-r-gray-soft text-xs mb-7">{s.hint}</p>
      {children}
    </div>
  )
}

// 단계별 상징 아이콘
function StepIcon({ kind, accent }) {
  const c = { width: 64, height: 64, viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  if (kind === 'wish') // 소망 — 반짝이는 별
    return (
      <svg {...c}>
        <path d="M 32 12 C 33 26, 38 31, 52 32 C 38 33, 33 38, 32 52 C 31 38, 26 33, 12 32 C 26 31, 31 26, 32 12 Z" fill={accent} className="animate-breath" style={{ transformOrigin: '32px 32px' }} />
        <circle cx="49" cy="18" r="2" fill={accent} opacity="0.7" className="animate-breath" style={{ animationDuration: '4s' }} />
        <circle cx="16" cy="46" r="1.6" fill={accent} opacity="0.6" className="animate-breath" style={{ animationDuration: '5s' }} />
      </svg>
    )
  if (kind === 'outcome') // 좋은 점 — 떠오르는 해
    return (
      <svg {...c}>
        <g className="animate-breath-slow" style={{ transformOrigin: '32px 34px' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180
            return <line key={a} x1={32 + 15 * Math.cos(r)} y1={34 + 15 * Math.sin(r)} x2={32 + 22 * Math.cos(r)} y2={34 + 22 * Math.sin(r)} stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          })}
        </g>
        <circle cx="32" cy="34" r="12" fill={accent} />
      </svg>
    )
  if (kind === 'obstacle') // 걸림돌 — 돌
    return (
      <svg {...c}>
        <path d="M 18 44 Q 14 30, 26 22 Q 40 15, 48 26 Q 54 36, 46 44 Z" fill={accent} opacity="0.9" />
        <path d="M 24 26 Q 30 22, 38 25" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.35" fill="none" />
        <ellipse cx="34" cy="48" rx="20" ry="3" fill={accent} opacity="0.2" />
      </svg>
    )
  // plan — 길과 깃발
  return (
    <svg {...c}>
      <path d="M 14 48 Q 26 44, 30 34 Q 34 24, 46 20" stroke={accent} strokeWidth="2.5" strokeDasharray="1 5" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="48" r="3" fill={accent} />
      <path d="M 46 18 L 46 34" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 46 19 L 56 22 L 46 26 Z" fill={accent} />
    </svg>
  )
}
