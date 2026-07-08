import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import StepScene from '../components/StepScene'

// 하루 닫기 — 취침 전 걱정 미루기 + 인지 오프로딩 + 전환 의례.
// 매듭(완료감) + 이월(내일로) + 닫기(의례)의 3박자. 야간 사용 전제: 저자극·각성 억제(느낌표 최소).
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

export default function DayClose({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [done, setDone] = useState('')
  const [carryOver, setCarryOver] = useState('')
  const [closing, setClosing] = useState(false)

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>하루 닫기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          오늘 하루, 아직 열려 있는 느낌인가요?<br />같이 닫아볼게요.
        </p>
        <button onClick={() => setPhase('done')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'done')
    return page(
      <StepScene key="done" total={2} index={0} accent="#E0A33E" icon="star" label="오늘 해낸 것" question={'오늘 그래도 해낸 것,\n하나만 꼽는다면?'} hint="작은 것도 해낸 거예요">
        <input className={inputCls} value={done} onChange={(e) => setDone(e.target.value)} placeholder="예: 미루던 전화 한 통을 했다" autoFocus />
        <button
          onClick={() => done.trim() && setPhase('carry')}
          disabled={!done.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${done.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={done.trim() ? { background: '#E0A33E' } : {}}
        >
          다음
        </button>
      </StepScene>
    )

  if (phase === 'carry')
    return page(
      <StepScene key="carry" total={2} index={1} accent="#7C8598" icon="tomorrow" label="내일로" question="내일의 나에게 넘길 건 뭐예요?" hint="적어두면, 오늘은 놓아도 돼요">
        <textarea className={taCls} rows={2} value={carryOver} onChange={(e) => setCarryOver(e.target.value)} placeholder="예: 보고서 마무리는 내일 오전에" autoFocus />
        <button onClick={() => setPhase('close')} className="w-full py-4 rounded-full transition mt-5 text-white hover:brightness-95" style={{ background: '#7C8598' }}>
          다음
        </button>
      </StepScene>
    )

  if (phase === 'close') {
    const closeDay = () => { setClosing(true); setTimeout(() => setPhase('closed'), 700) }
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <p className="text-r-gray-soft text-xs mb-4 tracking-wide">{today}</p>
        <div
          className="w-full rounded-2xl bg-amber-soft/40 border border-amber/25 p-6 text-left mb-8"
          style={{ opacity: closing ? 0 : 1, transform: closing ? 'scale(0.94) translateY(6px)' : 'none', transition: 'opacity .6s ease, transform .6s ease' }}
        >
          <p className="text-[11px] tracking-[0.12em] text-amber mb-1">오늘</p>
          <p className="text-ink text-[15px] mb-4 leading-relaxed">{done}</p>
          {carryOver.trim() && <>
            <p className="text-[11px] tracking-[0.12em] text-amber mb-1">내일로</p>
            <p className="text-r-gray text-[14px] leading-relaxed">{carryOver}</p>
          </>}
        </div>
        {!closing && (
          <button onClick={closeDay} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
            오늘을 닫기
          </button>
        )}
      </div>
    )
  }

  if (phase === 'closed')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>오늘은 여기까지.<br />잘 닫혔어요.</p>
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
