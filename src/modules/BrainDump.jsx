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
  // assign: { itemIndex: [범주, ...] } — 하나의 생각이 여러 범주에 걸칠 수 있다
  const toggleDomain = (i, d) =>
    setAssign((p) => {
      const cur = p[i] || []
      return { ...p, [i]: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] }
    })
  const allAssigned = items.length > 0 && items.every((_, i) => (assign[i] || []).length > 0)

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
        <p className="text-center text-r-gray-soft text-xs mb-6">해당되는 곳을 모두 골라주세요 — 여러 곳에 걸쳐도 괜찮아요</p>
        <div className="space-y-3 mb-6 max-h-[52vh] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white border border-line p-4">
              <p className="text-ink text-[14px] mb-3 leading-relaxed">{item}</p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button key={d} onClick={() => toggleDomain(i, d)}
                    className={`px-3 py-1.5 rounded-full text-[13px] transition border ${
                      (assign[i] || []).includes(d) ? 'bg-amber-soft text-[#9A6B1E] border-amber/40' : 'bg-cream text-r-gray border-line hover:border-[#DCD5C4]'
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
    const grouped = DOMAINS
      .map((d) => ({ d, list: items.filter((_, i) => (assign[i] || []).includes(d)) }))
      .filter((g) => g.list.length)
    // 범주 쌍별 공유 항목 수 — 지도에서 겹침 정도를 정한다
    const shared = {}
    items.forEach((_, i) => {
      const ds = assign[i] || []
      for (let a = 0; a < ds.length; a++)
        for (let b = a + 1; b < ds.length; b++) {
          const key = [ds[a], ds[b]].sort().join('|')
          shared[key] = (shared[key] || 0) + 1
        }
    })
    return page(
      <div className="max-w-md w-full animate-fade-up relative z-10">
        <p className="text-center text-r-gray-soft text-xs mb-2 tracking-wide">정리된 머릿속</p>
        <MindMap grouped={grouped} shared={shared} />
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

// 정리된 머릿속 — 범주별 버블(크기=개수). 공유 항목이 있는 범주끼리는
// 서로 겹치도록 끌어당겨 벤다이어그램처럼 보인다(반투명이라 겹친 부분이 진해짐).
function MindMap({ grouped, shared = {} }) {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 60); return () => clearTimeout(t) }, [])
  const max = Math.max(1, ...grouped.map((g) => g.list.length))

  const rOf = {}
  const pos = {}
  grouped.forEach((g) => {
    rOf[g.d] = 17 + Math.min(4, g.list.length / max * 4) * 5.5
    const [x, y] = SLOT[g.d] || [170, 106]
    pos[g.d] = { x, y }
  })

  // 완화 배치: 공유 쌍은 목표 거리(합보다 짧게)로 당기고, 무관한 쌍은 떨어뜨린다
  for (let iter = 0; iter < 60; iter++) {
    for (let a = 0; a < grouped.length; a++)
      for (let b = a + 1; b < grouped.length; b++) {
        const da = grouped[a].d, db = grouped[b].d
        const s = shared[[da, db].sort().join('|')] || 0
        const A = pos[da], B = pos[db]
        const dx = B.x - A.x, dy = B.y - A.y
        const dist = Math.hypot(dx, dy) || 1
        const sum = rOf[da] + rOf[db]
        const target = s > 0 ? sum * (0.8 - Math.min(0.18, s * 0.06)) : Math.max(dist, sum + 6)
        if (Math.abs(dist - target) < 0.5) continue
        const k = 0.25 * ((dist - target) / dist)
        A.x += dx * k; A.y += dy * k
        B.x -= dx * k; B.y -= dy * k
      }
    grouped.forEach((g) => {
      const p = pos[g.d], r = rOf[g.d]
      p.x = Math.min(298 - r * 0.35, Math.max(64 + r * 0.35, p.x))
      p.y = Math.min(176 - r * 0.45, Math.max(48 + r * 0.45, p.y))
    })
  }

  const bySize = [...grouped].sort((a, b) => rOf[b.d] - rOf[a.d])
  const sharedPairs = grouped.flatMap((ga, ai) =>
    grouped.slice(ai + 1).map((gb) => ({ a: ga.d, b: gb.d, s: shared[[ga.d, gb.d].sort().join('|')] || 0 })).filter((p) => p.s > 0)
  )

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
      {/* 원(큰 것부터) — 반투명 multiply라 겹친 부분이 진해진다 */}
      {bySize.map((g, i) => (
        <circle key={g.d} cx={pos[g.d].x} cy={pos[g.d].y} r={rOf[g.d]}
          fill="#EBD9AE" fillOpacity="0.55" stroke="#E0A33E" strokeOpacity="0.5" strokeWidth="1.2"
          style={{ mixBlendMode: 'multiply', opacity: shown ? 1 : 0, transition: `opacity .5s ease ${i * 110}ms` }} />
      ))}
      {/* 겹친 자리의 공유 개수 */}
      {sharedPairs.map(({ a, b, s }) => (
        <text key={a + b} x={(pos[a].x + pos[b].x) / 2} y={(pos[a].y + pos[b].y) / 2 + 3}
          textAnchor="middle" fontSize="9" fill="#9A6B1E"
          style={{ opacity: shown ? 1 : 0, transition: 'opacity .6s ease .5s' }}>
          함께 {s}
        </text>
      ))}
      {/* 라벨은 항상 원 위에 */}
      {grouped.map((g, i) => (
        <g key={g.d} style={{ opacity: shown ? 1 : 0, transition: `opacity .5s ease ${i * 110}ms` }}>
          <text x={pos[g.d].x} y={pos[g.d].y - 1} textAnchor="middle" fontSize="12" fontWeight="600" fill="#112338">{g.d}</text>
          <text x={pos[g.d].x} y={pos[g.d].y + 12} textAnchor="middle" fontSize="10" fill="#9A6B1E">{g.list.length}</text>
        </g>
      ))}
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
