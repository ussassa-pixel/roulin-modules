import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { MORNING_SOUNDS, MORNING_MEDITATION, soundUrl, meditationUrl } from '../content/innerPicks'

// 오늘을 여는 소리 (부록 morning_song → 2026-07-10 A안 개편) — 아침(pre-work) 시동용.
// music_pick(지금의 소리)과 소리 풀·딥링크 규칙 공유, 진입 맥락이 다름:
//   music_pick = "지금 기분 대응"(기분 선택 단계 있음) / 이건 = "아침 시동"(선택 없이 바로 하나).
// A안: 외부 음원 검색 링크 → 우리 '소리'(calmSounds) 딥링크. 각성 급점프 지양은
// MORNING_SOUNDS 선정에 인코딩(잔잔한 자연음만). 짧은 무료 명상 1편 곁들임.
// 저장 없음(세션 내 중복만 방지). EndRating 없음.

// 떠오르는 해 (글래스 젬 톤)
function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M10 34 A14 14 0 0 1 38 34 Z" fill="#E0A33E" />
      <g stroke="#E0A33E" strokeWidth="2.4" strokeLinecap="round" opacity="0.8">
        <path d="M24 12 L24 6 M12 17 L8 13 M36 17 L40 13" />
      </g>
      <path d="M6 38 L42 38" stroke="#C88A2E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function MorningSong({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → pick → close
  const [sound, setSound] = useState(null)
  const seenRef = useRef(new Set())

  const isMorning = (() => { const h = new Date().getHours(); return h >= 5 && h < 12 })()

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const draw = () => {
    let candidates = MORNING_SOUNDS.filter((s) => !seenRef.current.has(s.id))
    if (candidates.length === 0) {
      seenRef.current.clear()
      candidates = MORNING_SOUNDS
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    seenRef.current.add(picked.id)
    return picked
  }

  const meditation = MORNING_MEDITATION

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>오늘을 여는 소리</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          {isMorning ? <>좋은 아침이에요.<br />오늘을 여는 소리, 골라드릴게요.</> : <>오늘 하루의 배경음이 될<br />소리를 골라드릴게요.</>}
        </p>
        <button
          onClick={() => { setSound(draw()); setPhase('pick') }}
          className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
        >
          골라주세요
        </button>
      </div>
    )

  if (phase === 'pick' && sound)
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">오늘의 시작 소리</p>

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
            <SunIcon className="w-9 h-9" />
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
          아침 명상으로 시작하고 싶다면 — {meditation.title}
        </a>
        <button onClick={() => setSound(draw())} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          다른 소리로
        </button>
      </div>
    )

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>
          오늘, 이 소리와 함께<br />시작해요.
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        {sound && <p className="text-[13px] text-r-gray mb-12">{sound.title} · {sound.subtitle}</p>}
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          들으면서 시작할게요
        </button>
      </div>
    )

  return null
}
