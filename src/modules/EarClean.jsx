import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 귀 청소 — '그냥 재밌는 것' 코너.
// 내시경을 안팎으로 넣다 뺐다(깊이 슬라이더) 하며 귀 속을 탐험하고, 도구를 바꿔 귀지를 파낸다.
// 깊이에 따라 귀지가 다가왔다 지나간다. 맨 안쪽 큰 귀지는 주변을 다 치워야 뽑힌다(그 쾌감).
// 촉촉한 피부/귀지 질감은 SVG 필터로 생생하게(코드 기반, 외부 이미지 0). isMuted 존중.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 28%, #12312f 0%, #0b2422 68%, #071614 100%)' }
const CX = 150, CY = 150
const TOOLS = [
  { key: 'pick', name: '가는 도구', for: 'flake' },
  { key: 'suction', name: '석션', for: 'debris' },
  { key: 'forceps', name: '큰 포셉', for: 'plug' },
]
const PLUG_DEPTH = 1.0 // 큰 귀지는 맨 안쪽 — 끝까지 들어가야 가장 크게 잡힌다

function makeEar() {
  const smalls = []
  const n = 6 + Math.floor(Math.random() * 3)
  for (let i = 0; i < n; i++) {
    smalls.push({
      id: 'p' + i + Math.random().toString(36).slice(2, 6),
      type: Math.random() < 0.5 ? 'flake' : 'debris',
      ang: Math.random() * Math.PI * 2,
      depth: 0.12 + (i / n) * 0.62 + (Math.random() * 0.08 - 0.04),
      size: 15 + Math.random() * 12, rot: Math.random() * 360,
    })
  }
  return smalls
}

// 카메라 깊이 d에서 귀지 p의 화면 상태(다가옴→지나감)
function project(p, d) {
  const a = p.depth - d                       // 앞쪽 거리(+면 아직 안쪽)
  if (a < -0.07) return { hidden: true }
  const near = Math.max(0, Math.min(1, (0.55 - a) / 0.55)) // 0 멀리 → 1 코앞
  const scale = 0.16 + near * 1.35
  const radius = near * 116                    // 멀면 중앙, 가까우면 벽으로
  const x = CX + Math.cos(p.ang) * radius
  const y = CY + Math.sin(p.ang) * radius
  const focused = a > -0.07 && a < 0.14         // 상호작용 가능 구간
  const blur = (1 - near) * 2.4
  return { hidden: false, x, y, scale, opacity: Math.min(1, near * 1.5), focused, blur }
}

export default function EarClean({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [tool, setTool] = useState('pick')
  const [depth, setDepth] = useState(0)
  const [smalls, setSmalls] = useState([])
  const [plugOut, setPlugOut] = useState(false)
  const [pull, setPull] = useState(0)
  const [fx, setFx] = useState([])
  const [hint, setHint] = useState('')
  const toolRef = useRef('pick'); toolRef.current = tool
  const depthRef = useRef(0); depthRef.current = depth
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
    if (kind === 'scrape') { const s = noise(0.12); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 2; const g = c.createGain(); g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13); s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.14) }
    else if (kind === 'suck') { const s = noise(0.34); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(420, t); bp.frequency.exponentialRampToValueAtTime(1700, t + 0.3); bp.Q.value = 1.4; const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34); s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.35) }
    else if (kind === 'grip') { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 320; const g = c.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.06) }
    else if (kind === 'plop') { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(340, t + 0.18); const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.32); const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.setValueAtTime(520, t + 0.16); o2.frequency.exponentialRampToValueAtTime(180, t + 0.3); const g2 = c.createGain(); g2.gain.setValueAtTime(0.16, t + 0.16); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); o2.connect(g2); g2.connect(c.destination); o2.start(t + 0.16); o2.stop(t + 0.34) }
    else if (kind === 'done') { [523, 659, 784].forEach((f, i) => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const g = c.createGain(); const at = t + i * 0.09; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.12, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4); o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + 0.42) }) }
  }

  const showHint = (msg) => { setHint(msg); if (hintT.current) clearTimeout(hintT.current); hintT.current = setTimeout(() => setHint(''), 1500) }
  const addFx = (x, y, kind) => { const id = Math.random().toString(36).slice(2); setFx((f) => [...f, { id, x, y, kind }]); setTimeout(() => setFx((f) => f.filter((z) => z.id !== id)), 550) }

  const begin = () => { setTool('pick'); setDepth(0); depthRef.current = 0; setSmalls(makeEar()); setPlugOut(false); setPull(0); pullRef.current = 0; setFx([]); setHint(''); setPhase('play') }

  const tapSmall = (piece) => (e) => {
    e.stopPropagation()
    const st = project(piece, depthRef.current)
    if (!st.focused) { showHint('내시경을 움직여 초점을 맞춰요'); return }
    const need = piece.type === 'flake' ? 'pick' : 'suction'
    if (toolRef.current !== need) { showHint(need === 'pick' ? '얇은 조각은 가는 도구로 긁어요' : '부스러기는 석션으로 빨아들여요'); return }
    sound(piece.type === 'flake' ? 'scrape' : 'suck')
    addFx(st.x, st.y, piece.type)
    setSmalls((list) => list.filter((z) => z.id !== piece.id))
  }

  const smallLeft = smalls.length
  const plugSt = (() => { const a = PLUG_DEPTH - depth; return { a, near: a < 0.16, scale: 0.3 + Math.max(0, 1 - a / PLUG_DEPTH) * 1.5, visible: a > -0.05 } })()

  const startPull = (e) => {
    e.stopPropagation()
    if (plugOut) return
    if (toolRef.current !== 'forceps') { showHint('큰 귀지는 큰 포셉으로 집어요'); return }
    if (!plugSt.near) { showHint('더 깊이 들어가 큰 귀지에 다가가요'); return }
    if (smallLeft > 0) { showHint('주변 귀지부터 정리해요'); return }
    if (pullIv.current) return
    sound('grip')
    pullIv.current = setInterval(() => {
      pullRef.current = Math.min(1, pullRef.current + 0.045)
      setPull(pullRef.current)
      if (pullRef.current >= 1) { clearInterval(pullIv.current); pullIv.current = null; finishPlug() }
    }, 40)
  }
  const endPull = () => { if (pullIv.current) { clearInterval(pullIv.current); pullIv.current = null } if (!plugOut && pullRef.current < 1) { pullRef.current = 0; setPull(0) } }
  const finishPlug = () => { sound('plop'); setPlugOut(true); setPull(1); setTimeout(() => { sound('done'); setPhase('done') }, 750) }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>귀 청소</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><EarView smalls={makeEar()} depth={0.35} plugOut={false} pull={0} small /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              내시경을 넣었다 뺐다 하며 귀 속을 보고,<br />도구를 바꿔 귀지를 하나씩 파내요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">주변부터 정리하고, 맨 안쪽 큰 귀지는 포셉으로 쑥.</p>
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
            <div className="flex justify-center mb-7"><EarView smalls={[]} depth={PLUG_DEPTH} plugOut pull={1} small /></div>
            <p className="font-serif text-[26px] text-white mb-2" style={{ fontWeight: 600 }}>말끔하게 뚫렸어요</p>
            <p className="text-white/65 text-sm font-light mb-11 leading-relaxed">큰 귀지까지 쑥. 아, 시원하다.<br />또 하나 파러 갈까요?</p>
            <button onClick={begin} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">새 귀 파기</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  const defaultHint = smallLeft > 0
    ? '슬라이더로 들어가며 귀지를 파내요'
    : plugSt.near ? '이제 큰 포셉으로 큰 귀지를 꾹!' : '더 깊이 들어가 큰 귀지로 다가가요'

  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG} onPointerUp={endPull} onPointerLeave={endPull}>
        <div className="max-w-md w-full flex flex-col items-center">
          <p className="text-white/60 text-[12px] h-5 mb-2">{hint || defaultHint}</p>

          <EarView
            smalls={smalls} depth={depth} onTapSmall={tapSmall} onPullPlug={startPull}
            plugOut={plugOut} pull={pull} tool={tool} fx={fx} plugSt={plugSt} plugReady={smallLeft === 0}
          />

          {/* 내시경 깊이 슬라이더 (밖 ↔ 안) */}
          <div className="w-full max-w-[300px] mt-5">
            <div className="flex items-center gap-3">
              <span className="text-white/45 text-[11px] w-7 text-right">밖</span>
              <input type="range" min="0" max="100" value={Math.round(depth * 100)}
                onChange={(e) => setDepth(Number(e.target.value) / 100)}
                className="flex-1" style={{ accentColor: '#5fe0d4' }} aria-label="내시경 깊이" />
              <span className="text-white/45 text-[11px] w-7">안</span>
            </div>
            <p className="text-center text-white/30 text-[11px] mt-1">깊이 {Math.round(depth * 100)} · 남은 귀지 {smallLeft + (plugOut ? 0 : 1)}개</p>
          </div>

          {/* 도구 */}
          <div className="flex items-center justify-center gap-2.5 mt-4">
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
        </div>
      </div>
    </ModuleFrame>
  )
}

// 내시경 시야
function EarView({ smalls, depth = 0, onTapSmall, onPullPlug, plugOut = false, pull = 0, tool, fx = [], plugSt, plugReady = false, small = false }) {
  const D = small ? 158 : 300
  const sc = D / 300
  const ps = plugSt || (() => { const a = PLUG_DEPTH - depth; return { a, near: a < 0.16, scale: 0.3 + Math.max(0, 1 - a / PLUG_DEPTH) * 1.5, visible: a > -0.05 } })()
  const advance = 1 + depth * 0.4 // 들어갈수록 전진감(확대)
  return (
    <div className="relative" style={{ width: D, height: D, borderRadius: '50%', overflow: 'hidden', touchAction: 'none', boxShadow: '0 0 0 3px rgba(90,220,210,0.22), 0 0 30px 5px rgba(0,0,0,0.55)' }}>
      {/* 촉촉한 귀 canal — 전진감에 따라 확대 */}
      <div className="absolute inset-0" style={{ transform: `scale(${advance})`, transformOrigin: '50% 46%', transition: 'transform .25s ease-out' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 46%, #26100b 0%, #5e281c 26%, #9a4c37 48%, #c67a5f 70%, #e6a488 100%)' }} />
        {/* 피부 결/모공 노이즈 */}
        <svg className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'soft-light', opacity: 0.55 }} aria-hidden="true">
          <filter id="ec-skin"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#ec-skin)" />
        </svg>
        {/* 혈관 붉은 기 */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 62% 60%, rgba(190,70,60,0.28), transparent 42%), radial-gradient(circle at 34% 40%, rgba(180,60,55,0.2), transparent 38%)' }} />
        {/* 주름 링 */}
        <div className="absolute inset-0" style={{ background: 'repeating-radial-gradient(circle at 50% 46%, rgba(90,40,32,0.16) 0 5px, transparent 5px 12px)', opacity: 0.7 }} />
        {/* 촉촉한 반사(내시경 조명) — 강조: 넓은 젖은 광택 + 선명한 글레어 */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 34% 26% at 42% 36%, rgba(255,248,238,0.62), transparent 58%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle 7% at 40% 33%, rgba(255,255,255,0.85), transparent 60%)' }} />
      </div>
      {/* 내시경 비네트 + 렌즈 */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 50px 16px rgba(0,0,0,0.6)', borderRadius: '50%' }} />

      <svg width={D} height={D} viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ec-wax" cx="0.4" cy="0.3" r="0.85"><stop offset="0" stopColor="#e0ad55" /><stop offset="0.42" stopColor="#ac7830" /><stop offset="0.78" stopColor="#7a5222" /><stop offset="1" stopColor="#4e3416" /></radialGradient>
          <radialGradient id="ec-plug" cx="0.42" cy="0.28" r="0.88"><stop offset="0" stopColor="#d69f47" /><stop offset="0.4" stopColor="#a06e2b" /><stop offset="0.74" stopColor="#6b471f" /><stop offset="1" stopColor="#3c2712" /></radialGradient>
          <filter id="ec-goo"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="6" /></filter>
        </defs>

        {(plugOut || pull > 0.3) && <circle cx={CX} cy={CY} r={30} fill="#160a06" />}

        {/* 큰 귀지 */}
        {!plugOut && ps.visible && (
          <g transform={`translate(${CX} ${CY - pull * 66}) scale(${ps.scale + pull * 0.4})`} onPointerDown={onPullPlug} style={{ cursor: 'pointer', transition: 'transform .25s ease-out' }}>
            <ellipse cx="0" cy="3" rx="30" ry="26" fill="rgba(0,0,0,0.32)" />
            <g filter="url(#ec-goo)">
              <path d="M-28 -6 Q -30 -25 -8 -27 Q 7 -31 21 -22 Q 33 -13 28 5 Q 31 23 8 27 Q -13 31 -25 16 Q -33 6 -28 -6 Z" fill="url(#ec-plug)" stroke="rgba(56,36,14,0.6)" strokeWidth="1.5" />
            </g>
            <path d="M-16 -11 Q 0 -17 16 -9" stroke="rgba(40,26,10,0.55)" strokeWidth="2" fill="none" />
            <path d="M-18 6 Q 0 13 18 4" stroke="rgba(40,26,10,0.45)" strokeWidth="2" fill="none" />
            {/* 젖은 조명 반사 — 넓은 광택 + 선명한 핫스팟 */}
            <ellipse cx="-9" cy="-11" rx="11" ry="6.5" fill="rgba(255,246,215,0.5)" />
            <ellipse cx="-11" cy="-13" rx="4" ry="3" fill="rgba(255,255,255,0.95)" />
            <ellipse cx="9" cy="9" rx="5.5" ry="3" fill="rgba(255,244,205,0.34)" />
            <circle cx="8" cy="8" r="1.6" fill="rgba(255,255,255,0.8)" />
            {plugReady && ps.near && <ellipse cx="0" cy="0" rx="34" ry="30" fill="none" stroke="rgba(95,224,212,0.85)" strokeWidth="2" strokeDasharray="4 5" />}
          </g>
        )}

        {/* 뽑는 포셉 */}
        {tool === 'forceps' && pull > 0 && !plugOut && (
          <g transform={`translate(${CX} ${CY - pull * 66})`}>
            <path d="M-12 -34 L -4 -6" stroke="#c9ccd2" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 -34 L 4 -6" stroke="#c9ccd2" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* 작은 귀지들(깊이 투영) */}
        {smalls.map((p, i) => {
          const st = project(p, depth)
          if (st.hidden) return null
          return (
            <g key={p.id || `s${i}`} transform={`translate(${st.x} ${st.y}) scale(${st.scale}) rotate(${p.rot})`}
              onPointerDown={onTapSmall ? onTapSmall(p) : undefined}
              style={{ cursor: st.focused ? 'pointer' : 'default', opacity: st.opacity, filter: st.blur > 0.3 ? `blur(${st.blur}px)` : undefined, transition: 'transform .25s ease-out, opacity .25s ease-out' }}>
              <g filter="url(#ec-goo)">
                {p.type === 'flake' ? (
                  <path d={`M${-p.size / 2} 0 Q 0 ${-p.size * 0.72} ${p.size / 2} 0 Q 0 ${p.size * 0.5} ${-p.size / 2} 0 Z`} fill="url(#ec-wax)" stroke="rgba(66,42,16,0.5)" strokeWidth="1" />
                ) : (
                  <g fill="url(#ec-wax)">
                    <circle cx="0" cy="0" r={p.size * 0.34} />
                    <circle cx={p.size * 0.34} cy={p.size * 0.12} r={p.size * 0.24} />
                    <circle cx={-p.size * 0.28} cy={p.size * 0.2} r={p.size * 0.22} />
                    <circle cx={p.size * 0.1} cy={-p.size * 0.3} r={p.size * 0.2} />
                  </g>
                )}
              </g>
              {/* 젖은 조명 반사 — 넓은 광택 + 선명한 핫스팟 */}
              <ellipse cx={-p.size * 0.16} cy={-p.size * 0.2} rx={p.size * 0.22} ry={p.size * 0.13} fill="rgba(255,246,215,0.55)" />
              <circle cx={-p.size * 0.2} cy={-p.size * 0.24} r={p.size * 0.08} fill="rgba(255,255,255,0.95)" />
            </g>
          )
        })}
      </svg>

      {fx.map((f) => (
        <span key={f.id} style={{ position: 'absolute', left: f.x * sc, top: f.y * sc, width: 22, height: 22, marginLeft: -11, marginTop: -11, borderRadius: '50%', background: f.kind === 'debris' ? 'radial-gradient(circle, rgba(120,90,40,0.6), transparent 70%)' : 'radial-gradient(circle, rgba(210,170,95,0.75), transparent 70%)', animation: 'ec-poof .45s ease-out both', pointerEvents: 'none' }} />
      ))}
      <style>{`@keyframes ec-poof{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.3);opacity:0}}`}</style>
    </div>
  )
}

function ToolIcon({ k, color }) {
  const s = 20
  const wrap = (inner) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">{inner}</svg>
  if (k === 'pick') return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M5 19l9-9" /><path d="M14 10a2 2 0 1 0 3-3" fill="none" /></g>)
  if (k === 'suction') return wrap(<g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"><path d="M4 20l7-7" /><path d="M13 7a4 4 0 1 1 4 4l-2 .5" /></g>)
  return wrap(<g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"><path d="M7 4l5 9" /><path d="M17 4l-5 9" /><path d="M12 13v7" /></g>)
}
