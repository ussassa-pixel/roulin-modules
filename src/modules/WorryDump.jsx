import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function WorryDump({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [currentWorry, setCurrentWorry] = useState('')
  const [dumpedWorries, setDumpedWorries] = useState([])
  const [crumplingText, setCrumplingText] = useState(null) // 구겨지는 중인 텍스트

  const handleDump = () => {
    if (!currentWorry.trim() || crumplingText) return

    const text = currentWorry
    setCrumplingText(text)  // 구겨지는 div에 텍스트 전달
    setCurrentWorry('')     // textarea 즉시 비우기

    setTimeout(() => {
      setDumpedWorries((prev) => [...prev, text])
      setCrumplingText(null)
    }, 900) // crumple 애니메이션 시간과 맞춤
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl animate-drift" style={{ animationDelay: '6s' }} />
          <div className="absolute top-20 right-32 w-1 h-1 rounded-full bg-stone-400 opacity-60" />
          <div className="absolute top-40 left-20 w-1 h-1 rounded-full bg-stone-400 opacity-40" />
          <div className="absolute top-60 right-20 w-1.5 h-1.5 rounded-full bg-stone-400 opacity-50" />
          <div className="absolute bottom-40 left-32 w-1 h-1 rounded-full bg-stone-400 opacity-60" />
        </div>

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-stone-50 to-purple-50 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-2xl text-stone-700 mb-3 font-light">걱정 비우기</p>
            <p className="text-sm text-stone-500 mb-12 leading-relaxed">
              머릿속을 맴도는 생각을 적어서<br />잠깐 내려놓고 가요
            </p>

            <div className="flex justify-center mb-12">
              <MoonIcon />
            </div>

            <button
              onClick={() => setPhase('writing')}
              className="w-full p-5 bg-white/80 backdrop-blur rounded-2xl hover:bg-white transition text-stone-700"
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
          <div className="absolute top-16 right-24 w-1 h-1 rounded-full bg-stone-400 opacity-60" />
          <div className="absolute top-32 left-16 w-1 h-1 rounded-full bg-stone-400 opacity-40" />
          <div className="absolute bottom-32 right-12 w-1.5 h-1.5 rounded-full bg-stone-400 opacity-50" />
        </div>

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-stone-50 to-purple-50 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full">
            <p className="text-stone-600 text-center mb-2 text-sm">지금 떠오르는 생각 하나</p>
            <p className="text-xs text-stone-400 text-center mb-8">
              해결하려고 쓰는 게 아니에요. 그냥 옮겨두는 거예요.
            </p>

            <div className="relative mb-4">
              <textarea
                value={currentWorry}
                onChange={(e) => setCurrentWorry(e.target.value)}
                placeholder="떠오르는 대로 적어주세요..."
                style={{
                  width: '100%',
                  padding: '20px',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  color: '#44403c',
                  fontSize: '15px',
                  fontWeight: '300',
                  lineHeight: '1.75',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                  display: 'block',
                }}
                autoFocus
              />

              {/* 구겨지는 텍스트 오버레이 */}
              {crumplingText && (
                <div
                  className="animate-crumple absolute inset-0 pointer-events-none overflow-hidden"
                  style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    color: '#44403c',
                    fontSize: '15px',
                    fontWeight: '300',
                    lineHeight: '1.75',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    transformOrigin: '50% 65%',
                  }}
                >
                  {crumplingText}
                </div>
              )}
            </div>

            <button
              onClick={handleDump}
              disabled={!currentWorry.trim() || !!crumplingText}
              className={`w-full p-4 rounded-2xl transition mb-6 ${
                currentWorry.trim() && !crumplingText
                  ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              내려놓기
            </button>

            {dumpedWorries.length > 0 && (
              <div className="text-center animate-fade-in">
                <p className="text-stone-400 text-xs mb-3">내려놓은 생각 {dumpedWorries.length}개</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {dumpedWorries.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-300/60 animate-fade-in" />
                  ))}
                </div>
              </div>
            )}

            {dumpedWorries.length > 0 && (
              <button
                onClick={() => setPhase('done')}
                className="w-full mt-8 p-4 bg-white/60 backdrop-blur text-stone-600 rounded-2xl hover:bg-white transition"
              >
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
          <div className="absolute top-20 right-32 w-1 h-1 rounded-full bg-stone-400 opacity-60" />
          <div className="absolute top-40 left-20 w-1 h-1 rounded-full bg-stone-400 opacity-40" />
          <div className="absolute bottom-40 left-32 w-1 h-1 rounded-full bg-stone-400 opacity-60" />
        </div>

        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-stone-50 to-purple-50 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-8">
              <MoonIcon glow />
            </div>

            <p className="text-2xl text-stone-700 mb-3 font-light">
              {dumpedWorries.length}개의 생각을 내려놓았어요
            </p>
            <p className="text-stone-500 mb-12 leading-relaxed text-sm">
              해결한 건 아니에요.<br />
              잠시 옆에 두고 가는 거예요.<br />
              내일 다시 만나도 괜찮아요.
            </p>

            <button
              onClick={onExit}
              className="w-full p-4 bg-stone-700 text-white rounded-2xl hover:bg-stone-800 transition"
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

function MoonIcon({ glow = false }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {glow && <circle cx="40" cy="40" r="36" fill="#a5b4fc" opacity="0.3" />}
      <path
        d="M 50 15 Q 30 15, 25 35 Q 25 55, 45 65 Q 30 60, 25 45 Q 25 25, 50 15 Z"
        fill="#c7d2fe"
        opacity="0.8"
      />
      <circle cx="60" cy="25" r="1.5" fill="#a8a29e" opacity="0.6" />
      <circle cx="65" cy="40" r="1"   fill="#a8a29e" opacity="0.5" />
      <circle cx="58" cy="55" r="1.2" fill="#a8a29e" opacity="0.6" />
    </svg>
  )
}
