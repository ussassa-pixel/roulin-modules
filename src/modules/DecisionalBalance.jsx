import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 결정 저울(2×2) — Janis & Mann(1977) / 동기강화상담 양가감정. 가중치/점수화는 후순위.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const cellCls =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink text-[14px] outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'

const CELLS = [
  { key: 'doPro', label: '할 때 좋은 점', ph: '얻게 되는 것' },
  { key: 'doCon', label: '할 때 걱정되는 점', ph: '치러야 하는 것' },
  { key: 'notPro', label: '안 할 때 좋은 점', ph: '지킬 수 있는 것' },
  { key: 'notCon', label: '안 할 때 아쉬운 점', ph: '놓치게 되는 것' },
]

export default function DecisionalBalance({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [decision, setDecision] = useState('')
  const [grid, setGrid] = useState({ doPro: '', doCon: '', notPro: '', notCon: '' })

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const filledCount = Object.values(grid).filter((v) => v.trim()).length

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>결정 저울</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          마음이 양쪽으로 기울 때,<br />저울에 가만히 올려볼게요.
        </p>
        <button onClick={() => setPhase('decision')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'decision')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">무엇을 두고 고민 중이에요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">‘~할지 말지’ 형태로</p>
        <input className={inputCls} value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="예: 지금 이직을 할지 말지" autoFocus />
        <button
          onClick={() => decision.trim() && setPhase('grid')}
          disabled={!decision.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${decision.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'grid')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-[15px] font-light mb-1 leading-relaxed">{decision}</p>
        <p className="text-center text-r-gray-soft text-xs mb-6">떠오르는 만큼만 적어도 돼요</p>
        <div className="space-y-3 mb-6">
          {CELLS.map(({ key, label, ph }) => (
            <div key={key}>
              <label className="block text-[12px] text-amber mb-1.5 ml-1">{label}</label>
              <textarea className={cellCls} rows={2} value={grid[key]} onChange={(e) => setGrid((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} />
            </div>
          ))}
        </div>
        <button
          onClick={() => filledCount > 0 && setPhase('review')}
          disabled={filledCount === 0}
          className={`w-full py-4 rounded-full transition ${filledCount > 0 ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          저울 보기
        </button>
      </div>
    )

  if (phase === 'review')
    return page(
      <div className="max-w-md w-full animate-fade-up">
        <p className="text-center text-r-gray-soft text-xs mb-6 tracking-wide">{decision}</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {CELLS.map(({ key, label }) => (
            <div key={key} className="rounded-2xl bg-amber-soft/40 border border-amber/25 p-4 text-left min-h-[88px]">
              <p className="text-[10px] tracking-[0.1em] text-amber mb-1.5 leading-snug">{label}</p>
              <p className="text-ink text-[13px] leading-relaxed whitespace-pre-line">{grid[key].trim() || '—'}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-navy text-[15px] font-light mb-6">지금 마음은 어느 쪽으로 기울어요?</p>
        <div className="space-y-3">
          <button onClick={() => setPhase('rating')} className="w-full py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">조금은 정해진 것 같아요</button>
          <button onClick={() => setPhase('rating')} className="w-full py-3.5 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">아직 더 두고 볼래요</button>
        </div>
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
