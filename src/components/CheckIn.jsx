import { useState } from 'react'
import { CHIPS, recommendForChip, CATEGORIES, modulesForCategory } from '../recommendation/checkin'
import { getCareLog } from '../lib/careLog'

// 경로 C "지금 어때요?" 진입 UI (recommender 스펙 §3).
// 규칙만으로 동작(LLM 없음). 절대 규칙: 1~2개만 · 거절 동등 노출 ·
// 위기 표현은 칩에 없음 — "많이 힘들다면"은 추천 엔진과 분리된 상시 링크.
// props: { modules(App MODULES — 표시용), onPick(id), onClose() }
export default function CheckIn({ modules, onPick, onClose }) {
  const [phase, setPhase] = useState('chips') // chips → recs | browse → browseCat | safety
  const [result, setResult] = useState(null) // { reason, candidates }
  const [category, setCategory] = useState(null)

  const byId = (id) => modules.find((m) => m.id === id)

  const pickChip = (key) => {
    const res = recommendForChip(key, { careLog: getCareLog() })
    setResult(res)
    setPhase('recs')
  }

  const frame = (inner) => (
    <div className="min-h-screen bg-cream relative">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-[11px] tracking-wider font-light text-[#A8A294] hover:text-navy transition"
      >
        닫기
      </button>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">{inner}</div>
    </div>
  )

  const moduleCard = (id, reason) => {
    const m = byId(id)
    if (!m) return null
    return (
      <button key={id} onClick={() => onPick(id)} className="roulin-card w-full text-left px-6 py-5 block">
        {reason && <p className="text-[12px] text-amber mb-2" style={{ fontWeight: 600 }}>{reason}</p>}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-navy" style={{ fontWeight: 600, fontSize: '17px' }}>{m.title}</span>
          <span className="tag-pill">{m.tag}</span>
        </div>
        <div className="text-r-gray leading-relaxed" style={{ fontSize: '13px' }}>{m.desc}</div>
      </button>
    )
  }

  if (phase === 'chips')
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[26px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
          지금 마음이<br />어때요?
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-3" />
        <p className="text-[12px] text-r-gray-soft mb-8">정답은 없어요. 가까운 걸 하나만 골라봐요.</p>

        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => pickChip(c.key)}
              className="py-4 px-3 rounded-2xl bg-white border border-line text-ink text-[14px] hover:border-[#DCD5C4] transition"
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPhase('browse')}
          className="w-full py-4 rounded-2xl bg-white border border-line text-r-gray text-[14px] hover:border-[#DCD5C4] hover:text-navy transition mb-10"
        >
          괜찮아요, 둘러볼래요
        </button>

        {/* 안전 링크 — 추천 엔진과 분리, 상시 노출 (스펙 §3) */}
        <button onClick={() => setPhase('safety')} className="text-[12px] text-r-gray-soft hover:text-navy underline underline-offset-4 decoration-line transition">
          많이 힘들다면
        </button>
      </div>
    )

  if (phase === 'recs' && result)
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-2">이런 건 어때요</p>
        <p className="text-[13px] text-r-gray mb-8">{result.reason}</p>

        <div className="space-y-3 mb-3 text-left">
          {(result.candidates || []).map((c) => moduleCard(c.id))}
          {/* 거절 — 추천 카드와 동등 노출 */}
          <button onClick={onClose} className="roulin-card w-full px-6 py-5 text-center text-r-gray text-[14px]">
            지금은 괜찮아요
          </button>
        </div>

        <button onClick={() => { setResult(null); setPhase('chips') }} className="mt-4 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          다른 상태 고르기
        </button>
      </div>
    )

  if (phase === 'browse')
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">천천히 둘러봐요</p>
        <div className="space-y-3 text-left">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat); setPhase('browseCat') }}
              className="roulin-card w-full px-6 py-5 flex items-center justify-between"
            >
              <span className="text-navy" style={{ fontWeight: 600, fontSize: '16px' }}>{cat.label}</span>
              <span className="text-r-gray-soft text-[12px]">{cat.desc}</span>
            </button>
          ))}
          {/* 갈래 없이 전부 보고 싶은 사람의 출구 — 런처(전체 목록)로 */}
          <button onClick={onClose} className="roulin-card w-full px-6 py-5 flex items-center justify-between">
            <span className="text-navy" style={{ fontWeight: 600, fontSize: '16px' }}>전체 목록</span>
            <span className="text-r-gray-soft text-[12px]">갈래 없이, 전부 천천히</span>
          </button>
        </div>
        <button onClick={() => setPhase('chips')} className="mt-8 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          돌아가기
        </button>
      </div>
    )

  if (phase === 'browseCat' && category)
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">{category.label} · {category.desc}</p>
        <div className="space-y-3 text-left max-h-[60vh] overflow-y-auto pr-1">
          {modulesForCategory(category.key).map((id) => moduleCard(id))}
        </div>
        <button onClick={() => setPhase('browse')} className="mt-8 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          다른 갈래 보기
        </button>
      </div>
    )

  if (phase === 'safety')
    return frame(
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* 문구·연결 확정은 미결(§7, SW·Chaon) — 추천 엔진과 완전 분리된 정적 안내 */}
        <p className="font-serif text-[24px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
          혼자 견디지 않아도<br />돼요.
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
        <p className="text-[14px] text-r-gray leading-relaxed mb-10">
          많이 힘든 순간에는, 지금 바로<br />사람과 이야기할 수 있어요. 24시간, 무료예요.
        </p>
        <div className="space-y-3 mb-10">
          <a href="tel:109" className="roulin-card block w-full px-6 py-5">
            <p className="text-navy text-[17px] mb-1" style={{ fontWeight: 600 }}>자살예방 상담전화 <span className="text-amber">109</span></p>
            <p className="text-r-gray-soft text-[12px]">24시간 · 전화 한 통이면 연결돼요</p>
          </a>
          <a href="tel:1577-0199" className="roulin-card block w-full px-6 py-5">
            <p className="text-navy text-[17px] mb-1" style={{ fontWeight: 600 }}>정신건강 위기상담 <span className="text-amber">1577-0199</span></p>
            <p className="text-r-gray-soft text-[12px]">24시간 · 마음이 급할 때 언제든</p>
          </a>
        </div>
        <button onClick={() => setPhase('chips')} className="text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          돌아가기
        </button>
      </div>
    )

  return null
}
