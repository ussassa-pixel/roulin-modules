import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import pool from '../content/musicPool.json'

// 노래 한 곡 (v4.1 music_pick) — 기분 상승(uplift) 도구형.
// ISO 원리: 지금 기분에서 출발하는 곡을 골라 살짝 끌어올린다(급점프 지양 — 풀에 인코딩됨).
//
// ⚖️ 저작권 경계 (코드리뷰 항목 — 위반 시 출시 불가):
//  1. 재생 금지: 앱 내 스트리밍·음원 재생 없음. 외부 검색 딥링크로만.
//  2. 가사 표시 금지: 한 줄도 인용하지 않음.
//  3. 앨범아트 미사용: 곡명·아티스트 텍스트만.
//  4. 곡명·아티스트 표기 + 링크아웃은 문제 없음.
//
// 저장 없음 — 세션 내 중복 방지만(ref). EndRating 없음(기분 측정이 결을 깸,
// 링크로 이탈하는 흐름과도 안 맞음). 재진입은 그냥 새 시작.
const MOODS = [
  { key: '처짐', label: '처지고 무기력', hint: '기운이 바닥에 가라앉은 날' },
  { key: '답답', label: '답답하고 갑갑', hint: '뭔가 뻥 뚫고 싶은 날' },
  { key: '곤두섬', label: '불안하고 곤두섬', hint: '신경이 바짝 서 있는 날' },
  { key: '허전', label: '그냥 좀 허전', hint: '마음 한구석이 빈 것 같은 날' },
]

const searchLinks = (song) => {
  const q = encodeURIComponent(`${song.title} ${song.artist}`)
  return {
    yt: `https://music.youtube.com/search?q=${q}`,
    melon: `https://www.melon.com/search/total/index.htm?q=${q}`,
    spotify: `https://open.spotify.com/search/${q}`,
  }
}

// 음표 (글래스 젬 톤)
function NoteIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M19 36 L19 12 L36 8 L36 32" fill="none" stroke="#E0A33E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="14" cy="36" rx="5.5" ry="4.5" fill="#E0A33E" />
      <ellipse cx="31" cy="32" rx="5.5" ry="4.5" fill="#E0A33E" />
    </svg>
  )
}

export default function MusicPick({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → mood → pick → close
  const [mood, setMood] = useState(null)
  const [song, setSong] = useState(null)
  const seenRef = useRef(new Set()) // 세션 내 중복 금지

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const draw = (moodKey) => {
    let candidates = pool.songs.filter((s) => s.moodFrom.includes(moodKey) && !seenRef.current.has(s.id))
    if (candidates.length === 0) {
      // 이 기분의 풀을 다 보여줬으면 처음부터 다시
      pool.songs.filter((s) => s.moodFrom.includes(moodKey)).forEach((s) => seenRef.current.delete(s.id))
      candidates = pool.songs.filter((s) => s.moodFrom.includes(moodKey))
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    seenRef.current.add(picked.id)
    return picked
  }

  const pickMood = (moodKey) => {
    setMood(moodKey)
    setSong(draw(moodKey))
    setPhase('pick')
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>노래 한 곡</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          지금 기분에 맞는 노래,<br />한 곡 골라드릴까요?
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
              onClick={() => pickMood(m.key)}
              className="roulin-card px-5 py-6 text-left hover:-translate-y-0.5 transition"
            >
              <p className="text-navy text-[16px] mb-1.5" style={{ fontWeight: 600 }}>{m.label}</p>
              <p className="text-r-gray-soft text-[12px] leading-relaxed">{m.hint}</p>
            </button>
          ))}
        </div>
      </div>
    )

  if (phase === 'pick' && song) {
    const links = searchLinks(song)
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">오늘의 한 곡</p>

        {/* 곡 카드 — 텍스트만(앨범아트·가사 없음) */}
        <div
          key={song.id}
          className="relative mx-auto w-full max-w-xs rounded-3xl overflow-hidden px-8 py-10 mb-8 animate-fade-up"
          style={{
            background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
            boxShadow: '0 26px 52px rgba(17,35,56,0.16), 0 5px 14px rgba(17,35,56,0.08)',
          }}
        >
          <span className="absolute inset-[8px] rounded-[20px] border border-amber/35 pointer-events-none" />
          <span className="relative mx-auto flex items-center justify-center w-16 h-16 mb-4">
            <span className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(224,163,62,0.20) 0%, rgba(224,163,62,0) 72%)' }} />
            <NoteIcon className="w-9 h-9" />
          </span>
          <span className="tag-pill mb-4 inline-block">{song.moodTo}</span>
          <p className="font-serif text-[22px] text-navy leading-snug mb-1" style={{ fontWeight: 600 }}>{song.title}</p>
          <p className="text-[14px] text-r-gray mb-4">{song.artist}</p>
          <p className="text-[13px] text-r-gray-soft leading-relaxed">{song.note}</p>
        </div>

        <a
          href={links.yt}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setPhase('close')}
          className="block w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
        >
          들으러 가기
        </a>
        <div className="flex justify-center gap-5 mt-3 mb-2">
          {[['멜론', links.melon], ['스포티파이', links.spotify]].map(([name, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPhase('close')}
              className="text-[12px] text-r-gray-soft hover:text-navy underline underline-offset-4 decoration-line transition"
            >
              {name}에서 듣기
            </a>
          ))}
        </div>
        <button
          onClick={() => setSong(draw(mood))}
          className="w-full py-3 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition"
        >
          다른 곡으로
        </button>
      </div>
    )
  }

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>
          오늘은 이 곡이<br />곁에 있어요.
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        {song && <p className="text-[13px] text-r-gray mb-12">{song.title} · {song.artist}</p>}
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          들으면서 닫을게요
        </button>
      </div>
    )

  return null
}
