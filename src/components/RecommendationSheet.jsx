import { useMemo } from 'react'
import { getRecommendations } from '../modules/registry'

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RecommendationSheet({ completedModuleId, allModules, onPick, onShowAll }) {
  const recs = useMemo(
    () => getRecommendations(completedModuleId, allModules),
    [completedModuleId, allModules]
  )

  return (
    <div className="min-h-screen bg-cream flex flex-col animate-fade-in">
      <div className="max-w-md mx-auto w-full px-6 pt-16 pb-8 text-center">
        <p className="font-serif text-[26px] text-navy leading-snug mb-3" style={{ fontWeight: 600 }}>
          이어서<br />해볼까요?
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-r-gray leading-relaxed" style={{ fontSize: '14px' }}>
          지금 마음에 가까운 것을 하나 더 골라보세요.
        </p>
      </div>

      <div className="max-w-md mx-auto w-full px-6 flex-1">
        <div className="space-y-3">
          {recs.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="roulin-card w-full text-left px-6 py-5 block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tag-pill">{m.tag}</span>
              </div>
              <div className="text-navy mb-1.5" style={{ fontWeight: 600, fontSize: '18px' }}>{m.title}</div>
              <div className="text-r-gray leading-relaxed" style={{ fontSize: '13.5px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 py-10 text-center">
        <button
          onClick={onShowAll}
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white text-navy border border-line text-[14px] hover:bg-white/60 transition"
          style={{ fontWeight: 500 }}
        >
          <HomeIcon /> 처음으로 · 전체 목록
        </button>
      </div>
    </div>
  )
}
