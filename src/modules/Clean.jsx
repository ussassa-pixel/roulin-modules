import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 말끔 클리닝 — '그냥 재밌는 것' 코너.
// 꾹 눌러 추출하는 심심풀이. 여드름=오래 누르면 속 덩어리가 쑥, 피지=검은 점에서
// 노랗고 긴 덩어리가 쭉, 털=뿌리까지 천천히 뽑힘. 코드 기반이라 '실사풍' 그라데이션.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 30%, #14312e 0%, #0c2422 68%, #071614 100%)' }
const SKINS = ['#e7b192', '#e9b593', '#e0a17e', '#edc0a2']
const TYPES = ['pimple', 'sebum', 'hair']
const HOLD_STEP = 0.05 // 40ms마다 진행 → 약 0.8초 홀드

function makePatch() {
  const n = 6 + Math.floor(Math.random() * 4)
  const items = []
  let tries = 0
  while (items.length < n && tries < 200) {
    tries++
    const x = 16 + Math.random() * 68, y = 16 + Math.random() * 68
    if (items.some((it) => Math.hypot(it.x - x, it.y - y) < 17)) continue
    items.push({ id: Math.random().toString(36).slice(2), type: TYPES[Math.floor(Math.random() * TYPES.length)], x, y, s: 0.9 + Math.random() * 0.5, rot: Math.random() * 50 - 25 })
  }
  return items
}

export default function Clean({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [skin, setSkin] = useState(SKINS[0])
  const [items, setItems] = useState([])
  const [fx, setFx] = useState([])
  const [cleared, setCleared] = useState(0)
  const [sparkle, setSparkle] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [prog, setProg] = useState(0)
  const clearedRef = useRef(0)
  const lockRef = useRef(false)
  const activeRef = useRef(null)
  const progRef = useRef(0)
  const holdIv = useRef(null)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { if (holdIv.current) clearInterval(holdIv.current); try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const pop = (type) => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    if (type === 'pimple') { // 뾱 — 눌려 터지는
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(640, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.11)
      const g = c.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.15)
    } else if (type === 'sebum') { // 쭈욱 — 길게 밀려나오는
      const l = Math.floor(c.sampleRate * 0.24); const b = c.createBuffer(1, l, c.sampleRate); const d = b.getChannelData(0)
      for (let k = 0; k < l; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / l)
      const s = c.createBufferSource(); s.buffer = b
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.22); bp.Q.value = 1.4
      const g = c.createGain(); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.25)
    } else { // 쑥 — 뽑히는 톡
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.05)
      const g = c.createGain(); g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.11)
    }
  }

  const stopHold = () => { if (holdIv.current) { clearInterval(holdIv.current); holdIv.current = null } }

  const startHold = (it) => (e) => {
    e.stopPropagation()
    if (lockRef.current || activeRef.current) return
    activeRef.current = it; setActiveId(it.id); progRef.current = 0; setProg(0)
    holdIv.current = setInterval(() => {
      progRef.current = Math.min(1, progRef.current + HOLD_STEP)
      setProg(progRef.current)
      if (progRef.current >= 1) { stopHold(); finish(it) }
    }, 40)
  }
  const endHold = () => {
    if (!activeRef.current) return
    stopHold()
    if (progRef.current < 1) { activeRef.current = null; setActiveId(null); setProg(0) } // 덜 눌러서 도로 들어감
  }

  const finish = (it) => {
    pop(it.type)
    const fxId = it.id
    setFx((f) => [...f, { id: fxId, type: it.type, x: it.x, y: it.y, rot: it.rot }])
    setTimeout(() => setFx((f) => f.filter((x) => x.id !== fxId)), 700)
    activeRef.current = null; setActiveId(null); setProg(0)
    setItems((list) => {
      const next = list.filter((x) => x.id !== it.id)
      if (next.length === 0 && !lockRef.current) {
        lockRef.current = true; setSparkle(true)
        setTimeout(() => { setSparkle(false); setSkin(SKINS[Math.floor(Math.random() * SKINS.length)]); setItems(makePatch()); lockRef.current = false }, 950)
      }
      return next
    })
    clearedRef.current += 1; setCleared(clearedRef.current)
  }

  const begin = () => { clearedRef.current = 0; setCleared(0); setSkin(SKINS[Math.floor(Math.random() * SKINS.length)]); setItems(makePatch()); setFx([]); setSparkle(false); lockRef.current = false; activeRef.current = null; setActiveId(null); setProg(0); setPhase('play') }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>말끔 클리닝</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8">
              <div style={{ width: 96, height: 96, borderRadius: 24, background: `radial-gradient(circle at 38% 30%, #f6d8c2, ${SKINS[0]} 62%, #d69a78 100%)`, boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.35), inset 0 -6px 14px rgba(150,90,60,0.25), 0 6px 20px rgba(0,0,0,0.3)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '30%', top: '38%' }}><Spot type="pimple" s={1.1} rot={0} p={0.6} active /></div>
                <div style={{ position: 'absolute', left: '64%', top: '58%' }}><Spot type="sebum" s={1.1} rot={0} p={0.55} active /></div>
                <div style={{ position: 'absolute', left: '50%', top: '26%' }}><Spot type="hair" s={1.1} rot={30} p={0.4} active /></div>
              </div>
            </div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              여드름은 <b className="text-white/90">꾹 오래</b> 눌러 속을 쏙,<br />피지는 검은 점에서 쭈욱, 털은 뿌리째 쑥.
            </p>
            <p className="text-[12px] text-white/45 mb-10">다 정리하면 새 패치가 나와요. 그냥 손이 가는 재미예요.</p>
            <button onClick={begin}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              정리하러 가기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <style>{`
        @keyframes cl-core{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-42px) scale(.5);opacity:0}}
        @keyframes cl-plug{0%{transform:translateY(0) scaleY(1) rotate(0);opacity:1}100%{transform:translateY(-56px) scaleY(1.05) rotate(10deg);opacity:0}}
        @keyframes cl-hairout{0%{transform:translate(0,0) rotate(var(--r0));opacity:1}100%{transform:translate(var(--tx),-54px) rotate(var(--r));opacity:0}}
        @keyframes cl-mark{0%{opacity:.55;transform:scale(.8)}100%{opacity:0;transform:scale(1.9)}}
        @keyframes cl-spk{0%,100%{opacity:0;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
        <div className="max-w-md w-full flex flex-col items-center">
          <div
            className="relative select-none"
            style={{ width: 320, height: 380, borderRadius: 34, background: `radial-gradient(circle at 40% 30%, #f7dcc7 0%, ${skin} 58%, #cf9270 100%)`, boxShadow: 'inset 0 4px 22px rgba(255,255,255,0.35), inset 0 -10px 26px rgba(150,90,60,0.28), 0 12px 36px rgba(0,0,0,0.42)', touchAction: 'none', overflow: 'hidden' }}
            onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
          >
            {/* 실사 피부 노이즈(모공/결) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'soft-light', opacity: 0.55 }} aria-hidden="true">
              <filter id="cl-skin"><feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
              <rect width="100%" height="100%" filter="url(#cl-skin)" />
            </svg>
            {/* 모공 점 텍스처 */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 25% 55%, rgba(120,60,40,0.10) 0 1.2px, transparent 1.6px), radial-gradient(circle at 68% 32%, rgba(120,60,40,0.08) 0 1.2px, transparent 1.6px), radial-gradient(circle at 45% 75%, rgba(120,60,40,0.07) 0 1px, transparent 1.4px)', backgroundSize: '15px 15px, 19px 21px, 13px 14px', opacity: 0.6 }} />
            {/* 은은한 홍조 */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 60% 65%, rgba(210,110,90,0.18), transparent 45%)' }} />

            {items.map((it) => {
              const p = activeId === it.id ? prog : 0
              return (
                <button key={it.id} onPointerDown={startHold(it)} aria-label="정리하기"
                  style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%,-50%)', padding: 12, margin: -12, background: 'none', border: 'none' }}>
                  {/* 홀드 진행 링 */}
                  {p > 0 && p < 1 && (
                    <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
                      <circle cx="23" cy="23" r="20" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - p)}`} transform="rotate(-90 23 23)" />
                    </svg>
                  )}
                  <Spot type={it.type} s={it.s} rot={it.rot} p={p} active={activeId === it.id} />
                </button>
              )
            })}

            {/* 추출 이펙트 */}
            {fx.map((f) => (
              <div key={f.id} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,110,90,0.5), transparent 70%)', animation: 'cl-mark .6s ease-out both' }} />
                {f.type === 'pimple' && (
                  <>
                    {/* 튀어나온 고름 덩어리 */}
                    <span style={{ position: 'absolute', left: -5, top: -22, width: 10, height: 24, borderRadius: '5px', background: 'linear-gradient(to top, #d9c274 0%, #f3e6a2 45%, #fbf4d4 100%)', boxShadow: '0 0 4px rgba(180,150,70,0.5)', transformOrigin: 'bottom', animation: 'cl-core .55s ease-out both' }} />
                    {/* 짜낸 자리(붉고 젖은 자국) */}
                    <span style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: '50%', background: 'radial-gradient(circle at 40% 36%, rgba(230,150,120,0.9), rgba(200,90,70,0.7) 70%)', boxShadow: 'inset 0 0 3px rgba(150,50,40,0.6)', animation: 'cl-mark .6s ease-out both' }} />
                  </>
                )}
                {f.type === 'sebum' && <span style={{ position: 'absolute', left: -3.5, top: -40, width: 7, height: 40, borderRadius: 4, transformOrigin: 'bottom', background: 'linear-gradient(to top, #6b5636 0%, #d8c24a 30%, #efe08a 80%, #2a2018 100%)', boxShadow: '0 0 3px rgba(0,0,0,0.3)', animation: 'cl-plug .6s ease-out both' }} />}
                {f.type === 'hair' && <span style={{ position: 'absolute', left: -2, top: -30, width: 4, height: 34, '--tx': `${(Math.random() * 34 - 17).toFixed(0)}px`, '--r': `${(Math.random() * 300 - 150).toFixed(0)}deg`, '--r0': '0deg', animation: 'cl-hairout .6s ease-out both' }}>
                  <Hair s={1.2} withRoot />
                </span>}
              </div>
            ))}

            {sparkle && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-serif text-[#5a3b28] text-[32px]" style={{ fontWeight: 700, textShadow: '0 1px 2px rgba(255,255,255,0.5)', animation: 'cl-spk .9s ease-in-out both' }}>말끔!</span>
              </div>
            )}
          </div>

          <p className="text-white/45 text-[12px] font-light mt-8">
            {sparkle ? '깨끗해졌어요 · 새 패치가 나와요' : '꾹 눌러서 쏙 빼내요'}
            {cleared > 0 && <span className="text-white/30"> · {cleared}개 정리</span>}
          </p>
        </div>
      </div>
    </ModuleFrame>
  )
}

// ── 개별 블레미시 (p: 추출 진행 0~1) ──
function Spot({ type, s = 1, rot = 0, p = 0, active = false }) {
  if (type === 'pimple') return <Pimple s={s} p={p} />

  if (type === 'sebum') {
    const plugH = p * 30 * s
    return (
      <span style={{ display: 'block', position: 'relative', width: 16 * s, height: 16 * s }}>
        {/* 모공(약간 파임) */}
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 42% 40%, #d69a78 0%, #b9744f 70%, #9a5c3c 100%)', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.35)' }} />
        {/* 밀려나오는 노란 피지 덩어리 */}
        {p > 0.03 && (
          <span style={{ position: 'absolute', left: '50%', bottom: '46%', width: 6 * s, height: plugH, marginLeft: -3 * s, transformOrigin: 'bottom', transform: 'translateX(-50%)', borderRadius: 3 * s, background: 'linear-gradient(to top, #6b5636 0%, #cbb44a 26%, #efe08a 78%, #2a2018 100%)', boxShadow: '0 0 2px rgba(0,0,0,0.3)' }} />
        )}
        {/* 검은 산화 점(안 눌렀을 때 표면) */}
        <span style={{ position: 'absolute', left: '50%', top: '42%', width: 7 * s, height: 7 * s, marginLeft: -3.5 * s, marginTop: -3.5 * s, borderRadius: '50%', background: 'radial-gradient(circle at 40% 38%, #4a3a2a, #241c14 70%, #120d08)', opacity: 1 - p * 0.6 }} />
      </span>
    )
  }
  // hair — 누를수록 뿌리까지 올라옴
  const rise = p * 20 * s
  return (
    <span style={{ display: 'block', position: 'relative', width: 12 * s, height: 30 * s }}>
      {/* 모공 자국 */}
      <span style={{ position: 'absolute', left: '50%', bottom: 0, width: 5 * s, height: 5 * s, marginLeft: -2.5 * s, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,70,50,0.5), transparent 70%)' }} />
      <span style={{ position: 'absolute', left: '50%', bottom: 0, transform: `translate(-50%, ${-rise}px) rotate(${rot}deg)`, transformOrigin: 'bottom' }}>
        <Hair s={s} withRoot={p > 0.35} />
      </span>
    </span>
  )
}

// 여드름 — 짤수록(p) 압박 자국·화이트헤드 부풀기·고름 가닥 밀려나옴
function Pimple({ s = 1, p = 0 }) {
  const w = 44 * s, h = 60 * s
  const strandH = p * 22        // 밀려나온 고름 길이
  const headR = 3 + p * 3.4     // 화이트헤드 크기
  const uid = 'pm'              // 그라데이션 id는 공유(정적 색이라 충돌 없음)
  return (
    <svg width={w} height={h} viewBox="0 0 44 60" fill="none" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#d75a3c" stopOpacity="0.55" /><stop offset="1" stopColor="#d75a3c" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${uid}-dome`} cx="0.4" cy="0.32" r="0.72"><stop offset="0" stopColor="#f6cdb2" /><stop offset="0.55" stopColor="#e59c7d" /><stop offset="1" stopColor="#cc6f52" /></radialGradient>
        <radialGradient id={`${uid}-head`} cx="0.42" cy="0.35" r="0.7"><stop offset="0" stopColor="#fffae8" /><stop offset="0.6" stopColor="#f5e6a4" /><stop offset="1" stopColor="#e6cf72" /></radialGradient>
        <linearGradient id={`${uid}-pus`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#d9c274" /><stop offset="0.45" stopColor="#f3e6a2" /><stop offset="1" stopColor="#fbf4d4" /></linearGradient>
        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="0.7" /></filter>
      </defs>
      {/* 염증 후광 — 짤수록 붉어짐 */}
      <ellipse cx="22" cy="42" rx={17} ry={16} fill={`url(#${uid}-halo)`} opacity={0.5 + p * 0.45} />
      {/* 부풀어 오른 피부 돔 */}
      <ellipse cx="22" cy="42" rx={13} ry={12.5} fill={`url(#${uid}-dome)`} />
      {/* 압박 자국(하얗게 질림) — 좌우 */}
      {p > 0.05 && (
        <>
          <ellipse cx="9" cy="42" rx="4.2" ry="9" fill="#f5ddca" opacity={p * 0.75} filter={`url(#${uid}-soft)`} />
          <ellipse cx="35" cy="42" rx="4.2" ry="9" fill="#f5ddca" opacity={p * 0.75} filter={`url(#${uid}-soft)`} />
        </>
      )}
      {/* 밀려나오는 고름 가닥 */}
      {p > 0.12 && (
        <path d={`M22 40 q ${2.5} ${-strandH * 0.5} 0 ${-strandH}`} stroke={`url(#${uid}-pus)`} strokeWidth={5.4 * s} strokeLinecap="round" fill="none" />
      )}
      {/* 화이트헤드(모공 입구) */}
      <circle cx="22" cy="40" r={headR} fill={`url(#${uid}-head)`} />
      {/* 젖은 유광 하이라이트 */}
      <ellipse cx="16" cy="35" rx="3.4" ry="2.2" fill="#ffffff" opacity="0.6" filter={`url(#${uid}-soft)`} />
    </svg>
  )
}

// 털 한 올(뿌리 옵션)
function Hair({ s = 1, withRoot = false }) {
  return (
    <svg width={10 * s} height={34 * s} viewBox="0 0 10 34" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M5 34 C 2 25, 8 18, 4 9 C 3 5, 5 3, 5 0" stroke="url(#hairg)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {withRoot && <ellipse cx="5" cy="33" rx="3.4" ry="4.6" fill="rgba(240,228,214,0.92)" stroke="rgba(180,150,130,0.6)" strokeWidth="0.6" />}
      <defs>
        <linearGradient id="hairg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a5238" /><stop offset="1" stopColor="#3a2c1e" /></linearGradient>
      </defs>
    </svg>
  )
}
