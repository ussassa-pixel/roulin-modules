import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 말랑 토이 — '그냥 재밌는 것' 코너.
// 누르면 말랑하게 눌렸다가 통 튀어오르고, 부드러운 소리와 잔물결이 퍼진다.
// oddly-satisfying 감각 장난감. 목표·종료 없음 — 만지작거리는 재미. isMuted 존중.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 38%, #142a44 0%, #0e1c30 70%, #0a1322 100%)' }
// 누를 때마다 도는 파스텔 색
const HUES = ['#5fd6c8', '#8fb8f0', '#c89bf0', '#f0a0c8', '#f0c86e', '#9be0a0']
// 부드러운 펜타토닉(도-레-미-솔-라)
const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0]

export default function SquishToy({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [hue, setHue] = useState(0)
  const [press, setPress] = useState(false)
  const [ripples, setRipples] = useState([])
  const [taps, setTaps] = useState(0)
  const rid = useRef(0)
  const noteRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  // 말랑한 'boop' — 사인 + 살짝 피치 벤드
  const boop = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    const f = NOTES[noteRef.current % NOTES.length]; noteRef.current += 1
    const o = c.createOscillator(); o.type = 'sine'
    o.frequency.setValueAtTime(f * 0.7, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06)
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2
    const g2 = c.createGain(); g2.gain.setValueAtTime(0.05, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.52)
    o2.connect(g2); g2.connect(c.destination); o2.start(t); o2.stop(t + 0.27)
  }

  const squish = () => {
    setPress(true); boop()
    setHue((h) => (h + 1) % HUES.length)
    setTaps((n) => n + 1)
    const id = rid.current++
    setRipples((r) => [...r, id])
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 700)
  }
  const release = () => setPress(false)

  const c1 = HUES[hue], c2 = HUES[(hue + 2) % HUES.length]

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>말랑 토이</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8">
              <div style={{ width: 74, height: 74, borderRadius: '50%', background: `radial-gradient(circle at 36% 32%, #ffffff88, ${HUES[0]})`, boxShadow: `0 0 24px 4px ${HUES[0]}66` }} />
            </div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              누르면 말랑, 통 하고 튀어올라요.<br />생각 없이 만지작거려 보세요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">할 것도, 끝도 없어요. 그냥 기분 좋은 감각이에요.</p>
            <button onClick={() => setPhase('play')}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              만지러 가기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <style>{`@keyframes st-rip{0%{transform:scale(.5);opacity:.55}100%{transform:scale(3);opacity:0}}`}</style>
      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center select-none"
        style={{ ...FUN_BG, touchAction: 'none' }}
        onPointerDown={squish} onPointerUp={release} onPointerLeave={release}
      >
        <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
          {ripples.map((id) => (
            <span key={id} style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', border: `2px solid ${c1}`, animation: 'st-rip .68s ease-out forwards', pointerEvents: 'none' }} />
          ))}
          {/* 말랑 블롭 */}
          <div style={{
            width: 168, height: 168, borderRadius: '50%',
            background: `radial-gradient(circle at 36% 30%, #ffffffaa 0%, ${c1} 48%, ${c2} 100%)`,
            boxShadow: `0 12px 40px 6px ${c1}55, inset -10px -14px 26px rgba(0,0,0,0.22), inset 8px 10px 22px rgba(255,255,255,0.35)`,
            transform: press ? 'scale(0.82, 0.7)' : 'scale(1)',
            transition: press ? 'transform .09s ease-out, background .3s ease' : 'transform .55s cubic-bezier(.25,1.6,.4,1), background .3s ease',
          }} />
        </div>
        <p className="text-white/35 text-[12px] font-light mt-10">{taps === 0 ? '가운데 말랑이를 눌러 보세요' : '말랑… 통 ⋅ 얼마든지'}</p>
      </div>
    </ModuleFrame>
  )
}
