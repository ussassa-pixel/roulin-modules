import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// WOOP / MCII — Oettingen(2014). 대조(전결정) + 실행(if-then) 결합.
const taCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

// 한 줄 질문 + textarea 단계 (인라인 렌더 — 컴포넌트로 빼지 않음: 포커스 유지)
function TextStep({ question, hint, value, onChange, placeholder, onNext, nextLabel = '다음' }) {
  return (
    <div className="max-w-md w-full animate-fade-in">
      <p className="text-center text-navy text-lg font-light mb-2">{question}</p>
      <p className="text-center text-r-gray-soft text-xs mb-8">{hint}</p>
      <textarea className={taCls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus />
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
      >
        {nextLabel}
      </button>
    </div>
  )
}

export default function Woop({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [wish, setWish] = useState('')
  const [outcome, setOutcome] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [ifPart, setIfPart] = useState('')
  const [thenPart, setThenPart] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6" key={phase}>
        {inner}
      </div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>WOOP</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-3 leading-relaxed">
          소망 · 좋은 점 · 걸림돌 · 계획,<br />네 걸음으로 마음을 정리해요.
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">Wish · Outcome · Obstacle · Plan</p>
        <button onClick={() => setPhase('wish')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'wish')
    return page(<TextStep question="이루고 싶은 게 뭐예요?" hint="가깝고, 해볼 만한 것으로" value={wish} onChange={setWish} placeholder="예: 이번 주에 운동을 다시 시작하기" onNext={() => wish.trim() && setPhase('outcome')} />)
  if (phase === 'outcome')
    return page(<TextStep question="그게 이뤄지면 가장 좋은 점은?" hint="그 장면을 잠시 그려보세요" value={outcome} onChange={setOutcome} placeholder="예: 몸이 가벼워지고 마음도 개운할 것 같아요" onNext={() => outcome.trim() && setPhase('obstacle')} />)
  if (phase === 'obstacle')
    return page(<TextStep question="내 안의 가장 큰 걸림돌은?" hint="바깥 상황이 아니라, 내 안에서" value={obstacle} onChange={setObstacle} placeholder="예: 퇴근하면 너무 지쳐서 눕고 싶어져요" onNext={() => obstacle.trim() && setPhase('plan')} nextLabel="다음" />)

  if (phase === 'plan') {
    const ready = ifPart.trim() && thenPart.trim()
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">걸림돌을 만나면, 어떻게 할까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">만약 ~하면 / 그러면 ~한다</p>
        <label className="block text-[12px] text-r-gray mb-1.5 ml-1">만약</label>
        <input className={`${inputCls} mb-4`} value={ifPart} onChange={(e) => setIfPart(e.target.value)} placeholder="예: 퇴근하고 눕고 싶어지면" autoFocus />
        <label className="block text-[12px] text-r-gray mb-1.5 ml-1">그러면</label>
        <input className={inputCls} value={thenPart} onChange={(e) => setThenPart(e.target.value)} placeholder="예: 옷부터 갈아입고 5분만 걷는다" />
        <button
          onClick={() => ready && setPhase('review')}
          disabled={!ready}
          className={`w-full py-4 rounded-full transition mt-6 ${ready ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          정리 보기
        </button>
      </div>
    )
  }

  if (phase === 'review') {
    const rows = [
      ['소망', wish],
      ['좋은 점', outcome],
      ['걸림돌', obstacle],
      ['계획', `만약 ${ifPart}, 그러면 ${thenPart}.`],
    ]
    return page(
      <div className="max-w-md w-full animate-fade-up">
        <p className="text-center text-r-gray-soft text-xs mb-6 tracking-wide">나의 WOOP</p>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left">
          {rows.map(([label, value]) => (
            <div key={label} className="mb-4 last:mb-0">
              <p className="text-[11px] tracking-[0.12em] text-amber mb-1">{label}</p>
              <p className="text-ink text-[14px] leading-relaxed">{value}</p>
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
