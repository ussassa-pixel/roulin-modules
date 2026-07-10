import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { SOUNDS_BY_MOOD, FREE_MEDITATIONS, soundUrl, meditationUrl } from '../content/innerPicks'

// 지금의 소리 (v4.1 music_pick → 2026-07-10 A안 개편) — 기분 전환(uplift) 도구형.
// ISO 원리: 지금 기분에서 출발하는 소리를 골라 살짝 끌어올린다(급점프 지양 — 매핑에 인코딩됨).
//
// A안: 외부 음원 검색 링크(멜론·스포티파이·유튜브뮤직)를 우리 '소리'(calmSounds) 딥링크로 교체.
// 상용 음원을 다루지 않으므로 기존 저작권 4규칙(재생X·가사X·앨범아트X)은 적용 대상 없음.
// 링크는 새 탭(_blank)으로 열어 모듈 흐름(close 단계)을 유지한다.
// 곁들임: 짧은 무료 명상 1편 추천(FREE_MEDITATIONS — 컨텐츠 보강 시 기분별 매핑으로 확장).
//
// 저장 없음 — 세션 내 중복 방지만(ref). EndRating 없음(기분 측정이 결을 깸,
// 링크로 이탈하는 흐름과도 안 맞음). 재진입은 그냥 새 시작.
const MOODS = [
  { key: '처짐', label: '처지고 무기력', hint: '기운이 바닥에 가라앉은 날' },
  { key: '답답', label: '답답하고 갑갑', hint: '뭔가 뻥 뚫고 싶은 날' },
  { key: '곤두섬', label: '불안하고 곤두섬', hint: '신경이 바짝 서 있는 날' },
  { key: '허전', label: '그냥 좀 허전', hint: '마음 한구석이 빈 것 같은 날' },
]

// 음파 (글래스 젬 톤)
function WaveIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g stroke="#E0A33E" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M10 20 L10 28" />
        <path d="M17 15 L17 33" />
        <path d="M24 10 L24 38" />
        <path d="M31 15 L31 33" />
        <path d="M38 20 L38 28" />
      </g>
    </svg>
  )
}

export default function MusicPick({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → mood → pick → close
  const [mood, setMood] = useState(null)
  const [sound, setSound] = useState(null)
  const seenRef = useRef(new Set()) // 세션 내 중복 금지

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const draw = (moodKey) => {
    const moodPool = SOUNDS_BY_MOOD[moodKey]
    let candidates = moodPool.filter((s) => !seenRef.current.has(s.id))
    if (candidates.length === 0) {
      // 이 기분의 풀을 다 보여줬으면 처음부터 다시
      moodPool.forEach((s) => seenRef.current.delete(s.id))
      candidates = moodPool
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    seenRef.current.add(picked.id)
    return picked
  }

  const meditation = FREE_MEDITATIONS[Math.floor(Math.random() * FREE_MEDITATIONS.length)]

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>지금의 소리</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          지금 기분에 맞는 소리,<br />하나 골라드릴까요?
        </p>
        <button onClick={() => setPhase('mood')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          골라주세요
        </button>
      </div>
    )

  if (phase === 'mood')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-2">지금은 어느 쪽에 가까워요?</p>
        <p className="text-[12px] text-r-gray-soft mb-8">정확하지 않아도 괜찮아요.</p>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMood(m.key); setSound(draw(m.key)); setPhase('pick') }}
              className="roulin-card px-5 py-6 text-left hover:-translate-y-0.5 transition"
            >
              <p className="text-navy text-[16px] mb-1.5" style={{ fontWeight: 600 }}>{m.label}</p>
              <p className="text-r-gray-soft text-[12px] leading-relaxed">{m.hint}</p>
            </button>
          ))}
        </div>
      </div>
    )

  if (phase === 'pick' && sound)
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">오늘의 소리</p>

        {/* 소리 카드 */}
        <div
          key={sound.id}
          className="relative mx-auto w-full max-w-xs rounded-3xl overflow-hidden px-8 py-10 mb-8 animate-fade-up"
          style={{
            background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
            boxShadow: '0 26px 52px rgba(17,35,56,0.16), 0 5px 14px rgba(17,35,56,0.08)',
          }}
        >
          <span className="absolute inset-[8px] rounded-[20px] border border-amber/35 pointer-events-none" />
          <span className="relative mx-auto flex items-center justify-center w-16 h-16 mb-4">
            <span className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,163,62,0.20) 0%, rgba(224,163,62,0) 72%)' }} />
            <WaveIcon className="w-9 h-9" />
          </span>
          <span className="tag-pill mb-4 inline-block">{sound.to}</span>
          <p className="font-serif text-[22px] text-navy leading-snug mb-1" style={{ fontWeight: 600 }}>{sound.title}</p>
          <p className="text-[14px] text-r-gray mb-4">{sound.subtitle}</p>
          <p className="text-[13px] text-r-gray-soft leading-relaxed">{sound.note}</p>
        </div>

        <a
          href={soundUrl(sound.id)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setPhase('close')}
          className="block w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
        >
          들으러 가기
        </a>
        <a
          href={meditationUrl(meditation.id)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setPhase('close')}
          className="block mt-3 mb-2 text-[12px] text-r-gray-soft hover:text-navy underline underline-offset-4 decoration-line transition"
        >
          짧은 무료 명상도 있어요 — {meditation.title}
        </a>
        <button
          onClick={() => setSound(draw(mood))}
          className="w-full py-3 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition"
        >
          다른 소리로
        </button>
      </div>
    )

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>
          오늘은 이 소리가<br />곁에 있어요.
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        {sound && <p className="text-[13px] text-r-gray mb-12">{sound.title} · {sound.subtitle}</p>}
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          들으면서 닫을게요
        </button>
      </div>
    )

  return null
}
