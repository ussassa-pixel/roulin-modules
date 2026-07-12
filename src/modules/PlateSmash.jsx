import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 접시 깨기 — '화가 날 때' 코너.
// 손에 든 망치를 내리쳐 접시를 와장창 깬다. 접시 무늬·크기, 깨지는 소리·모양이 매번 조금씩 다르다.
// 격한 카타르시스 → "좀 후련해졌어요"로 마무리.
const HEAT_BG = { background: 'radial-gradient(ellipse at 50% 42%, #33141c 0%, #20101a 72%, #150b12 100%)' }
const RIMS = ['#4a78c0', '#c04a6a', '#d98a2a', '#3aa088', '#8a5ad0', '#c86464']

const randPlate = (i) => ({ rim: RIMS[(i + Math.floor(Math.random() * RIMS.length)) % RIMS.length], pattern: Math.floor(Math.random() * 4), sz: 156 + Math.floor(Math.random() * 26) })

export default function PlateSmash({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [plateId, setPlateId] = useState(0)
  const [plate, setPlate] = useState(randPlate(0))
  const [broken, setBroken] = useState(false)
  const [swinging, setSwinging] = useState(false)
  const [shards, setShards] = useState([])
  const [count, setCount] = useState(0)
  const [shaking, setShaking] = useState(false)
  const countRef = useRef(0)
  const readyRef = useRef(true)
  const timers = useRef([])

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } timers.current.forEach(clearTimeout) }, [])
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }

  // 매번 조금씩 다른 도자기 파열음
  const crash = () => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    const pitch = 0.8 + Math.random() * 0.5
    // 충격(쿵)
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(210 * pitch, t); o.frequency.exponentialRampToValueAtTime(58, t + 0.14)
    const og = c.createGain(); og.gain.setValueAtTime(0.32, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 0.22)
    // 파열 노이즈
    const l = Math.floor(c.sampleRate * (0.26 + Math.random() * 0.1)); const b = c.createBuffer(1, l, c.sampleRate); const d = b.getChannelData(0)
    for (let k = 0; k < l; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / l, 1.3)
    const s = c.createBufferSource(); s.buffer = b
    const bp = c.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 1500 + Math.random() * 900
    const g = c.createGain(); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.34)
    // 사금파리 '탱' 여러 개(개수·음정 랜덤)
    const n = 4 + Math.floor(Math.random() * 5)
    for (let k = 0; k < n; k++) {
      const at = t + 0.01 + Math.random() * 0.2
      const f = (1500 + Math.random() * 2800) * pitch
      const to = c.createOscillator(); to.type = 'triangle'; to.frequency.value = f
      const tg = c.createGain(); tg.gain.setValueAtTime(0.0001, at); tg.gain.linearRampToValueAtTime(0.08, at + 0.004); tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.12 + Math.random() * 0.14)
      to.connect(tg); tg.connect(c.destination); to.start(at); to.stop(at + 0.3)
    }
  }

  const doShake = () => { setShaking(true); later(() => setShaking(false), 430) }

  const begin = () => { countRef.current = 0; setCount(0); setPlate(randPlate(0)); setBroken(false); setSwinging(false); readyRef.current = true; setShards([]); setPlateId((n) => n + 1); setPhase('play') }

  const smash = () => {
    if (!readyRef.current || broken) return
    readyRef.current = false
    setSwinging(true)
    // 망치가 접시에 닿는 순간(≈180ms)에 파열
    later(() => {
      crash(); doShake(); setBroken(true)
      const n = 11 + Math.floor(Math.random() * 8)
      const sh = Array.from({ length: n }, (_, k) => {
        const ang = (k / n) * Math.PI * 2 + Math.random() * 0.7
        const dist = 80 + Math.random() * 170
        return { tx: Math.cos(ang) * dist, ty: Math.sin(ang) * dist - 24, r: Math.random() * 900 - 450, w: 9 + Math.random() * 24, h: 6 + Math.random() * 15, dl: (Math.random() * 0.05).toFixed(3) }
      })
      setShards(sh)
      countRef.current += 1; setCount(countRef.current)
    }, 180)
    later(() => setSwinging(false), 320)
    later(() => { setPlate(randPlate(countRef.current)); setShards([]); setBroken(false); setPlateId((n) => n + 1); readyRef.current = true }, 720)
  }

  const settle = () => setPhase('settle')

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={HEAT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>접시 깨기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Plate rim={RIMS[0]} pattern={1} sz={92} /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              망치를 내리쳐 접시를 와장창 깨요.<br />깰 때마다 새 접시가 툭 떨어져요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">그리스식 접시 깨기처럼, 시원하게 내보내는 거예요.</p>
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
            <div className="flex justify-center mb-7"><Plate rim="#5b8fd0" pattern={2} sz={84} /></div>
            <p className="font-serif text-[25px] text-white mb-2" style={{ fontWeight: 600 }}>{count}개를 깼어요</p>
            <p className="text-white/65 text-sm font-light mb-10 leading-relaxed">
              한바탕 쏟아냈네요. 숨을 길게 내쉬어 볼까요.<br />조금 후련해졌다면, 그걸로 충분해요.
            </p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">더 깨기</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <style>{`
        @keyframes ps-drop{0%{transform:translateY(-260px) scale(.8);opacity:0}70%{transform:translateY(6px) scale(1.02);opacity:1}100%{transform:translateY(0) scale(1)}}
        @keyframes ps-shake{0%{transform:translate(0,0)}20%{transform:translate(-8px,5px)}40%{transform:translate(7px,-6px)}60%{transform:translate(-6px,-3px)}80%{transform:translate(5px,5px)}100%{transform:translate(0,0)}}
        @keyframes ps-flash{0%{transform:scale(.4);opacity:.9}100%{transform:scale(2.4);opacity:0}}
        @keyframes ps-shard{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--tx),var(--ty)) rotate(var(--r));opacity:0}}
        @keyframes ps-swing{0%{transform:rotate(-54deg)}55%{transform:rotate(14deg)}70%{transform:rotate(6deg)}100%{transform:rotate(-54deg)}}
      `}</style>
      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center select-none"
        style={{ ...HEAT_BG, touchAction: 'none', animation: shaking ? 'ps-shake .43s ease-in-out' : 'none' }}
      >
        <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
          {/* 접시 */}
          {!broken && (
            <button key={plateId} onPointerDown={smash} aria-label="접시 깨기" style={{ animation: 'ps-drop .5s cubic-bezier(.3,1.2,.5,1) both' }}>
              <Plate rim={plate.rim} pattern={plate.pattern} sz={plate.sz} />
            </button>
          )}
          {/* 망치 (내려치기) */}
          {swinging && (
            <div style={{ position: 'absolute', left: '52%', top: '2%', transformOrigin: '50% 100%', animation: 'ps-swing .32s cubic-bezier(.4,.1,.7,1) both', pointerEvents: 'none' }}>
              <Hammer />
            </div>
          )}
          {/* 깨질 때 — 섬광 + 사금파리 */}
          {broken && (
            <>
              <span style={{ position: 'absolute', left: '50%', top: '50%', width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #ffe9c8 40%, #ffe9c800 70%)', animation: 'ps-flash .5s ease-out both', pointerEvents: 'none' }} />
              {shards.map((sh, k) => (
                <span key={k} style={{
                  position: 'absolute', left: '50%', top: '50%', width: sh.w, height: sh.h, marginLeft: -sh.w / 2, marginTop: -sh.h / 2,
                  background: 'linear-gradient(135deg, #fdfaf2 0%, #e6ddc8 100%)', clipPath: 'polygon(0 0, 100% 30%, 70% 100%)',
                  boxShadow: `0 0 4px rgba(0,0,0,0.2)`, borderRight: `2px solid ${plate.rim}`,
                  '--tx': `${sh.tx}px`, '--ty': `${sh.ty}px`, '--r': `${sh.r}deg`,
                  animation: `ps-shard .62s cubic-bezier(.2,.7,.3,1) ${sh.dl}s both`, pointerEvents: 'none',
                }} />
              ))}
            </>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 pb-9 flex flex-col items-center pointer-events-none">
          <p className="text-white/70 tabular-nums text-[15px] mb-1">{count > 0 ? count : ''}</p>
          <p className="text-white/40 text-[12px] font-light mb-3">접시를 내리쳐 깨요</p>
          <button onClick={settle} className="px-6 py-2 rounded-full bg-white/12 text-white/80 border border-white/20 text-[13px] pointer-events-auto hover:bg-white/20 transition">
            좀 후련해졌어요
          </button>
        </div>
      </div>
    </ModuleFrame>
  )
}

// 접시 — 무늬 4종(plain/dots/double-ring/scallop)
function Plate({ rim = '#4a78c0', pattern = 0, sz = 160 }) {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2
    return <circle key={i} cx={80 + Math.cos(a) * 58} cy={80 + Math.sin(a) * 58} r="2.4" fill={rim} />
  })
  return (
    <svg width={sz} height={sz} viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <ellipse cx="80" cy="86" rx="70" ry="66" fill="rgba(0,0,0,0.28)" />
      <circle cx="80" cy="80" r="72" fill="url(#ps-body)" />
      <circle cx="80" cy="80" r="72" fill="none" stroke={rim} strokeWidth="6" />
      {pattern === 2 && <circle cx="80" cy="80" r="60" fill="none" stroke={rim} strokeWidth="2" opacity="0.6" />}
      {pattern === 1 && dots}
      {pattern === 3 && <circle cx="80" cy="80" r="56" fill="none" stroke={rim} strokeWidth="3" strokeDasharray="4 6" opacity="0.7" />}
      <circle cx="80" cy="80" r="54" fill="none" stroke={rim} strokeWidth="2.5" opacity="0.7" />
      <circle cx="80" cy="80" r="40" fill="url(#ps-inner)" />
      <ellipse cx="62" cy="58" rx="20" ry="12" fill="#ffffff" opacity="0.5" />
      <defs>
        <radialGradient id="ps-body" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stopColor="#fffdf7" /><stop offset="0.7" stopColor="#f3ecdb" /><stop offset="1" stopColor="#e2d8c0" /></radialGradient>
        <radialGradient id="ps-inner" cx="0.42" cy="0.4" r="0.7"><stop offset="0" stopColor="#fffefa" /><stop offset="1" stopColor="#efe7d3" /></radialGradient>
      </defs>
    </svg>
  )
}

// 손에 든 나무망치
function Hammer() {
  return (
    <svg width="70" height="150" viewBox="0 0 70 150" fill="none" aria-hidden="true">
      {/* 자루 */}
      <rect x="30" y="40" width="10" height="98" rx="5" fill="url(#hm-wood)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      {/* 머리 */}
      <rect x="8" y="16" width="54" height="30" rx="6" fill="url(#hm-metal)" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      <rect x="8" y="16" width="14" height="30" rx="6" fill="rgba(255,255,255,0.18)" />
      {/* 쥔 손 */}
      <ellipse cx="35" cy="128" rx="16" ry="13" fill="#e8b48f" />
      <ellipse cx="35" cy="120" rx="15" ry="7" fill="#dca07a" />
      <defs>
        <linearGradient id="hm-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b7bcc4" /><stop offset="0.5" stopColor="#8b929c" /><stop offset="1" stopColor="#5f6670" /></linearGradient>
        <linearGradient id="hm-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c88a4e" /><stop offset="1" stopColor="#9c6532" /></linearGradient>
      </defs>
    </svg>
  )
}
