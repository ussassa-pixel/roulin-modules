import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 머릿속 비우기 → 범주 분류 — 인지적 오프로딩 + 표현적 글쓰기.
const DOMAINS = ['일', '관계', '가족', '건강', '경제', '자아실현', '나']
// 머릿속 지도에서 각 범주가 놓일 자리 (viewBox 340×212)
const SLOT = {
  '일': [82, 64], '관계': [206, 54], '나': [292, 90],
  '경제': [62, 150], '가족': [152, 112], '건강': [254, 150], '자아실현': [154, 186],
}
const taCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'

export default function BrainDump({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [raw, setRaw] = useState('')
  const [items, setItems] = useState([])
  const [assign, setAssign] = useState({})

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative">{inner}</div>
    </ModuleFrame>
  )

  const startSort = () => {
    const parsed = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!parsed.length) return
    setItems(parsed); setAssign({}); setPhase('sort')
  }
  const allAssigned = items.length > 0 && items.every((_, i) => assign[i])

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up relative z-10">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>머릿속 비우기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-10 leading-relaxed">
          머릿속에 떠다니는 것들을<br />한번 꺼내서 정리해볼게요.
        </p>
        <div className="flex justify-center mb-12"><MindIcon /></div>
        <button onClick={() => setPhase('dump')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'dump')
    return page(
      <div className="max-w-md w-full animate-fade-in relative z-10">
        <p className="text-center text-navy text-lg font-light mb-2">지금 머릿속에 뭐가 있나요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">한 줄에 하나씩, 떠오르는 대로</p>
        <textarea className={taCls} rows={7} value={raw} onChange={(e) => setRaw(e.target.value)}
          placeholder={'예)\n보고서 마감\n엄마 병원 예약\n카드값\n운동 다시 시작'} autoFocus />
        <button onClick={startSort} disabled={!raw.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${raw.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}>
          정리하기
        </button>
      </div>
    )

  if (phase === 'sort')
    return page(
      <div className="max-w-md w-full animate-fade-in relative z-10">
        <p className="text-center text-navy text-lg font-light mb-2">각각 어디에 속할까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-6">항목마다 한 곳을 골라주세요</p>
        <div className="space-y-3 mb-6 max-h-[52vh] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white border border-line p-4">
              <p className="text-ink text-[14px] mb-3 leading-relaxed">{item}</p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button key={d} onClick={() => setAssign((p) => ({ ...p, [i]: d }))}
                    className={`px-3 py-1.5 rounded-full text-[13px] transition border ${
                      assign[i] === d ? 'bg-amber-soft text-[#9A6B1E] border-amber/40' : 'bg-cream text-r-gray border-line hover:border-[#DCD5C4]'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => allAssigned && setPhase('overview')} disabled={!allAssigned}
          className={`w-full py-4 rounded-full transition ${allAssigned ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}>
          {allAssigned ? '머릿속 지도 보기' : '전부 배정하면 넘어가요'}
        </button>
      </div>
    )

  if (phase === 'overview') {
    const grouped = DOMAINS.map((d) => ({ d, list: items.filter((_, i) => assign[i] === d) })).filter((g) => g.list.length)
    return page(
      <div className="max-w-md w-full animate-fade-up relative z-10">
        <p className="text-center text-r-gray-soft text-xs mb-2 tracking-wide">정리된 머릿속</p>
        <MindMap grouped={grouped} />
        <div className="space-y-3 my-6 max-h-[34vh] overflow-y-auto pr-1">
          {grouped.map(({ d, list }) => (
            <div key={d} className="rounded-2xl bg-amber-soft/40 border border-amber/25 p-4 text-left">
              <p className="text-[11px] tracking-[0.12em] text-amber mb-1.5">{d} · {list.length}</p>
              {list.map((it, i) => <p key={i} className="text-ink text-[14px] leading-relaxed">· {it}</p>)}
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

// 정리된 머릿속 — 범주별 버블(크기=개수)이 머릿속 공간에 순차로 자리잡음
function MindMap({ grouped }) {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 60); return () => clearTimeout(t) }, [])
  const max = Math.max(1, ...grouped.map((g) => g.list.length))
  return (
    <svg width="100%" viewBox="0 0 340 212" className="mb-1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mind-space" cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#FBF3DF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F5F3EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 머릿속 공간(둥근 이마 실루엣) */}
      <path d="M 60 150 Q 40 70, 120 42 Q 200 18, 270 55 Q 315 80, 300 140 Q 292 172, 250 182 L 90 182 Q 62 176, 60 150 Z"
        fill="url(#mind-space)" stroke="#E7E2D5" strokeWidth="1.5" />
      {grouped.map((g, i) => {
        const [cx, cy] = SLOT[g.d] || [170, 106]
        const r = 17 + Math.min(4, g.list.length / max * 4) * 5.5
        return (
          <g key={g.d} style={{ opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(8px)', transition: `opacity .5s ease ${i * 110}ms, transform .5s ease ${i * 110}ms` }}>
            <circle cx={cx} cy={cy} r={r} fill="#F3E7CC" stroke="#E0A33E" strokeOpacity="0.5" strokeWidth="1.2" />
            <text x={cx} y={cy - 1} textAnchor="middle" fontSize="12" fontWeight="600" fill="#112338">{g.d}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9A6B1E">{g.list.length}</text>
          </g>
        )
      })}
    </svg>
  )
}

// 머릿속을 뜻하는 아이콘 — 떠다니는 생각들이 든 머리
function MindIcon() {
  const dots = [[40, 34, 2.4], [58, 24, 1.8], [30, 52, 1.6], [66, 46, 2.0], [48, 44, 1.4], [72, 62, 1.6]]
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mi-halo" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#E0A33E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E0A33E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="52" cy="50" r="50" fill="url(#mi-halo)" />
      {/* 머리 옆모습 */}
      <path d="M 30 82 Q 18 56, 34 38 Q 50 20, 74 30 Q 90 38, 86 58 Q 84 70, 74 72 Q 72 82, 66 82 L 66 90 L 44 90 L 44 82 Z"
        fill="#fff" stroke="#c9c2b2" strokeWidth="1.6" strokeLinejoin="round" />
      {/* 떠다니는 생각 점 */}
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x + 6} cy={y} r={r} fill="#E0A33E" opacity={0.5 + (i % 3) * 0.15}
          className="animate-breath" style={{ animationDuration: `${5 + i}s`, transformOrigin: `${x + 6}px ${y}px` }} />
      ))}
    </svg>
  )
}
