import { useState } from 'react'
import { CHIPS, recommendForChip, CATEGORIES, modulesForCategory } from '../recommendation/checkin'
import { getCareLog } from '../lib/careLog'

// 경로 C "지금 어때요?" 진입 UI (recommender 스펙 §3).
// 규칙만으로 동작(LLM 없음). 절대 규칙: 1~2개만 · 거절 동등 노출 ·
// 위기 표현은 칩에 없음 — "많이 힘들다면"은 추천 엔진과 분리된 상시 링크.
// 시각 결: 리추얼 카드(위로 뽑기 공개면)와 같은 크림 그라데이션 + 골드 프레임.
// props: { modules(App MODULES — 표시용), onPick(id), onClose() }

// 크림 카드 공통(위로 뽑기 공개 카드와 동일 계열)
const CARD_BG = 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)'
const CARD_SHADOW = '0 18px 40px rgba(17,35,56,0.12), 0 4px 10px rgba(17,35,56,0.06)'

function Spark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" />
    </svg>
  )
}

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
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(ellipse at 50% 28%, #FBF9F1 0%, #F5F3EB 70%)' }}>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-[11px] tracking-wider font-light text-[#A8A294] hover:text-navy transition"
      >
        닫기
      </button>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">{inner}</div>
    </div>
  )

  // 골드 프레임 크림 카드 — 추천/카테고리 공용
  const premiumCard = (onClick, inner, key) => (
    <button
      key={key}
      onClick={onClick}
      className="relative w-full text-left px-7 py-6 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(17,35,56,0.14)]"
      style={{ background: CARD_BG, boxShadow: CARD_SHADOW }}
    >
      <span className="absolute inset-[7px] rounded-[18px] border border-amber/30 pointer-events-none" />
      <span className="relative block">{inner}</span>
    </button>
  )

  const moduleCard = (id) => {
    const m = byId(id)
    if (!m) return null
    return premiumCard(
      () => onPick(id),
      <>
        <span className="flex items-center justify-between mb-2">
          <span className="text-navy" style={{ fontWeight: 600, fontSize: '17px' }}>{m.title}</span>
          <span className="tag-pill">{m.tag}</span>
        </span>
        <span className="block text-r-gray leading-relaxed" style={{ fontSize: '13px' }}>{m.desc}</span>
      </>,
      id
    )
  }

  if (phase === 'chips')
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <Spark className="w-5 h-5 text-amber mx-auto mb-4 drop-shadow-[0_0_6px_rgba(224,163,62,0.5)]" />
        <p className="font-serif text-[26px] text-navy mb-3 leading-snug" style={{ fontWeight: 600 }}>
          지금 마음이<br />어때요?
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-3" />
        <p className="text-[12px] text-r-gray-soft mb-9">정답은 없어요. 가까운 걸 하나만 골라봐요.</p>

        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => pickChip(c.key)}
              className="py-4 px-3 rounded-2xl bg-white/90 border border-line text-ink text-[14px]
                         transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/40
                         hover:shadow-[0_10px_24px_rgba(17,35,56,0.08)]"
              style={{ boxShadow: '0 2px 8px rgba(17,35,56,0.04)' }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPhase('browse')}
          className="w-full py-4 rounded-2xl bg-white/70 border border-line text-r-gray text-[14px]
                     transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DCD5C4] hover:text-navy
                     hover:shadow-[0_10px_24px_rgba(17,35,56,0.07)] mb-10"
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
        <p className="text-[13px] text-r-gray mb-2">{result.reason}</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />

        <div className="space-y-3.5 mb-3.5 text-left">
          {(result.candidates || []).map((c) => moduleCard(c.id))}
          {/* 거절 — 추천 카드와 동등 노출(같은 크기·같은 자리) */}
          <button
            onClick={onClose}
            className="w-full px-7 py-6 rounded-3xl bg-white/80 border border-line text-center text-r-gray text-[14px]
                       transition-all duration-300 hover:-translate-y-1 hover:border-[#DCD5C4] hover:shadow-[0_14px_30px_rgba(17,35,56,0.07)]"
          >
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
        <p className="eyebrow mb-2">천천히 둘러봐요</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />
        <div className="space-y-3.5 text-left">
          {CATEGORIES.map((cat) =>
            premiumCard(
              () => { setCategory(cat); setPhase('browseCat') },
              <span className="flex items-center justify-between">
                <span className="text-navy" style={{ fontWeight: 600, fontSize: '16px' }}>{cat.label}</span>
                <span className="text-r-gray-soft text-[12px]">{cat.desc}</span>
              </span>,
              cat.key
            )
          )}
          {/* 갈래 없이 전부 보고 싶은 사람의 출구 — 런처(전체 목록)로 */}
          {premiumCard(
            onClose,
            <span className="flex items-center justify-between">
              <span className="text-navy" style={{ fontWeight: 600, fontSize: '16px' }}>전체 목록</span>
              <span className="text-r-gray-soft text-[12px]">갈래 없이, 전부 천천히</span>
            </span>,
            'all'
          )}
        </div>
        <button onClick={() => setPhase('chips')} className="mt-8 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          돌아가기
        </button>
      </div>
    )

  if (phase === 'browseCat' && category)
    return frame(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-2">{category.label} · {category.desc}</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />
        <div className="space-y-3.5 text-left max-h-[60vh] overflow-y-auto pr-1">
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
        <div className="space-y-3.5 mb-10 text-left">
          <a href="tel:109" className="relative block w-full px-7 py-6 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ background: CARD_BG, boxShadow: CARD_SHADOW }}>
            <span className="absolute inset-[7px] rounded-[18px] border border-amber/30 pointer-events-none" />
            <p className="relative text-navy text-[17px] mb-1" style={{ fontWeight: 600 }}>자살예방 상담전화 <span className="text-amber">109</span></p>
            <p className="relative text-r-gray-soft text-[12px]">24시간 · 전화 한 통이면 연결돼요</p>
          </a>
          <a href="tel:1577-0199" className="relative block w-full px-7 py-6 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ background: CARD_BG, boxShadow: CARD_SHADOW }}>
            <span className="absolute inset-[7px] rounded-[18px] border border-amber/30 pointer-events-none" />
            <p className="relative text-navy text-[17px] mb-1" style={{ fontWeight: 600 }}>정신건강 위기상담 <span className="text-amber">1577-0199</span></p>
            <p className="relative text-r-gray-soft text-[12px]">24시간 · 마음이 급할 때 언제든</p>
          </a>
        </div>
        <button onClick={() => setPhase('chips')} className="text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          돌아가기
        </button>
      </div>
    )

  return null
}
