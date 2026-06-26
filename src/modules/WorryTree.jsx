import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 걱정 나무 — CBT 걱정 관리(해결형 vs 비해결형). 지금 바꿀 수 있나로 분기.
const taCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

export default function WorryTree({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [worry, setWorry] = useState('')
  const [action, setAction] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>걱정 나무</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          걱정을 둘로 나눠볼게요.<br />지금 바꿀 수 있는 것과, 아닌 것.
        </p>
        <button onClick={() => setPhase('worry')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'worry')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 어떤 걱정이 있나요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">하나만 골라서</p>
        <textarea className={taCls} rows={3} value={worry} onChange={(e) => setWorry(e.target.value)} placeholder="떠오르는 걱정 하나를 적어주세요" autoFocus />
        <button
          onClick={() => worry.trim() && setPhase('branch')}
          disabled={!worry.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${worry.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'branch')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="text-r-gray-soft text-xs mb-3 tracking-wide">이 걱정</p>
        <div className="rounded-2xl bg-white border border-line p-5 mb-10 text-left">
          <p className="text-ink text-[14px] leading-relaxed">{worry}</p>
        </div>
        <p className="text-navy text-lg font-light mb-8">이건 지금 내가 바꿀 수 있는 일인가요?</p>
        <div className="space-y-3">
          <button onClick={() => setPhase('act')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">네, 바꿀 수 있어요</button>
          <button onClick={() => setPhase('release')} className="w-full py-4 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">아니요, 지금은 어려워요</button>
        </div>
      </div>
    )

  if (phase === 'act')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">그럼 무엇을 해볼 수 있을까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">아주 작은 한 가지면 돼요</p>
        <input className={inputCls} value={action} onChange={(e) => setAction(e.target.value)} placeholder="예: 내일 오전에 담당자에게 메일 한 통" autoFocus />
        <button
          onClick={() => action.trim() && setPhase('actDone')}
          disabled={!action.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${action.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          정리 보기
        </button>
      </div>
    )

  if (phase === 'actDone')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="text-r-gray-soft text-xs mb-6 tracking-wide">해볼 수 있는 한 가지</p>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left">
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>{action}</p>
        </div>
        <p className="text-[13px] text-r-gray mb-10">할 수 있는 만큼만, 그거면 충분해요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">마무리</button>
      </div>
    )

  if (phase === 'release')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="rounded-2xl bg-white border border-line p-5 mb-8 text-left opacity-50" style={{ transition: 'opacity 1s' }}>
          <p className="text-r-gray text-[14px] leading-relaxed line-through decoration-r-gray-soft/50">{worry}</p>
        </div>
        <p className="text-navy text-lg font-light mb-3 leading-relaxed">지금 바꿀 수 없는 일이라면,<br />흐르도록 잠시 두어볼게요.</p>
        <p className="text-[13px] text-r-gray mb-10">바꿀 수 없는 걸 붙잡지 않는 것도 돌봄이에요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">내려놓기</button>
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
