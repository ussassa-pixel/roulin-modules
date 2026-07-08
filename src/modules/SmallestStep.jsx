import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import StepScene from '../components/StepScene'

// 가장 작은 한 걸음(2분) — 착수 장벽 낮추기(tiny-step).
// 목표: 완성이 아니라 '아주 작은 시작'을 강조하고, 현실적인 때를 잡아 부담을 줄이고, 격려로 마무리.
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

  const field = ({ idx, icon, accent, label, question, hint, value, set, placeholder, onNext }) => (
    <StepScene key={idx} total={3} index={idx} accent={accent} icon={icon} label={label} question={question} hint={hint}>
      <input className={inputCls} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} autoFocus />
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        style={value.trim() ? { background: accent } : {}}
      >
        다음
      </button>
    </StepScene>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>가장 작은 한 걸음</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          막막할 땐<br />부담 없는 아주 작은 시작부터요.
        </p>
        <button onClick={() => setPhase('task')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'task')
    return page(field({
      idx: 0, icon: 'mountain', accent: '#7C8598', label: '막막한 일',
      question: '어떤 일을 해보고 싶어요?', hint: '지금 손이 안 가는 그 일',
      value: task, set: setTask, placeholder: '예: 운동하기', onNext: () => task.trim() && setPhase('shrink'),
    }))

  if (phase === 'shrink')
    return page(field({
      idx: 1, icon: 'sprout', accent: '#E0A33E', label: '아주 작은 시작',
      question: `'${task}'\n그 중에 2분 안에 시작할 수 있는\n아주 작은 동작 하나는?`,
      hint: '완성이 아니라, 정말 아주 작은 시작이면 돼요',
      value: shrink, set: setShrink, placeholder: '예: 운동복으로 갈아입기', onNext: () => shrink.trim() && setPhase('anchor'),
    }))

  if (phase === 'anchor')
    return page(field({
      idx: 2, icon: 'clock', accent: '#3E6E8E', label: '언제',
      question: '언제 시작해 보면\n더 부담이 적을까요?',
      hint: '부담이 가장 적은 때로 골라봐요',
      value: anchor, set: setAnchor, placeholder: '예: 저녁 먹고 소파에 앉기 전에', onNext: () => anchor.trim() && setPhase('review'),
    }))

  if (phase === 'review')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="text-r-gray-soft text-xs mb-6 tracking-wide">딱 이것만</p>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-6 text-left">
          <p className="text-[11px] tracking-[0.12em] text-amber mb-1">언제</p>
          <p className="text-ink text-[15px] mb-4 leading-relaxed">{anchor}</p>
          <p className="text-[11px] tracking-[0.12em] text-amber mb-1">아주 작은 시작</p>
          <p className="text-navy font-serif text-[18px] leading-relaxed" style={{ fontWeight: 600 }}>{shrink}</p>
        </div>
        <p className="text-[14px] text-navy font-light mb-1.5 leading-relaxed">이 정도면, 지금의 나도 해볼 만해요.</p>
        <p className="text-[13px] text-r-gray mb-10 leading-relaxed">한 걸음만 떼면 그다음은 자연스럽게 따라와요.<br />못 해도 괜찮아요. 시작을 떠올린 것만으로 충분해요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">해볼게요</button>
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
