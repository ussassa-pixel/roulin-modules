import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 귀 청소 — '그냥 재밌는 것' 코너.
// 내시경으로 귀 속을 보며 도구를 바꿔 귀지를 하나씩 파낸다.
// 가는 도구=벽의 얇은 조각 긁기, 석션=흩어진 부스러기 빨기, 큰 포셉=가운데 큰 귀지 쑥.
// 큰 귀지는 주변을 다 정리해야 뽑혀서 그 쾌감을 살린다. isMuted 존중.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 30%, #12312f 0%, #0b2422 68%, #071614 100%)' }
const TOOLS = [
  { key: 'pick', name: '가는 도구', for: 'flake' },
  { key: 'suction', name: '석션', for: 'debris' },
  { key: 'forceps', name: '큰 포셉', for: 'plug' },
]
const CX = 150, CY = 150

function makeEar() {
  const smalls = []
  const n = 5 + Math.floor(Math.random() * 3)
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + Math.random() * 0.5
    const rad = 74 + Math.random() * 34
    smalls.push({
      id: 'p' + i + Math.random().toString(36).slice(2, 6),
      type: Math.random() < 0.5 ? 'flake' : 'debris',
      x: CX + Math.cos(ang) * rad, y: CY + Math.sin(ang) * rad,
      size: 13 + Math.random() * 9, rot: Math.random() * 360,
    })
  }
  return smalls
}

export default function EarClean({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [tool, setTool] = useState('pick')
  const [smalls, setSmalls] = useState([])
  const [plugOut, setPlugOut] = useState(false)   // 큰 귀지 제거됨
  const [pull, setPull] = useState(0)             // 큰 귀지 뽑는 진행 0~1
  const [fx, setFx] = useState([])
  const [hint, setHint] = useState('')
  const [toolFx, setToolFx] = useState(null)      // 도구 동작 위치/종류
  const toolRef = useRef('pick'); toolRef.current = tool
  const pullRef = useRef(0)
  const pullIv = useRef(null)
  const hintT = useRef(null)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { if (pullIv.current) clearInterval(pullIv.current); if (hintT.current) clearTimeout(hintT.current); try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const sound = (kind) => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    const noise = (dur) => { const l = Math.floor(c.sampleRate * dur); const b = c.createBuffer(1, l, c.sampleRate); const d = b.getChannelData(0); for (let k = 0; k < l; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / l); const s = c.createBufferSource(); s.buffer = b; return s }
    if (kind === 'scrape') { // 사각 — 짧은 밴드패스 노이즈
      const s = noise(0.12); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 2
      const g = c.createGain(); g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13)
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.14)
    } else if (kind === 'suck') { // 슈욱 — 노이즈 상승 스윕
      const s = noise(0.34); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(420, t); bp.frequency.exponentialRampToValueAtTime(1700, t + 0.3); bp.Q.value = 1.4
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.35)
    } else if (kind === 'grip') { // 톡 — 집는 소리
      const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 320; const g = c.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.06)
    } else if (kind === 'plop') { // 큰 귀지 쑥 — 저역 상승 + 뽁
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(340, t + 0.18)
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.32)
      const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.setValueAtTime(520, t + 0.16); o2.frequency.exponentialRampToValueAtTime(180, t + 0.3)
      const g2 = c.createGain(); g2.gain.setValueAtTime(0.16, t + 0.16); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); o2.connect(g2); g2.connect(c.destination); o2.start(t + 0.16); o2.stop(t + 0.34)
    } else if (kind === 'done') {
      ;[523, 659, 784].forEach((f, i) => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const g = c.createGain(); const at = t + i * 0.09; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.12, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4); o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + 0.42) })
    }
  }

  const showHint = (msg) => { setHint(msg); if (hintT.current) clearTimeout(hintT.current); hintT.current = setTimeout(() => setHint(''), 1400) }
  const flashTool = (kind, x, y) => { setToolFx({ kind, x, y, k: Math.random() }); setTimeout(() => setToolFx(null), 420) }

  const begin = () => { setTool('pick'); setSmalls(makeEar()); setPlugOut(false); setPull(0); pullRef.current = 0; setFx([]); setHint(''); setPhase('play') }

  const addFx = (x, y, kind) => { const id = Math.random().toString(36).slice(2); setFx((f) => [...f, { id, x, y, kind }]); setTimeout(() => setFx((f) => f.filter((z) => z.id !== id)), 600) }

  const tapSmall = (piece) => (e) => {
    e.stopPropagation()
    const need = piece.type === 'flake' ? 'pick' : 'suction'
    if (toolRef.current !== need) { showHint(need === 'pick' ? '얇은 조각은 가는 도구로 긁어요' : '부스러기는 석션으로 빨아들여요'); return }
    sound(piece.type === 'flake' ? 'scrape' : 'suck')
    flashTool(toolRef.current, piece.x, piece.y)
    addFx(piece.x, piece.y, piece.type)
    setSmalls((list) => list.filter((z) => z.id !== piece.id))
  }

  const smallLeft = smalls.length

  // 큰 귀지 — 큰 포셉 + 주변 정리 완료 시 꾹 눌러 뽑기
  const startPull = (e) => {
    e.stopPropagation()
    if (plugOut) return
    if (toolRef.current !== 'forceps') { showHint('가운데 큰 귀지는 큰 포셉으로 집어요'); return }
    if (smallLeft > 0) { showHint('주변 귀지부터 정리해요'); return }
    if (pullIv.current) return
    sound('grip')
    pullIv.current = setInterval(() => {
      pullRef.current = Math.min(1, pullRef.current + 0.045)
      setPull(pullRef.current)
      if (pullRef.current >= 1) { clearInterval(pullIv.current); pullIv.current = null; finishPlug() }
    }, 40)
  }
  const endPull = () => {
    if (pullIv.current) { clearInterval(pullIv.current); pullIv.current = null }
    if (!plugOut && pullRef.current < 1) { pullRef.current = 0; setPull(0) } // 놓으면 도로 들어감
  }
  const finishPlug = () => {
    sound('plop'); setPlugOut(true); setPull(1)
    setTimeout(() => { sound('done'); setPhase('done') }, 700)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>귀 청소</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><EarView smalls={[{ x: 108, y: 120, size: 15, rot: 0, type: 'flake' }, { x: 190, y: 170, size: 13, rot: 0, type: 'debris' }]} plugScale={1} plugOut={false} pull={0} small /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              내시경으로 귀 속을 보며,<br />도구를 바꿔 귀지를 하나씩 파내요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">가는 도구·석션으로 주변부터, 큰 귀지는 마지막에 포셉으로 쑥.</p>
            <button onClick={begin}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              들어가기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><EarView smalls={[]} plugOut pull={1} small /></div>
            <p className="font-serif text-[26px] text-white mb-2" style={{ fontWeight: 600 }}>말끔하게 뚫렸어요</p>
            <p className="text-white/65 text-sm font-light mb-11 leading-relaxed">큰 귀지까지 쑥. 아, 시원하다.<br />또 하나 파러 갈까요?</p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">새 귀 파기</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // 주변을 정리할수록 큰 귀지가 가까워지는 느낌(살짝 확대)
  const plugScale = 1 + (1 - Math.min(1, smallLeft / 5)) * 0.25 + pull * 0.4

  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG} onPointerUp={endPull} onPointerLeave={endPull}>
        <div className="max-w-md w-full flex flex-col items-center">
          <p className="text-white/60 text-[12px] h-5 mb-2 transition">{hint || (smallLeft > 0 ? '주변 귀지를 맞는 도구로 파내요' : plugOut ? '' : '이제 큰 포셉으로 가운데 큰 귀지를 꾹!')}</p>

          <EarView
            smalls={smalls} onTapSmall={tapSmall} onPullPlug={startPull}
            plugScale={plugScale} plugOut={plugOut} pull={pull} tool={tool} fx={fx} toolFx={toolFx}
            plugReady={smallLeft === 0}
          />

          {/* 도구 선택 */}
          <div className="flex items-center justify-center gap-2.5 mt-7">
            {TOOLS.map((tl) => {
              const on = tool === tl.key
              return (
                <button key={tl.key} onClick={() => setTool(tl.key)}
                  className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl border transition"
                  style={on ? { background: 'rgba(80,210,200,0.16)', borderColor: 'rgba(80,210,200,0.7)', boxShadow: '0 0 14px 1px rgba(80,210,200,0.3)' } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <ToolIcon k={tl.key} color={on ? '#5fe0d4' : 'rgba(255,255,255,0.6)'} />
                  <span className="text-[11px]" style={{ color: on ? '#c8f5f0' : 'rgba(255,255,255,0.6)' }}>{tl.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-white/30 text-[11px] mt-4">남은 귀지 {smallLeft + (plugOut ? 0 : 1)}개</p>
        </div>
      </div>
    </ModuleFrame>
  )
}

// 내시경 시야 — 귀 속 canal + 귀지들 + 큰 귀지
function EarView({ smalls, onTapSmall, onPullPlug, plugScale = 1, plugOut = false, pull = 0, tool, fx = [], toolFx, plugReady = false, small = false }) {
  const D = small ? 150 : 300
  const sc = D / 300
  return (
    <div className="relative" style={{ width: D, height: D, borderRadius: '50%', overflow: 'hidden', touchAction: 'none', boxShadow: '0 0 0 3px rgba(90,220,210,0.25), 0 0 26px 4px rgba(0,0,0,0.5)' }}>
      {/* 귀 속 canal — 바깥 살빛 → 깊은 어둠 */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 46%, #3a1a12 0%, #7d3d2c 34%, #c47a63 62%, #e6a892 100%)' }} />
      {/* 결(주름) */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-radial-gradient(circle at 50% 46%, rgba(120,50,40,0.10) 0 6px, transparent 6px 13px)', opacity: 0.6 }} />
      {/* 내시경 비네트 */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 44px 14px rgba(0,0,0,0.55)', borderRadius: '50%' }} />

      <svg width={D} height={D} viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ec-wax" cx="0.4" cy="0.34" r="0.75"><stop offset="0" stopColor="#e6b45a" /><stop offset="0.5" stopColor="#b9822f" /><stop offset="1" stopColor="#7c531d" /></radialGradient>
          <radialGradient id="ec-plug" cx="0.42" cy="0.32" r="0.8"><stop offset="0" stopColor="#d99f45" /><stop offset="0.45" stopColor="#a8722a" /><stop offset="0.8" stopColor="#7a4e1c" /><stop offset="1" stopColor="#4e3112" /></radialGradient>
        </defs>

        {/* 큰 귀지가 뽑힌 자리(뻥 뚫린 어둠) */}
        {(plugOut || pull > 0.3) && <circle cx={CX} cy={CY} r={26} fill="#1a0c08" />}

        {/* 큰 귀지 */}
        {!plugOut && (
          <g transform={`translate(${CX} ${CY - pull * 60}) scale(${plugScale})`} onPointerDown={onPullPlug} style={{ cursor: 'pointer' }}>
            <ellipse cx="0" cy="2" rx="30" ry="26" fill="rgba(0,0,0,0.3)" />
            <path d="M-28 -6 Q -30 -24 -8 -26 Q 6 -30 20 -22 Q 32 -14 28 4 Q 30 22 8 26 Q -12 30 -24 16 Q -32 6 -28 -6 Z" fill="url(#ec-plug)" stroke="rgba(60,38,14,0.6)" strokeWidth="1.5" />
            {/* 결·음영 */}
            <path d="M-16 -10 Q 0 -16 16 -8" stroke="rgba(70,44,16,0.5)" strokeWidth="2" fill="none" />
            <path d="M-18 6 Q 0 12 18 4" stroke="rgba(70,44,16,0.4)" strokeWidth="2" fill="none" />
            <ellipse cx="-9" cy="-9" rx="7" ry="5" fill="rgba(255,235,180,0.35)" />
            {plugReady && <ellipse cx="0" cy="0" rx="34" ry="30" fill="none" stroke="rgba(95,224,212,0.8)" strokeWidth="2" strokeDasharray="4 5" />}
          </g>
        )}

        {/* 뽑는 중 포셉 */}
        {tool === 'forceps' && pull > 0 && !plugOut && (
          <g transform={`translate(${CX} ${CY - pull * 60})`}>
            <path d={`M-12 ${-30} L -4 -6`} stroke="#c9ccd2" strokeWidth="4" strokeLinecap="round" />
            <path d={`M12 ${-30} L 4 -6`} stroke="#c9ccd2" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* 작은 귀지들 */}
        {smalls.map((p, i) => (
          <g key={p.id || `s${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`} onPointerDown={onTapSmall ? onTapSmall(p) : undefined} style={{ cursor: 'pointer' }}>
            {p.type === 'flake' ? (
              <path d={`M${-p.size / 2} 0 Q 0 ${-p.size * 0.7} ${p.size / 2} 0 Q 0 ${p.size * 0.5} ${-p.size / 2} 0 Z`} fill="url(#ec-wax)" stroke="rgba(70,44,16,0.5)" strokeWidth="1" opacity="0.95" />
            ) : (
              <g fill="url(#ec-wax)">
                <circle cx="0" cy="0" r={p.size * 0.32} />
                <circle cx={p.size * 0.34} cy={p.size * 0.12} r={p.size * 0.22} />
                <circle cx={-p.size * 0.28} cy={p.size * 0.2} r={p.size * 0.2} />
                <circle cx={p.size * 0.1} cy={-p.size * 0.3} r={p.size * 0.18} />
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* 도구 동작 이펙트 */}
      {toolFx && (
        <div key={toolFx.k} style={{ position: 'absolute', left: toolFx.x * sc, top: toolFx.y * sc, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <ToolIcon k={toolFx.kind} color="#eef" big />
        </div>
      )}
      {/* 제거 이펙트 */}
      {fx.map((f) => (
        <span key={f.id} style={{ position: 'absolute', left: f.x * sc, top: f.y * sc, width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: '50%', background: f.kind === 'debris' ? 'radial-gradient(circle, rgba(120,90,40,0.6), transparent 70%)' : 'radial-gradient(circle, rgba(200,160,90,0.7), transparent 70%)', animation: 'ec-poof .45s ease-out both', pointerEvents: 'none' }} />
      ))}
      <style>{`@keyframes ec-poof{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.2);opacity:0}}`}</style>
    </div>
  )
}

function ToolIcon({ k, color, big }) {
  const s = big ? 30 : 20
  const wrap = (inner) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">{inner}</svg>
  if (k === 'pick') return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M5 19l9-9" /><path d="M14 10a2 2 0 1 0 3-3" fill="none" /></g>)
  if (k === 'suction') return wrap(<g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"><path d="M4 20l7-7" /><path d="M13 7a4 4 0 1 1 4 4l-2 .5" /></g>)
  // forceps
  return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"><path d="M7 4l5 9" /><path d="M17 4l-5 9" /><path d="M12 13v7" /></g>)
}
