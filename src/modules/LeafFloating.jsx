import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function LeafFloating({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [currentThought, setCurrentThought] = useState('')
  const [leaves, setLeaves] = useState([])

  const releaseLeaf = () => {
    if (!currentThought.trim()) return

    const newLeaf = {
      id: Date.now(),
      text: currentThought,
      top: 30 + Math.random() * 40,
      hue: Math.random() > 0.5 ? 'emerald' : 'teal',
      rotate: -15 + Math.random() * 30,
    }
    setLeaves((prev) => [...prev, newLeaf])
    setCurrentThought('')

    setTimeout(() => {
      setLeaves((prev) => prev.filter((l) => l.id !== newLeaf.id))
    }, 12000)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-200/30 blur-3xl animate-drift" style={{ animationDelay: '6s' }} />
        </div>

        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>생각 흘려보내기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-sm text-r-gray mb-12 leading-relaxed font-light">
              떠오르는 생각을 붙잡지 않고<br />
              잎새에 얹어 강물에 띄워 보냅니다
            </p>

            <div className="flex justify-center mb-12">
              <LeafIcon />
            </div>

            <p className="text-xs text-r-gray-soft mb-6 leading-relaxed">
              생각을 없애려는 게 아닙니다.<br />
              그저 왔다가 흘러가게 두는 연습입니다.
            </p>

            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-sky-50 via-emerald-50 to-teal-100 overflow-hidden">
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-r-gray-soft hover:text-navy z-30 text-[11px] tracking-wider font-light"
        >
          나가기
        </button>

        {/* 강물 영역 */}
        <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-gradient-to-b from-teal-200/40 via-teal-300/30 to-teal-200/40 overflow-hidden">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-white/30" />
          <div className="absolute top-2/4 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-white/30" />

          {leaves.map((leaf) => (
            <div
              key={leaf.id}
              className="absolute"
              style={{
                top: `${leaf.top}%`,
                left: '-120px',
                animation: 'floatRight 12s linear forwards',
              }}
            >
              <div
                className={`px-4 py-2 rounded-full text-xs text-white shadow-md max-w-[160px] truncate ${
                  leaf.hue === 'emerald' ? 'bg-emerald-400/80' : 'bg-teal-400/80'
                }`}
                style={{ transform: `rotate(${leaf.rotate}deg)` }}
              >
                {leaf.text}
              </div>
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="max-w-md mx-auto">
            <p className="text-center text-r-gray text-sm mb-4">
              떠오른 생각을 적고, 강물에 띄워 봅니다
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') releaseLeaf() }}
                placeholder="지금 떠오르는 생각..."
                className="flex-1 p-4 bg-white/85 backdrop-blur rounded-2xl border border-line outline-none text-ink placeholder-[#A8A294]"
                autoFocus
              />
              <button
                onClick={releaseLeaf}
                disabled={!currentThought.trim()}
                className={`px-5 rounded-full transition whitespace-nowrap ${
                  currentThought.trim()
                    ? 'bg-navy text-white hover:bg-[#0c1a2b]'
                    : 'bg-line text-r-gray-soft'
                }`}
              >
                띄우기
              </button>
            </div>
            <button
              onClick={() => setPhase('done')}
              className="w-full mt-3 p-3 text-sm text-r-gray-soft hover:text-navy"
            >
              그만하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl animate-breath-slow" />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <LeafIcon />
            </div>
            <p className="font-serif text-[26px] text-navy mb-3" style={{ fontWeight: 600 }}>잘 흘려보냈어요</p>
            <p className="text-r-gray mb-12 leading-relaxed text-sm font-light">
              생각은 또 떠오를 거예요.<br />
              그때도 이렇게 흘려보내면 됩니다.
            </p>
            <button
              onClick={onExit}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              닫기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 프리미엄 글래스 잎 — 반투명 젤 질감 + 부드러운 후광, 잔잔한 잎맥
function LeafIcon() {
  const leaf = 'M 50 8 C 74 22, 76 54, 52 84 C 50 86, 50 86, 50 86 C 28 56, 26 24, 50 8 Z'
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="leaf-halo" cx="50%" cy="48%" r="52%">
          <stop offset="0%"  stopColor="#6ee7b7" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#34d399" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leaf-body" x1="30" y1="12" x2="66" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#d1fae5" />
          <stop offset="38%"  stopColor="#6ee7b7" />
          <stop offset="78%"  stopColor="#34d399" />
          <stop offset="100%" stopColor="#0f9d77" />
        </linearGradient>
        <linearGradient id="leaf-sheen" x1="38" y1="14" x2="50" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.75" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#leaf-halo)" />

      {/* 잎 본체 (반투명 글래스) */}
      <path d={leaf} fill="url(#leaf-body)" opacity="0.92" />
      {/* 좌측 면 광택 */}
      <path d="M 50 12 C 36 26, 34 52, 50 80 C 44 54, 44 30, 50 12 Z" fill="url(#leaf-sheen)" />
      {/* 외곽 림 */}
      <path d={leaf} fill="none" stroke="#0f9d77" strokeWidth="1" opacity="0.35" strokeLinejoin="round" />

      {/* 중앙맥 + 잔맥 */}
      <path d="M 50 14 C 49 40, 49 62, 50 82" stroke="#0b7d5e" strokeWidth="1.2" opacity="0.5" fill="none" strokeLinecap="round" />
      {[[30, -10], [44, -12], [58, -11], [40, 11], [54, 12], [66, 10]].map(([y, dx], i) => (
        <path key={i} d={`M 50 ${y} Q ${50 + dx * 0.6} ${y - 2}, ${50 + dx} ${y - 6}`}
          stroke="#0b7d5e" strokeWidth="0.8" opacity="0.4" fill="none" strokeLinecap="round" />
      ))}

      {/* 이슬 한 방울 */}
      <circle cx="44" cy="40" r="3.2" fill="white" opacity="0.55" />
      <circle cx="43" cy="39" r="1.1" fill="white" opacity="0.9" />
    </svg>
  )
}
