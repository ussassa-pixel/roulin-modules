import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 같이 집중해요 — '집중이 안 될 때' 코너. 바디더블링(혼자 집중이 어려울 때 곁의 존재).
// 작은 친구가 옆에서 같이 집중한다(숨쉬고 촛불이 흔들림). 은은한 방 소리 + 함께한 시간.
// 시간을 정하면 끝에 벨, '계속'이면 열린 채로. 벨은 명상앱 transition-bell 재사용.
const WARM_BG = { background: 'radial-gradient(ellipse at 50% 40%, #2a2118 0%, #1b1610 78%)' }
const DURS = [10, 25, 0] // 0 = 계속(열린)
const STATUS = ['같이 집중하는 중…', '우리 잘하고 있어요', '조금만 더, 같이', '여기 같이 있어요']

export default function FocusTogether({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [remaining, setRemaining] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [statusI, setStatusI] = useState(0)
  const [blink, setBlink] = useState(false)
  const totalRef = useRef(0)
  const endAtRef = useRef(0)
  const startRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null); const ambGainRef = useRef(null); const bellRef = useRef(null)
  const startAmbient = () => {
    if (acRef.current) return
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return
      const c = new C(); acRef.current = c
      const len = Math.floor(c.sampleRate * 2)
      const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0)
      let last = 0
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3 } // 방 톤(브라운 노이즈)
      const s = c.createBufferSource(); s.buffer = buf; s.loop = true
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380
      const g = c.createGain(); g.gain.value = mutedRef.current ? 0 : 0.02; ambGainRef.current = g
      s.connect(lp); lp.connect(g); g.connect(c.destination); s.start()
    } catch { /* noop */ }
  }
  const stopAmbient = () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } acRef.current = null; ambGainRef.current = null }
  const bell = () => {
    if (mutedRef.current) return
    try {
      if (!bellRef.current) bellRef.current = new Audio(import.meta.env.BASE_URL + 'transition-bell.mp3')
      bellRef.current.currentTime = 0; bellRef.current.volume = 0.7; bellRef.current.play().catch(() => {})
    } catch { /* noop */ }
  }
  // 방 소리 음소거 반영
  useEffect(() => {
    if (ambGainRef.current && acRef.current) ambGainRef.current.gain.setTargetAtTime(isMuted ? 0 : 0.02, acRef.current.currentTime, 0.2)
  }, [isMuted])
  useEffect(() => () => stopAmbient(), [])

  const start = (min) => {
    totalRef.current = min * 60
    endAtRef.current = min ? Date.now() + min * 60 * 1000 : 0
    startRef.current = Date.now()
    setRemaining(min * 60); setElapsed(0); setStatusI(0); setPhase('play'); startAmbient()
  }

  useEffect(() => {
    if (phase !== 'play') return
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      if (totalRef.current) {
        const rem = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
        setRemaining(rem)
        if (rem <= 0) { clearInterval(iv); bell(); setPhase('done') }
      }
    }, 400)
    const si = setInterval(() => setStatusI((i) => (i + 1) % STATUS.length), 14000)
    const bl = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 180) }, 5500)
    return () => { clearInterval(iv); clearInterval(si); clearInterval(bl) }
  }, [phase])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const sandFill = totalRef.current ? Math.min(1, 1 - remaining / totalRef.current) : (elapsed % 30) / 30

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={WARM_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>같이 집중해요</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Companion /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              혼자 집중하기 버거울 때,<br />곁에서 같이 집중해 줄게요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">그냥 옆에 있는 것만으로도 도움이 돼요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {DURS.map((m) => (
                <button key={m} onClick={() => start(m)}
                  className="py-4 rounded-2xl bg-white/12 text-white border border-white/25 hover:bg-white/20 transition" style={{ fontWeight: 600 }}>
                  {m ? `${m}분` : '계속'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'play') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <style>{`
          @keyframes ft-flame{0%,100%{transform:scaleY(1) rotate(-1.5deg)}50%{transform:scaleY(1.14) rotate(2deg)}}
          .ft-flame{animation:ft-flame .85s ease-in-out infinite;transform-origin:50% 100%}
          @keyframes ft-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
          .ft-breathe{animation:ft-breathe 4.2s ease-in-out infinite;transform-origin:50% 100%}
          @keyframes ft-glow{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:.85;transform:scale(1.12)}}
          .ft-glow{animation:ft-glow 3.4s ease-in-out infinite}
          @keyframes ft-ember{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.9}100%{transform:translateY(-120px) scale(.4);opacity:0}}
          .ft-ember{animation:ft-ember linear infinite}
          @keyframes ft-fall{0%{transform:translateY(0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(26px);opacity:0}}
          .ft-fall{animation:ft-fall 1.1s linear infinite}
        `}</style>
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6" style={WARM_BG}>
          {/* 배경에 은은히 피어오르는 불티 */}
          {[{ l: '18%', d: 5.5, dl: 0 }, { l: '32%', d: 7, dl: 1.6 }, { l: '58%', d: 6, dl: 0.8 }, { l: '72%', d: 8, dl: 2.4 }, { l: '46%', d: 6.5, dl: 3.3 }].map((e, i) => (
            <span key={i} className="ft-ember absolute rounded-full pointer-events-none" style={{
              left: e.l, bottom: '30%', width: 4, height: 4,
              background: 'radial-gradient(circle,#ffe6a8 0%,#e0a33e 100%)', boxShadow: '0 0 6px 1px rgba(224,163,62,0.6)',
              animationDuration: `${e.d}s`, animationDelay: `${e.dl}s`,
            }} />
          ))}

          {/* 친구 + 모래시계 */}
          <div className="flex items-end justify-center gap-5 mb-10">
            <Companion animate blink={blink} />
            <Hourglass fill={sandFill} />
          </div>

          <p key={statusI} className="text-amber/80 text-[15px] font-light mb-2 animate-fade-in">{STATUS[statusI]}</p>
          <p className="text-white/40 text-[13px] tabular-nums mb-12">
            {totalRef.current ? `남은 시간 ${fmt(remaining)}` : `함께한 시간 ${fmt(elapsed)}`}
          </p>
          <button onClick={() => setPhase('done')} className="px-8 py-3 rounded-full text-white/45 hover:text-white/75 transition text-[13px]">
            먼저 일어날게요
          </button>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    const mins = Math.max(1, Math.round(elapsed / 60))
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={WARM_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><Companion /></div>
            <p className="font-serif text-[28px] text-white mb-2" style={{ fontWeight: 600 }}>같이 잘 집중했어요</p>
            <p className="text-white/70 text-sm font-light mb-12 leading-relaxed">
              {mins}분 동안 곁에 있었어요.<br />언제든 또 같이 해요.
            </p>
            <button onClick={() => start(Math.round(totalRef.current / 60))} className="w-full py-4 bg-white/15 text-white border border-white/25 rounded-full hover:bg-white/25 transition mb-3">또 같이</button>
            <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 곁의 작은 친구 + 촛불
function Companion({ animate = false, blink = false }) {
  return (
    <svg width="176" height="150" viewBox="0 0 176 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 책상 라인 */}
      <rect x="14" y="120" width="148" height="6" rx="3" fill="rgba(255,255,255,0.10)" />
      {/* 촛불 */}
      <g>
        <ellipse cx="135" cy="80" rx="22" ry="16" fill="#f6bd4e" className={animate ? 'ft-glow' : ''} style={{ transformOrigin: '135px 80px' }} />
        <rect x="128" y="92" width="14" height="30" rx="3" fill="#e9ddc4" />
        <rect x="128" y="92" width="6" height="30" rx="3" fill="#fff" opacity="0.35" />
        <rect x="134" y="86" width="2" height="7" fill="#6b5a3a" />
        <g className={animate ? 'ft-flame' : ''}>
          <path d="M135 86 Q131 78 135 70 Q139 78 135 86 Z" fill="#f6bd4e" />
          <path d="M135 84 Q133 79 135 74 Q137 79 135 84 Z" fill="#fff3c4" />
        </g>
      </g>
      {/* 친구(둥근 몸 + 집중한 눈) */}
      <g className={animate ? 'ft-breathe' : ''}>
        <path d="M40 120 C 30 120 26 104 30 90 C 34 70 50 60 66 60 C 82 60 96 72 98 92 C 100 108 94 120 84 120 Z" fill="#c9b7e8" />
        <path d="M40 120 C 34 118 32 106 34 94 C 40 74 54 66 64 66" stroke="#fff" strokeWidth="2" opacity="0.28" fill="none" />
        {/* 눈 — 평소엔 집중한 아래 곡선, 가끔 깜빡 */}
        {blink ? (
          <g stroke="#4a3f63" strokeWidth="2.4" strokeLinecap="round">
            <path d="M50 93 h10" /><path d="M72 91 h10" />
          </g>
        ) : (
          <g stroke="#4a3f63" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M50 92 Q55 96 60 92" /><path d="M72 90 Q77 94 82 90" />
          </g>
        )}
        {/* 볼 */}
        <circle cx="52" cy="102" r="3.5" fill="#f0a3c0" opacity="0.5" />
        <circle cx="82" cy="100" r="3.5" fill="#f0a3c0" opacity="0.5" />
      </g>
    </svg>
  )
}

// 모래시계 — 위 모래가 줄고 아래에 쌓이며, 목에서 모래가 떨어진다(fill 0~1)
function Hourglass({ fill = 0 }) {
  const f = Math.max(0, Math.min(1, fill))
  const topY = 8, neckY = 45, botY = 82, w = 22, cx = 30
  const topSurfY = neckY - (1 - f) * (neckY - topY)
  const hwTop = w * (1 - f)
  const pileSurfY = botY - f * (botY - neckY)
  const hwBot = w * ((pileSurfY - neckY) / (botY - neckY))
  return (
    <svg width="52" height="96" viewBox="0 0 60 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 위/아래 모래 */}
      {f < 1 && <polygon points={`${cx},${neckY} ${cx - hwTop},${topSurfY} ${cx + hwTop},${topSurfY}`} fill="#e0a33e" />}
      {f > 0 && <polygon points={`${cx - w},${botY} ${cx + w},${botY} ${cx + hwBot},${pileSurfY} ${cx - hwBot},${pileSurfY}`} fill="#e0a33e" />}
      {/* 떨어지는 모래 */}
      {f < 1 && (
        <g fill="#f0b654">
          <circle className="ft-fall" cx={cx} cy={neckY + 3} r="1.4" />
          <circle className="ft-fall" cx={cx} cy={neckY + 3} r="1.2" style={{ animationDelay: '.55s' }} />
        </g>
      )}
      {/* 유리 */}
      <path d={`M${cx - w} ${topY} L${cx + w} ${topY} L${cx} ${neckY} L${cx + w} ${botY} L${cx - w} ${botY} L${cx} ${neckY} Z`}
        stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <rect x={cx - w - 2} y={topY - 3} width={w * 2 + 4} height="4" rx="2" fill="#cdb890" />
      <rect x={cx - w - 2} y={botY - 1} width={w * 2 + 4} height="4" rx="2" fill="#cdb890" />
    </svg>
  )
}
