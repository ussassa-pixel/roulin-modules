import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 말끔 클리닝 — '그냥 재밌는 것' 코너.
// 파스텔 패치 위의 오돌토돌(여드름)·피지·삐죽 털을 톡톡 정리하는 심심풀이 게임.
// 다 정리하면 '말끔!' 하고 새 패치가 나온다. 자극적이지 않게 스타일라이즈. isMuted 존중.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 32%, #123a3c 0%, #0c2628 68%, #071618 100%)' }
const SKIN = ['#f3d9c4', '#f0d2bd', '#efd8cb', '#f2ddc9']
const TYPES = ['pimple', 'sebum', 'hair']

function makePatch() {
  const n = 7 + Math.floor(Math.random() * 4)
  const items = []
  let tries = 0
  while (items.length < n && tries < 200) {
    tries++
    const x = 14 + Math.random() * 72, y = 14 + Math.random() * 72
    if (items.some((it) => Math.hypot(it.x - x, it.y - y) < 15)) continue
    items.push({ id: Math.random().toString(36).slice(2), type: TYPES[Math.floor(Math.random() * TYPES.length)], x, y, s: 0.8 + Math.random() * 0.6, rot: Math.random() * 360 })
  }
  return items
}

export default function Clean({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [skin, setSkin] = useState(SKIN[0])
  const [items, setItems] = useState([])
  const [fx, setFx] = useState([])
  const [cleared, setCleared] = useState(0)
  const [sparkle, setSparkle] = useState(false)
  const clearedRef = useRef(0)
  const lockRef = useRef(false)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const ac = () => { if (mutedRef.current) return null; try { if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; acRef.current = new C() } if (acRef.current.state === 'suspended') acRef.current.resume(); return acRef.current } catch { return null } }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const sound = (type) => {
    const c = ac(); if (!c) return
    const t = c.currentTime
    if (type === 'pimple') { // 뾱 — 짧게 튀는 사인
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(720, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.09)
      const g = c.createGain(); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.13)
    } else if (type === 'sebum') { // 슉 — 노이즈 스윕
      const l = Math.floor(c.sampleRate * 0.14); const b = c.createBuffer(1, l, c.sampleRate); const d = b.getChannelData(0)
      for (let k = 0; k < l; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / l)
      const s = c.createBufferSource(); s.buffer = b
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.12); bp.Q.value = 1.2
      const g = c.createGain(); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15)
      s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + 0.16)
    } else { // 톡 — 짧은 pluck
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 1400
      const g = c.createGain(); g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.08)
    }
  }

  const begin = () => { clearedRef.current = 0; setCleared(0); setSkin(SKIN[Math.floor(Math.random() * SKIN.length)]); setItems(makePatch()); setFx([]); setSparkle(false); lockRef.current = false; setPhase('play') }

  const remove = (it) => (e) => {
    e.stopPropagation()
    sound(it.type)
    const fxId = it.id
    setFx((f) => [...f, { id: fxId, type: it.type, x: it.x, y: it.y }])
    setTimeout(() => setFx((f) => f.filter((x) => x.id !== fxId)), 600)
    setItems((list) => {
      const next = list.filter((x) => x.id !== it.id)
      if (next.length === 0 && !lockRef.current) {
        lockRef.current = true
        setSparkle(true)
        setTimeout(() => { setSparkle(false); setSkin(SKIN[Math.floor(Math.random() * SKIN.length)]); setItems(makePatch()); lockRef.current = false }, 950)
      }
      return next
    })
    clearedRef.current += 1; setCleared(clearedRef.current)
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>말끔 클리닝</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8">
              <div style={{ width: 88, height: 88, borderRadius: 22, background: `radial-gradient(circle at 40% 35%, #fff6, ${SKIN[0]})`, boxShadow: '0 6px 20px rgba(0,0,0,0.3)', position: 'relative' }}>
                <Spot type="pimple" s={1} rot={0} style={{ left: '32%', top: '40%' }} />
                <Spot type="sebum" s={1} rot={0} style={{ left: '62%', top: '55%' }} />
                <Spot type="hair" s={1} rot={40} style={{ left: '48%', top: '28%' }} />
              </div>
            </div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              오돌토돌·피지·삐죽 털을<br />톡톡 눌러 말끔하게 정리해요.
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
        @keyframes cl-pop{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(0);opacity:0}}
        @keyframes cl-spray{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(var(--tx),var(--ty)) scale(.3);opacity:0}}
        @keyframes cl-shoot{0%{transform:translateY(0) scaleY(.4);opacity:0}30%{opacity:1}100%{transform:translateY(-38px) scaleY(1.3);opacity:0}}
        @keyframes cl-fly{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--tx),-46px) rotate(var(--r));opacity:0}}
        @keyframes cl-clean{0%{transform:scale(.4);opacity:.8}100%{transform:scale(2);opacity:0}}
        @keyframes cl-spk{0%,100%{opacity:0;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="relative select-none" style={{ width: 320, height: 380, borderRadius: 34, background: `radial-gradient(circle at 42% 34%, #ffffff55, ${skin})`, boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.3), 0 10px 34px rgba(0,0,0,0.4)', touchAction: 'none' }}>
            {/* 은은한 모공 텍스처 */}
            <div className="absolute inset-0 rounded-[34px] pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 60%, rgba(0,0,0,0.04) 0 1px, transparent 1px), radial-gradient(circle at 70% 30%, rgba(0,0,0,0.04) 0 1px, transparent 1px)', backgroundSize: '18px 18px, 22px 22px' }} />

            {items.map((it) => (
              <button key={it.id} onPointerDown={remove(it)} aria-label="정리하기"
                style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%,-50%)', padding: 8, margin: -8 }}>
                <Spot type={it.type} s={it.s} rot={it.rot} />
              </button>
            ))}

            {/* 제거 이펙트 */}
            {fx.map((f) => (
              <div key={f.id} style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', animation: 'cl-clean .5s ease-out both' }} />
                {f.type === 'pimple' && Array.from({ length: 6 }).map((_, k) => {
                  const a = (k / 6) * Math.PI * 2
                  return <span key={k} style={{ position: 'absolute', left: -3, top: -3, width: 6, height: 6, borderRadius: '50%', background: '#f5e6d8', '--tx': `${Math.cos(a) * 26}px`, '--ty': `${Math.sin(a) * 26}px`, animation: 'cl-spray .5s ease-out both' }} />
                })}
                {f.type === 'sebum' && <span style={{ position: 'absolute', left: -2, top: -30, width: 4, height: 30, borderRadius: 2, background: 'linear-gradient(to top, #e8d3ba, #fff8ee)', transformOrigin: 'bottom', animation: 'cl-shoot .45s ease-out both' }} />}
                {f.type === 'hair' && <span style={{ position: 'absolute', left: -1, top: -18, width: 2, height: 22, background: '#5b4636', '--tx': `${(Math.random() * 30 - 15).toFixed(0)}px`, '--r': `${(Math.random() * 240 - 120).toFixed(0)}deg`, animation: 'cl-fly .5s ease-out both' }} />}
              </div>
            ))}

            {/* 말끔! */}
            {sparkle && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-serif text-navy text-[30px]" style={{ fontWeight: 600, animation: 'cl-spk .9s ease-in-out both' }}>말끔!</span>
              </div>
            )}
          </div>

          <p className="text-white/45 text-[12px] font-light mt-8">
            {sparkle ? '깨끗해졌어요 · 새 패치가 나와요' : '오돌토돌한 걸 톡 눌러 정리해요'}
            {cleared > 0 && <span className="text-white/30"> · {cleared}개 정리</span>}
          </p>
        </div>
      </div>
    </ModuleFrame>
  )
}

// 오돌토돌(pimple)·피지(sebum)·털(hair)
function Spot({ type, s = 1, rot = 0, style }) {
  if (type === 'pimple') {
    return (
      <span style={{ display: 'block', width: 22 * s, height: 22 * s, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 34%, #ffe3d0 0%, #f2a98f 55%, #d98069 100%)',
        boxShadow: 'inset -2px -3px 5px rgba(150,70,50,0.4), 0 1px 3px rgba(0,0,0,0.2)',
        position: style ? 'absolute' : 'static', transform: style ? 'translate(-50%,-50%)' : 'none', ...style }}>
        <span style={{ position: 'absolute', left: '38%', top: '34%', width: 5 * s, height: 5 * s, borderRadius: '50%', background: '#fff6ec' }} />
      </span>
    )
  }
  if (type === 'sebum') {
    return (
      <span style={{ display: 'block', width: 12 * s, height: 12 * s, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 38%, #b9a68f 0%, #6b5a48 70%, #3e3327 100%)',
        boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5)',
        position: style ? 'absolute' : 'static', transform: style ? 'translate(-50%,-50%)' : 'none', ...style }} />
    )
  }
  // hair — 삐죽한 곡선 털
  return (
    <span style={{ display: 'block', width: 4, height: 26 * s, position: style ? 'absolute' : 'static', transform: `${style ? 'translate(-50%,-50%) ' : ''}rotate(${rot}deg)`, transformOrigin: 'bottom', ...style }}>
      <svg width="8" height={26 * s} viewBox="0 0 8 26" fill="none" aria-hidden="true">
        <path d="M4 26 C 1 18, 7 12, 3 4 C 2.5 2, 4 1, 4 0" stroke="#4a3a2c" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  )
}
