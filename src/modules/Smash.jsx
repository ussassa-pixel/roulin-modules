import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 터뜨리기 — '화가 날 때' 코너.
// 떠오르는 덩어리를 팡팡 터뜨리며 화를 격하게 내보낸다. 파편이 사방으로 튀고 화면이 흔들린다.
// 얼마든지 다시 차오른다. 카타르시스 → "좀 가라앉았어요"로 가라앉힘까지가 한 흐름.
const HEAT_BG = { background: 'radial-gradient(ellipse at 50% 40%, #3a1414 0%, #241016 70%, #160a10 100%)' }
const COLORS = ['#e0563a', '#e07b3a', '#d84a6a', '#c94a34', '#e0913a']
const MAX_ON = 7

export default function Smash({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [blobs, setBlobs] = useState([])
  const [bursts, setBursts] = useState([])
  const [count, setCount] = useState(0)
  const [shaking, setShaking] = useState(false)
  const areaRef = useRef(null)
  const idRef = useRef(0)
  const countRef = useRef(0)
  const spawnRef = useRef(null)
  const shakeTimer = useRef(null)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => {
    if (mutedRef.current) return null
    try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null }
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } if (spawnRef.current) clearInterval(spawnRef.current); if (shakeTimer.current) clearTimeout(shakeTimer.current) }, [])

  // 강한 타격음 — 크런치(노이즈 스윕) + 쿵(서브 붐) + 팡(고역 크랙)
  const bang = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    // 1) 부서지는 크런치
    const l1 = Math.floor(c.sampleRate * 0.2); const b1 = c.createBuffer(1, l1, c.sampleRate); const d1 = b1.getChannelData(0)
    for (let k = 0; k < l1; k++) d1[k] = (Math.random() * 2 - 1) * (1 - k / l1)
    const s1 = c.createBufferSource(); s1.buffer = b1
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3400, t); lp.frequency.exponentialRampToValueAtTime(240, t + 0.18)
    const g1 = c.createGain(); g1.gain.setValueAtTime(0.5, t); g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    s1.connect(lp); lp.connect(g1); g1.connect(c.destination); s1.start(t); s1.stop(t + 0.24)
    // 2) 쿵 (서브 붐)
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.2)
    const og = c.createGain(); og.gain.setValueAtTime(0.42, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.26)
    o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 0.28)
    // 3) 팡 (짧은 고역 크랙)
    const l2 = Math.floor(c.sampleRate * 0.05); const b2 = c.createBuffer(1, l2, c.sampleRate); const d2 = b2.getChannelData(0)
    for (let k = 0; k < l2; k++) d2[k] = (Math.random() * 2 - 1) * (1 - k / l2)
    const s2 = c.createBufferSource(); s2.buffer = b2
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2200
    const g2 = c.createGain(); g2.gain.setValueAtTime(0.4, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
    s2.connect(hp); hp.connect(g2); g2.connect(c.destination); s2.start(t); s2.stop(t + 0.07)
  }

  const spawn = () => {
    setBlobs((bs) => {
      if (bs.length >= MAX_ON) return bs
      const x = 12 + Math.random() * 76, y = 14 + Math.random() * 60
      return [...bs, { id: idRef.current++, x, y, c: COLORS[Math.floor(Math.random() * COLORS.length)], s: 0.85 + Math.random() * 0.85 }]
    })
  }

  const begin = () => {
    setBlobs([]); setBursts([]); setCount(0); countRef.current = 0
    setPhase('play')
    for (let k = 0; k < 5; k++) setTimeout(spawn, k * 180)
    if (spawnRef.current) clearInterval(spawnRef.current)
    spawnRef.current = setInterval(spawn, 750)
  }

  const doShake = () => {
    setShaking(true)
    if (shakeTimer.current) clearTimeout(shakeTimer.current)
    shakeTimer.current = setTimeout(() => setShaking(false), 380)
  }

  const smash = (blob) => (e) => {
    e.stopPropagation()
    bang(); doShake()
    setBlobs((bs) => bs.filter((b) => b.id !== blob.id))
    // 파편 8~10개를 사방으로
    const n = 9
    const shards = Array.from({ length: n }, (_, k) => {
      const ang = (k / n) * Math.PI * 2 + Math.random() * 0.5
      const dist = 60 + Math.random() * 80
      return { tx: Math.cos(ang) * dist, ty: Math.sin(ang) * dist, r: (Math.random() * 720 - 360), sz: 6 + Math.random() * 10, dl: (Math.random() * 0.05).toFixed(3) }
    })
    const burstId = blob.id
    setBursts((ps) => [...ps, { id: burstId, x: blob.x, y: blob.y, c: blob.c, shards }])
    setTimeout(() => setBursts((ps) => ps.filter((p) => p.id !== burstId)), 750)
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
              올라온 화를 팡팡 터뜨려 내보내요.<br />파편이 사방으로 튀어도 괜찮아요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">누구를 해치는 게 아니라, 나를 위해 시원하게 내보내는 거예요.</p>
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
            <p className="font-serif text-[25px] text-white mb-2" style={{ fontWeight: 600 }}>{count}개를 터뜨렸어요</p>
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
      <style>{`
        @keyframes sm-in{0%{transform:scale(0) rotate(0deg)}70%{transform:scale(1.15) rotate(9deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes sm-shake{0%{transform:translate(0,0)}20%{transform:translate(-7px,4px)}40%{transform:translate(6px,-5px)}60%{transform:translate(-5px,-3px)}80%{transform:translate(4px,4px)}100%{transform:translate(0,0)}}
        @keyframes sm-flash{0%{transform:scale(.4);opacity:.95}100%{transform:scale(2.6);opacity:0}}
        @keyframes sm-shard{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--tx),var(--ty)) rotate(var(--r));opacity:0}}
      `}</style>
      <div
        ref={areaRef}
        className="min-h-screen relative overflow-hidden select-none"
        style={{ ...HEAT_BG, touchAction: 'none', animation: shaking ? 'sm-shake .38s ease-in-out' : 'none' }}
      >
        {blobs.map((b) => (
          <button key={b.id} onPointerDown={smash(b)} aria-label="터뜨리기"
            style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%,-50%)', animation: 'sm-in .3s cubic-bezier(.3,1.5,.5,1) both' }}>
            <Blob c={b.c} scale={b.s} />
          </button>
        ))}

        {bursts.map((p) => (
          <div key={`b${p.id}`} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
            {/* 섬광 */}
            <span style={{ position: 'absolute', left: -46, top: -46, width: 92, height: 92, borderRadius: '50%', background: `radial-gradient(circle, #fff 0%, ${p.c} 35%, ${p.c}00 70%)`, animation: 'sm-flash .5s ease-out both' }} />
            {/* 파편 */}
            {p.shards.map((sh, k) => (
              <span key={k} style={{
                position: 'absolute', left: -sh.sz / 2, top: -sh.sz / 2, width: sh.sz, height: sh.sz,
                background: p.c, borderRadius: '2px', boxShadow: `0 0 6px ${p.c}`,
                '--tx': `${sh.tx}px`, '--ty': `${sh.ty}px`, '--r': `${sh.r}deg`,
                animation: `sm-shard .6s cubic-bezier(.2,.7,.3,1) ${sh.dl}s both`,
              }} />
            ))}
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 pb-9 flex flex-col items-center pointer-events-none">
          <p className="text-white/70 tabular-nums text-[15px] mb-1">{count > 0 ? count : ''}</p>
          <p className="text-white/40 text-[12px] font-light mb-3">떠오르는 걸 팡 터뜨려요</p>
          <button onClick={settle} className="px-6 py-2 rounded-full bg-white/12 text-white/80 border border-white/20 text-[13px] pointer-events-auto hover:bg-white/20 transition">
            좀 가라앉았어요
          </button>
        </div>
      </div>
    </ModuleFrame>
  )
}

function Blob({ c = '#e0563a', scale = 1, calm = false }) {
  const sz = 68 * scale
  return (
    <span style={{
      display: 'block', width: sz, height: sz, borderRadius: calm ? '50%' : '46% 54% 52% 48% / 52% 46% 54% 48%',
      background: `radial-gradient(circle at 36% 32%, #ffffff55 0%, ${c} 45%, ${c} 100%)`,
      boxShadow: `0 0 ${calm ? 26 : 22}px ${calm ? 3 : 5}px ${c}66, inset -6px -8px 14px rgba(0,0,0,0.28)`,
    }} />
  )
}
