import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 터뜨리기 — '화가 날 때' 코너.
// 떠오르는 덩어리를 톡 터뜨리며 화를 안전하게 내보낸다. 얼마든지 다시 차오른다.
// 카타르시스 → 잠시 뒤 "좀 가라앉았나요?"로 가라앉힘까지가 한 흐름(곱씹기 유도 금지).
const HEAT_BG = { background: 'radial-gradient(ellipse at 50% 40%, #3a1414 0%, #241016 70%, #160a10 100%)' }
const COLORS = ['#e0563a', '#e07b3a', '#d84a6a', '#c94a34', '#e0913a']
const MAX_ON = 6

export default function Smash({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [blobs, setBlobs] = useState([])
  const [pops, setPops] = useState([])
  const [count, setCount] = useState(0)
  const areaRef = useRef(null)
  const idRef = useRef(0)
  const countRef = useRef(0)
  const spawnRef = useRef(null)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => {
    if (mutedRef.current) return null
    try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null }
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } if (spawnRef.current) clearInterval(spawnRef.current) }, [])

  // 쫀득하게 부서지는 소리 — 노이즈 버스트 + 빠른 로우패스 스윕(크런치)
  const crunch = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    const len = Math.floor(c.sampleRate * 0.18); const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0)
    for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / len)
    const s = c.createBufferSource(); s.buffer = b
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(280, t + 0.16)
    const g = c.createGain(); g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    // 쿵 하는 저역 한 방
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.18)
    const og = c.createGain(); og.gain.setValueAtTime(0.28, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    s.connect(lp); lp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.22)
    o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 0.24)
  }

  const spawn = () => {
    setBlobs((bs) => {
      if (bs.length >= MAX_ON) return bs
      const x = 12 + Math.random() * 76, y = 16 + Math.random() * 60
      return [...bs, { id: idRef.current++, x, y, c: COLORS[Math.floor(Math.random() * COLORS.length)], s: 0.8 + Math.random() * 0.7 }]
    })
  }

  const begin = () => {
    setBlobs([]); setPops([]); setCount(0); countRef.current = 0
    setPhase('play')
    for (let k = 0; k < 4; k++) setTimeout(spawn, k * 220)
    if (spawnRef.current) clearInterval(spawnRef.current)
    spawnRef.current = setInterval(spawn, 900)
  }

  const smash = (blob) => (e) => {
    e.stopPropagation()
    crunch()
    setBlobs((bs) => bs.filter((b) => b.id !== blob.id))
    setPops((ps) => [...ps, { id: blob.id, x: blob.x, y: blob.y, c: blob.c }])
    setTimeout(() => setPops((ps) => ps.filter((p) => p.id !== blob.id)), 600)
    countRef.current += 1; setCount(countRef.current)
  }

  const settle = () => { if (spawnRef.current) clearInterval(spawnRef.current); setPhase('settle') }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={HEAT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>터뜨리기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Blob c="#e0563a" /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              올라온 화를 톡톡 터뜨려 내보내요.<br />얼마든지 다시 차오르니 괜찮아요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">누구를 해치는 게 아니라, 나를 위해 잠깐 내보내는 거예요.</p>
            <button onClick={begin}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'settle') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #1c2740 0%, #111a2c 75%, #0a1120 100%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><Blob c="#5b8fd0" calm /></div>
            <p className="font-serif text-[25px] text-white mb-2" style={{ fontWeight: 600 }}>{count}개를 내보냈어요</p>
            <p className="text-white/65 text-sm font-light mb-10 leading-relaxed">
              숨을 한 번 길게 내쉬어 볼까요.<br />좀 가라앉았다면, 그걸로 충분해요.
            </p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">조금 더 터뜨리기</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <style>{`@keyframes sm-in{0%{transform:scale(0) rotate(0deg)}70%{transform:scale(1.12) rotate(8deg)}100%{transform:scale(1) rotate(0deg)}}@keyframes sm-pop{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.1);opacity:0}}`}</style>
      <div ref={areaRef} className="min-h-screen relative overflow-hidden select-none" style={{ ...HEAT_BG, touchAction: 'none' }}>
        {blobs.map((b) => (
          <button key={b.id} onPointerDown={smash(b)} aria-label="터뜨리기"
            style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-50%)', animation: 'sm-in .32s cubic-bezier(.3,1.4,.5,1) both' }}>
            <Blob c={b.c} scale={b.s} />
          </button>
        ))}
        {pops.map((p) => (
          <span key={`p${p.id}`} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', width: 74, height: 74, marginLeft: -37, marginTop: -37, borderRadius: '50%', background: `radial-gradient(circle, ${p.c} 0%, ${p.c}00 70%)`, animation: 'sm-pop .55s ease-out both', pointerEvents: 'none' }} />
        ))}
        <div className="absolute inset-x-0 bottom-0 pb-9 flex flex-col items-center pointer-events-none">
          <p className="text-white/70 tabular-nums text-[15px] mb-1">{count > 0 ? count : ''}</p>
          <p className="text-white/40 text-[12px] font-light mb-3">떠오르는 걸 톡 터뜨려요</p>
          <button onClick={settle} className="px-6 py-2 rounded-full bg-white/12 text-white/80 border border-white/20 text-[13px] pointer-events-auto hover:bg-white/20 transition">
            좀 가라앉았어요
          </button>
        </div>
      </div>
    </ModuleFrame>
  )
}

function Blob({ c = '#e0563a', scale = 1, calm = false, }) {
  const sz = 66 * scale
  return (
    <span style={{
      display: 'block', width: sz, height: sz, borderRadius: calm ? '50%' : '46% 54% 52% 48% / 52% 46% 54% 48%',
      background: `radial-gradient(circle at 36% 32%, #ffffff55 0%, ${c} 45%, ${c} 100%)`,
      boxShadow: `0 0 ${calm ? 26 : 20}px ${calm ? 3 : 4}px ${c}66, inset -6px -8px 14px rgba(0,0,0,0.28)`,
    }} />
  )
}
