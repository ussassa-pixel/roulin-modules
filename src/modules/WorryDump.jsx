import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function WorryDump({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [currentWorry, setCurrentWorry] = useState('')
  const [dumpedWorries, setDumpedWorries] = useState([])
  const [crumplingText, setCrumplingText] = useState(null)

  const handleDump = () => {
    if (!currentWorry.trim() || crumplingText) return
    const text = currentWorry
    setCrumplingText(text)
    setCurrentWorry('')
    setTimeout(() => {
      setDumpedWorries((prev) => [...prev, text])
      setCrumplingText(null)
    }, 900)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl animate-drift" style={{ animationDelay: '6s' }} />
          {[
            { x: 15, y: 18, r: 1.2 }, { x: 82, y: 12, r: 0.8 }, { x: 70, y: 30, r: 1.0 },
            { x: 25, y: 72, r: 0.9 }, { x: 88, y: 65, r: 1.1 }, { x: 45, y: 85, r: 0.7 },
            { x: 55, y: 8,  r: 1.3 }, { x: 8,  y: 50, r: 0.8 }, { x: 92, y: 38, r: 1.0 },
          ].map((s, i) => (
            <div key={i} className="absolute rounded-full animate-breath"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.r * 2}px`, height: `${s.r * 2}px`,
                background: '#a5b4fc', opacity: 0.35 + (i % 3) * 0.1,
                animationDuration: `${8 + i}s`, animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>

        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>걱정 비우기</p>
            <p className="text-sm text-r-gray mb-12 leading-relaxed font-light">
              머릿속을 맴도는 생각을 적어서<br />잠깐 내려놓고 갑니다
            </p>
            <div className="flex justify-center mb-12">
              <MoonIcon />
            </div>
            <button
              onClick={() => setPhase('writing')}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'writing') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-200/20 blur-3xl animate-breath-slow" />
          {[{ x: 16, y: 14 }, { x: 78, y: 22 }, { x: 88, y: 58 }, { x: 12, y: 68 }].map((s, i) => (
            <div key={i} className="absolute rounded-full animate-breath"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: '2px', height: '2px',
                background: '#a5b4fc', opacity: 0.4, animationDuration: `${9 + i * 2}s`, animationDelay: `${i}s` }} />
          ))}
        </div>

        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full">
            <p className="text-r-gray text-center mb-2 text-sm">지금 떠오르는 생각 하나</p>
            <p className="text-xs text-r-gray-soft text-center mb-8">
              해결하려고 쓰는 게 아닙니다. 그냥 옮겨둡니다.
            </p>

            <div className="relative mb-4">
              <textarea
                value={currentWorry}
                onChange={(e) => setCurrentWorry(e.target.value)}
                placeholder="떠오르는 대로 적어주세요..."
                style={{
                  width: '100%', padding: '20px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
                  borderRadius: '16px', border: 'none', outline: 'none', resize: 'none',
                  color: '#44403c', fontSize: '15px', fontWeight: '300',
                  lineHeight: '1.75', minHeight: '120px', fontFamily: 'inherit', display: 'block',
                }}
                autoFocus
              />
              {crumplingText && (
                <div className="animate-crumple absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ padding: '20px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    borderRadius: '16px', color: '#44403c', fontSize: '15px', fontWeight: '300',
                    lineHeight: '1.75', fontFamily: 'inherit', whiteSpace: 'pre-wrap', transformOrigin: '50% 65%' }}>
                  {crumplingText}
                </div>
              )}
            </div>

            <button
              onClick={handleDump}
              disabled={!currentWorry.trim() || !!crumplingText}
              className={`w-full py-4 rounded-full transition mb-6 ${
                currentWorry.trim() && !crumplingText
                  ? 'bg-navy text-white hover:bg-[#0c1a2b]'
                  : 'bg-line text-r-gray-soft cursor-not-allowed'
              }`}
            >
              내려놓기
            </button>

            {dumpedWorries.length > 0 && (
              <div className="text-center animate-fade-in">
                <p className="text-r-gray-soft text-xs mb-3">내려놓은 생각 {dumpedWorries.length}개</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {dumpedWorries.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-300/60 animate-fade-in" />
                  ))}
                </div>
              </div>
            )}

            {dumpedWorries.length > 0 && (
              <button onClick={() => setPhase('done')}
                className="w-full mt-8 py-4 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">
                다 비웠어요
              </button>
            )}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl animate-breath-slow" />
          {[
            { x: 12, y: 10, r: 1.4 }, { x: 80, y: 15, r: 0.9 }, { x: 90, y: 60, r: 1.1 },
            { x: 20, y: 75, r: 0.8 }, { x: 55, y: 5,  r: 1.2 }, { x: 6,  y: 42, r: 0.9 },
            { x: 94, y: 30, r: 1.0 }, { x: 40, y: 90, r: 0.7 }, { x: 72, y: 82, r: 1.1 },
          ].map((s, i) => (
            <div key={i} className="absolute rounded-full animate-breath"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.r * 2}px`, height: `${s.r * 2}px`,
                background: '#a5b4fc', opacity: 0.4 + (i % 3) * 0.08,
                animationDuration: `${7 + i}s`, animationDelay: `${i * 0.6}s` }} />
          ))}
        </div>

        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <MoonIcon glow />
            </div>
            <p className="font-serif text-[26px] text-navy mb-3" style={{ fontWeight: 600 }}>
              {dumpedWorries.length}개의 생각을 내려놓았어요
            </p>
            <p className="text-r-gray mb-12 leading-relaxed text-sm font-light">
              해결한 건 아닙니다.<br />
              잠시 옆에 두고 갑니다.<br />
              내일 다시 만나도 괜찮습니다.
            </p>
            <button onClick={onExit}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              닫기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

function MoonIcon({ glow = false }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="moon-glow-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#a5b4fc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-body-grad" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#e0e7ff" />
          <stop offset="40%"  stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </radialGradient>
      </defs>

      {glow && <circle cx="50" cy="50" r="46" fill="url(#moon-glow-bg)" />}
      {glow && <circle cx="50" cy="50" r="34" fill="#a5b4fc" opacity="0.1" />}

      {/* 달 본체 */}
      <path
        d="M 60 18 Q 36 18, 30 40 Q 30 62, 48 74 Q 34 68, 29 50 Q 28 28, 60 18 Z"
        fill="url(#moon-body-grad)"
        opacity="0.92"
      />
      {/* 내부 하이라이트 */}
      <path
        d="M 54 22 Q 40 24, 36 40 Q 34 55, 44 66 Q 36 58, 35 44 Q 36 26, 54 22 Z"
        fill="white" opacity="0.18"
      />
      {/* 크레이터 */}
      <circle cx="42" cy="36" r="3"   fill="#818cf8" opacity="0.22" />
      <circle cx="36" cy="52" r="2"   fill="#818cf8" opacity="0.18" />
      <circle cx="46" cy="58" r="1.5" fill="#818cf8" opacity="0.18" />

      {/* 별 */}
      <circle cx="74" cy="24" r="1.8" fill="#c7d2fe" opacity="0.7" />
      <circle cx="80" cy="42" r="1.2" fill="#c7d2fe" opacity="0.55" />
      <circle cx="72" cy="60" r="1.5" fill="#c7d2fe" opacity="0.65" />
      <circle cx="84" cy="60" r="0.9" fill="#e0e7ff" opacity="0.5" />
      <circle cx="68" cy="76" r="1.1" fill="#c7d2fe" opacity="0.6" />
      {glow && <>
        <circle cx="20" cy="28" r="1.2" fill="#c7d2fe" opacity="0.5" />
        <circle cx="16" cy="62" r="0.9" fill="#c7d2fe" opacity="0.4" />
        <circle cx="28" cy="82" r="1.4" fill="#c7d2fe" opacity="0.55" />
      </>}
    </svg>
  )
}
