import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function BubbleWrap({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [popped, setPopped] = useState({})
  const [popCount, setPopCount] = useState(0)
  const [popFlash, setPopFlash] = useState({})
  const audioCtxRef = useRef(null)

  const ROWS = 10
  const COLS = 7
  const TOTAL = ROWS * COLS

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioContext()
    }
  }

  const playPop = () => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const baseFreq = 380 + Math.random() * 220
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, ctx.currentTime + 0.09)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.28, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  }

  const popBubble = (index) => {
    if (popped[index]) return
    setPopped((prev) => ({ ...prev, [index]: true }))
    setPopCount((c) => c + 1)
    setPopFlash((prev) => ({ ...prev, [index]: true }))
    setTimeout(() => setPopFlash((prev) => ({ ...prev, [index]: false })), 150)
    playPop()
  }

  const refill = () => {
    setPopped({})
    setPopCount(0)
  }

  const allPopped = Object.keys(popped).length >= TOTAL

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-200/30 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>뽁뽁이</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-sm text-r-gray mb-12 leading-relaxed font-light">
              톡톡 터뜨리면서<br />손끝에 집중해 봅니다
            </p>
            {/* 미리보기 버블 3개 */}
            <div className="flex justify-center gap-4 mb-12">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full" style={bubbleStyle(false)} />
              ))}
            </div>
            <button
              onClick={() => { initAudio(); setPhase('running') }}
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
      <div className="min-h-screen relative bg-cream">
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-r-gray-soft hover:text-navy z-20 text-[11px] tracking-wider font-light"
        >
          나가기
        </button>

        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
          <p className="text-r-gray-soft text-sm mb-6">터뜨린 개수 <span className="text-navy font-medium">{popCount}</span></p>

          <div
            className="grid gap-2 p-5 rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              background: 'rgba(255,255,255,0.35)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 8px 32px rgba(56,189,248,0.12)',
            }}
          >
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onMouseDown={() => popBubble(i)}
                onTouchStart={(e) => { e.preventDefault(); popBubble(i) }}
                className="w-9 h-9 rounded-full transition-all duration-200 relative"
                style={
                  popped[i]
                    ? {
                        background: 'radial-gradient(circle at 50% 50%, rgba(186,230,253,0.15) 0%, rgba(186,230,253,0.05) 100%)',
                        boxShadow: 'inset 0 2px 6px rgba(14,116,144,0.2)',
                        transform: 'scale(0.72)',
                      }
                    : popFlash[i]
                    ? { ...bubbleStyle(false), transform: 'scale(1.15)' }
                    : bubbleStyle(false)
                }
              />
            ))}
          </div>

          {allPopped && (
            <button
              onClick={refill}
              className="mt-8 px-6 py-3 bg-white border border-line rounded-full text-ink hover:border-[#DCD5C4] transition text-sm animate-fade-in"
            >
              새 뽁뽁이 ✨
            </button>
          )}

          <button onClick={onExit} className="mt-6 p-3 text-sm text-r-gray-soft hover:text-navy">
            그만하기
          </button>
        </div>
      </div>
    )
  }

  return null
}

function bubbleStyle(dark) {
  return {
    background: `
      radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 12%, transparent 35%),
      radial-gradient(circle at 68% 72%, rgba(186,230,253,0.4) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(224,242,254,0.9) 0%, rgba(186,230,253,0.7) 40%, rgba(125,211,252,0.5) 70%, rgba(56,189,248,0.3) 100%)
    `,
    boxShadow: `
      inset 0 -3px 6px rgba(14,116,144,0.2),
      inset 0 2px 4px rgba(255,255,255,0.8),
      0 2px 8px rgba(56,189,248,0.25),
      0 0 0 0.5px rgba(56,189,248,0.3)
    `,
  }
}
