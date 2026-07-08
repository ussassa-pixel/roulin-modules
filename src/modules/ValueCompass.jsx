import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 나의 나침반 — ACT 가치 명료화(Hayes). '왜'를 다룸(행동 모듈의 '무엇을'과 구분).
// 안전: 라우터 게이트 통과 후에만 추천되는 전제. 의미 상실을 파고들지 않고 '지금 소중한 것 하나'로만 향함.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

export default function ValueCompass({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [value, setValue] = useState('')
  const [why, setWhy] = useState('')
  const [tinyStep, setTinyStep] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>나의 나침반</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          바쁘게 지내다 보면<br />뭐가 중요했는지 흐려질 때가 있어요.
        </p>
        <button onClick={() => setPhase('value')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'value')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2 leading-relaxed">요즘의 나에게,<br />이것만은 소중하다 싶은 게 있다면?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">사람, 일, 몸, 뭐든 좋아요</p>
        <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="예: 가족과 저녁 먹는 시간" autoFocus />
        <button
          onClick={() => value.trim() && setPhase('why')}
          disabled={!value.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'why')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2 leading-relaxed">그게 소중한 이유를<br />한 줄로 적어본다면?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">떠오르는 대로</p>
        <textarea className={taCls} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="예: 그때만은 마음이 놓여서" autoFocus />
        <button
          onClick={() => why.trim() && setPhase('tiny')}
          disabled={!why.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${why.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'tiny')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2 leading-relaxed">오늘 그것에<br />아주 조금 가까워지는 방법이 있을까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">2분짜리도 좋아요 · 없으면 건너뛰어도 돼요</p>
        <input className={inputCls} value={tinyStep} onChange={(e) => setTinyStep(e.target.value)} placeholder="예: 오늘은 휴대폰 없이 저녁 먹기" autoFocus />
        <button onClick={() => setPhase('summary')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-5">
          나침반 보기
        </button>
        <button onClick={() => { setTinyStep(''); setPhase('summary') }} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-navy mt-1">
          건너뛰기
        </button>
      </div>
    )

  if (phase === 'summary')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="flex justify-center mb-6"><CompassIcon /></div>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left">
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>{value}</p>
          <p className="text-r-gray text-[14px] mt-1.5 leading-relaxed">{why}</p>
          {tinyStep.trim() && <p className="text-[13px] text-amber mt-4">오늘 한 걸음 · <span className="text-ink">{tinyStep}</span></p>}
        </div>
        <p className="text-[13px] text-r-gray mb-10">방향만 알아도, 오늘은 충분해요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">마무리</button>
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

function CompassIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cmp-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0A33E" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E0A33E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="36" cy="36" r="34" fill="url(#cmp-halo)" />
      <circle cx="36" cy="36" r="25" fill="#fff" stroke="#e3c98a" strokeWidth="1.5" />
      <circle cx="36" cy="36" r="25" fill="none" stroke="#112338" strokeOpacity="0.08" strokeWidth="1" />
      {/* 바늘 */}
      <path d="M 36 16 L 41 36 L 36 33 L 31 36 Z" fill="#E0A33E" />
      <path d="M 36 56 L 31 36 L 36 39 L 41 36 Z" fill="#112338" opacity="0.55" />
      <circle cx="36" cy="36" r="3" fill="#112338" />
    </svg>
  )
}
