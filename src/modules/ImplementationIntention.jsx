import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import StepScene from '../components/StepScene'

// 실행의도 (If-Then 계획) — Gollwitzer, 1999. cue 구체성이 핵심 레버.
// 장애물 처리는 의도적으로 제외(=WOOP 담당). 순수 if-then 유지.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

export default function ImplementationIntention({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [behavior, setBehavior] = useState('')
  const [cue, setCue] = useState('')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>실행 의도</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
              마음은 먹었는데<br />자꾸 미루게 되는 일이 있나요?
            </p>
            <button onClick={() => setPhase('behavior')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'behavior') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <StepScene key={phase} total={2} index={0} accent="#E0A33E" icon="action" label="행동" question="어떤 행동을 해보고 싶어요?" hint="작고 구체적일수록 좋아요">
            <input
              className={inputCls}
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              placeholder="예: 책상에 앉아 한 문단 쓰기"
              autoFocus
            />
            <button
              onClick={() => behavior.trim() && setPhase('cue')}
              disabled={!behavior.trim()}
              className={`w-full py-4 rounded-full transition mt-5 ${behavior.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
              style={behavior.trim() ? { background: '#E0A33E' } : {}}
            >
              다음
            </button>
          </StepScene>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'cue') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <StepScene key={phase} total={2} index={1} accent="#3E6E8E" icon="clock" label="언제 · 어디서" question="그걸 언제, 어디서 할까요?" hint="때 · 장소 · 계기를 정해두면 덜 미뤄져요">
            <input
              className={inputCls}
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="예: 저녁 먹고 설거지를 끝낸 직후, 책상에서"
              autoFocus
            />
            <button
              onClick={() => cue.trim() && setPhase('assemble')}
              disabled={!cue.trim()}
              className={`w-full py-4 rounded-full transition mt-5 ${cue.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
              style={cue.trim() ? { background: '#3E6E8E' } : {}}
            >
              다음
            </button>
          </StepScene>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'assemble') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div key={phase} className="max-w-md w-full text-center animate-fade-up">
            <p className="text-r-gray-soft text-xs mb-6 tracking-wide">나의 실행 의도</p>
            <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left leading-relaxed">
              <p className="text-navy font-serif text-[17px]" style={{ fontWeight: 600 }}>
                만약 <span className="text-[#9A6B1E]">{cue}</span>,
              </p>
              <p className="text-navy font-serif text-[17px] mt-2" style={{ fontWeight: 600 }}>
                그러면 <span className="text-[#9A6B1E]">{behavior}</span>.
              </p>
            </div>
            <p className="text-[13px] text-r-gray mb-10">한 번 소리 내어 천천히 읽어보세요.</p>
            <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              마무리
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'rating') {
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )
  }

  return null
}
