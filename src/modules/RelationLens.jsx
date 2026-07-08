import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import StepScene from '../components/StepScene'

// 관계 렌즈 — 조망 수용 + 욕구 명료화(DBT 대인 효율성의 사전 단계).
// 말하기 연습(역할극)이 아니라 관점·욕구 정리. 상대 마음을 '맞히는' 게 아님(독심 조장 금지).
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

const STEPS = [
  { key: 'person', icon: 'person', accent: '#E0A33E', label: '상대', q: '누구와의 일이에요?', hint: "이름 대신 '동료', '엄마'처럼 적어도 돼요.", type: 'input', ph: '예: 팀장님' },
  { key: 'situation', icon: 'scene', accent: '#EDB24A', label: '상황', q: '어떤 일이 있었어요?', hint: '짧게, 한 장면이면 돼요.', type: 'area', ph: '그때의 한 장면을 적어봐요' },
  { key: 'myFeeling', icon: 'heart', accent: '#E0908C', label: '내 마음', q: '그때 나는 어땠어요?', hint: '떠오르는 대로.', type: 'input', ph: '예: 서운했어요' },
  { key: 'theirView', icon: 'eye', accent: '#7C8598', label: '그 사람 자리', q: '잠깐 그 사람 자리에 서 본다면,\n그 사람에겐 어떤 사정이 있었을까요?', hint: '맞히지 않아도 돼요. 그냥 상상만.', type: 'area', ph: '상상해서 적어봐요' },
  { key: 'myWant', icon: 'target', accent: '#3E6E8E', label: '내가 원하는 것', q: '이 관계에서 내가 정말 원하는 건\n뭘까요?', hint: '한 줄이면 충분해요.', type: 'input', ph: '예: 존중받고 싶어요' },
]

export default function RelationLens({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [step, setStep] = useState(0)
  const [v, setV] = useState({})

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )
  const set = (key, val) => setV((p) => ({ ...p, [key]: val }))

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>관계 렌즈</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          마음에 걸리는 사람이 있나요?<br />잠깐 그 관계를 들여다볼게요.
        </p>
        <button onClick={() => { setStep(0); setPhase('step') }} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'step') {
    const cur = STEPS[step]
    const val = v[cur.key] || ''
    const next = () => {
      if (!val.trim()) return
      if (step < STEPS.length - 1) setStep(step + 1)
      else setPhase('summary')
    }
    return page(
      <StepScene key={step} total={STEPS.length} index={step} accent={cur.accent} icon={cur.icon} label={cur.label} question={cur.q} hint={cur.hint}>
        {cur.type === 'area' ? (
          <textarea className={taCls} rows={3} value={val} onChange={(e) => set(cur.key, e.target.value)} placeholder={cur.ph} autoFocus />
        ) : (
          <input className={inputCls} value={val} onChange={(e) => set(cur.key, e.target.value)} placeholder={cur.ph} autoFocus />
        )}
        <button
          onClick={next}
          disabled={!val.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${val.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={val.trim() ? { background: cur.accent } : {}}
        >
          {step < STEPS.length - 1 ? '다음' : '정리 보기'}
        </button>
      </StepScene>
    )
  }

  if (phase === 'summary')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="text-r-gray-soft text-xs mb-6 tracking-wide">오늘 들여다본 것</p>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left space-y-4">
          <div><p className="text-[11px] tracking-[0.12em] text-amber mb-1">상대</p><p className="text-ink text-[14px]">{v.person}</p></div>
          <div><p className="text-[11px] tracking-[0.12em] text-amber mb-1">내 마음</p><p className="text-ink text-[14px]">{v.myFeeling}</p></div>
          <div><p className="text-[11px] tracking-[0.12em] text-amber mb-1">내가 원하는 것</p><p className="text-navy font-serif text-[16px] leading-relaxed" style={{ fontWeight: 600 }}>{v.myWant}</p></div>
        </div>
        <p className="text-[13px] text-r-gray mb-10">여기까지예요. 오늘은 들여다본 것만으로 충분해요.</p>
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
