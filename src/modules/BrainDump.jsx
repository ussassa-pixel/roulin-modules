import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 머릿속 비우기 → 5도메인 분류 — 인지적 오프로딩 + 표현적 글쓰기.
const DOMAINS = ['일', '가족', '관계', '건강', '자기']
const taCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'

export default function BrainDump({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [raw, setRaw] = useState('')
  const [items, setItems] = useState([])
  const [assign, setAssign] = useState({}) // { itemIndex: domain }

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const startSort = () => {
    const parsed = raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!parsed.length) return
    setItems(parsed)
    setAssign({})
    setPhase('sort')
  }

  const allAssigned = items.length > 0 && items.every((_, i) => assign[i])

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>머릿속 비우기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          머릿속에 떠다니는 것들을<br />한번 꺼내서 정리해볼게요.
        </p>
        <button onClick={() => setPhase('dump')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'dump')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 머릿속에 뭐가 있나요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">한 줄에 하나씩, 떠오르는 대로</p>
        <textarea
          className={taCls}
          rows={7}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={'예)\n보고서 마감\n엄마 병원 예약\n운동 다시 시작'}
          autoFocus
        />
        <button
          onClick={startSort}
          disabled={!raw.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${raw.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          정리하기
        </button>
      </div>
    )

  if (phase === 'sort')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">각각 어디에 속할까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-6">항목마다 한 곳을 골라주세요</p>
        <div className="space-y-3 mb-6 max-h-[52vh] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-white border border-line p-4">
              <p className="text-ink text-[14px] mb-3 leading-relaxed">{item}</p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setAssign((p) => ({ ...p, [i]: d }))}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] transition border ${
                      assign[i] === d
                        ? 'bg-amber-soft text-[#9A6B1E] border-amber/40'
                        : 'bg-cream text-r-gray border-line hover:border-[#DCD5C4]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => allAssigned && setPhase('overview')}
          disabled={!allAssigned}
          className={`w-full py-4 rounded-full transition ${allAssigned ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          {allAssigned ? '한눈에 보기' : '전부 배정하면 넘어가요'}
        </button>
      </div>
    )

  if (phase === 'overview') {
    const grouped = DOMAINS.map((d) => ({ d, list: items.filter((_, i) => assign[i] === d) })).filter((g) => g.list.length)
    return page(
      <div className="max-w-md w-full animate-fade-up">
        <p className="text-center text-r-gray-soft text-xs mb-6 tracking-wide">정리된 머릿속</p>
        <div className="space-y-4 mb-8 max-h-[58vh] overflow-y-auto pr-1">
          {grouped.map(({ d, list }) => (
            <div key={d} className="rounded-2xl bg-amber-soft/40 border border-amber/25 p-5 text-left">
              <p className="text-[11px] tracking-[0.12em] text-amber mb-2">{d}</p>
              {list.map((it, i) => (
                <p key={i} className="text-ink text-[14px] leading-relaxed">· {it}</p>
              ))}
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
