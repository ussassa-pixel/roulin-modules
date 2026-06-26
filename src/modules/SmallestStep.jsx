import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 가장 작은 한 걸음(2분) — 착수 장벽 낮추기(tiny-step). '활동 스케줄링'이 아니라 '착수 한 스텝'으로만 좁힘.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

export default function SmallestStep({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [task, setTask] = useState('')
  const [shrink, setShrink] = useState('')
  const [anchor, setAnchor] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const field = (question, hint, value, set, placeholder, onNext) => (
    <div className="max-w-md w-full animate-fade-in">
      <p className="text-center text-navy text-lg font-light mb-2">{question}</p>
      <p className="text-center text-r-gray-soft text-xs mb-8">{hint}</p>
      <input className={inputCls} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} autoFocus />
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
      >
        다음
      </button>
    </div>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>가장 작은 한 걸음</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          막막할 땐<br />가장 작은 한 걸음부터요.
        </p>
        <button onClick={() => setPhase('task')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'task')
    return page(field('어떤 일이 막막해요?', '지금 손이 안 가는 그 일', task, setTask, '예: 밀린 메일 정리', () => task.trim() && setPhase('shrink')))

  if (phase === 'shrink')
    return page(field('2분 안에 시작할 수 있는 가장 작은 동작은?', '완성이 아니라 시작이면 돼요', shrink, setShrink, '예: 메일함을 열어 한 통만 읽기', () => shrink.trim() && setPhase('anchor')))

  if (phase === 'anchor')
    return page(field('언제 시작해볼까요?', '때를 정해두면 덜 미뤄져요', anchor, setAnchor, '예: 지금, 자리에 앉자마자', () => anchor.trim() && setPhase('review')))

  if (phase === 'review')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="text-r-gray-soft text-xs mb-6 tracking-wide">딱 이것만</p>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left">
          <p className="text-[11px] tracking-[0.12em] text-amber mb-1">언제</p>
          <p className="text-ink text-[15px] mb-4 leading-relaxed">{anchor}</p>
          <p className="text-[11px] tracking-[0.12em] text-amber mb-1">첫 동작</p>
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>{shrink}</p>
        </div>
        <p className="text-[13px] text-r-gray mb-10">나머지는 그다음에 생각해도 돼요.</p>
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
