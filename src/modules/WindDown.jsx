import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 스르르 — '잠이 안 올 때' 코너.
// 고른 시간 동안 화면이 서서히 어두워지고, 빗소리가 아주 천천히 잦아든다.
// 아무것도 안 해도 되는 순수 와인드다운. 달빛이 조용히 작아지며 잠으로 데려간다.
const NIGHT_BG = { background: 'radial-gradient(ellipse at 50% 32%, #16203c 0%, #0a1024 65%, #05070f 100%)' }
const DURS = [5, 10, 15]

export default function WindDown({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [p, setP] = useState(0) // 0→1 진행
  const endRef = useRef(0)
  const totalRef = useRef(0)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const audioRef = useRef(null)

  const buildAudio = () => {
    if (audioRef.current || mutedRef.current) return
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return
      const ctx = new C()
      const master = ctx.createGain(); master.gain.value = 0.16; master.connect(ctx.destination)
      // 부드러운 빗소리 — 브라운 노이즈 + 로우패스
      const len = Math.floor(ctx.sampleRate * 2); const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0)
      let last = 0
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2 }
      const s = ctx.createBufferSource(); s.buffer = b; s.loop = true
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 620
      s.connect(lp); lp.connect(master); s.start()
      audioRef.current = { ctx, master }
    } catch { /* noop */ }
  }
  const stopAudio = () => { const a = audioRef.current; if (a) { try { a.ctx.close() } catch { /* noop */ } audioRef.current = null } }
  useEffect(() => () => stopAudio(), [])
  useEffect(() => {
    const a = audioRef.current; if (a) a.master.gain.setTargetAtTime(isMuted ? 0 : 0.16 * (1 - p), a.ctx.currentTime, 0.3)
  }, [isMuted, p])

  const start = (min) => {
    totalRef.current = min * 60000
    endRef.current = Date.now() + totalRef.current
    setP(0); setPhase('play'); buildAudio()
  }

  useEffect(() => {
    if (phase !== 'play') return
    const iv = setInterval(() => {
      const remain = endRef.current - Date.now()
      const prog = Math.min(1, 1 - remain / totalRef.current)
      setP(prog)
      // 소리도 진행에 맞춰 잦아듦
      const a = audioRef.current; if (a && !mutedRef.current) a.master.gain.setTargetAtTime(0.16 * (1 - prog), a.ctx.currentTime, 0.5)
      if (prog >= 1) { clearInterval(iv); setPhase('done') }
    }, 250)
    return () => clearInterval(iv)
  }, [phase])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={NIGHT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>스르르</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="flex justify-center mb-8"><Moon glow={1} /></div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              정한 시간 동안 화면이 천천히 어두워지고,<br />빗소리가 스르르 잦아들어요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">아무것도 안 해도 돼요. 그냥 눕거나 눈을 감아 보세요.</p>
            <div className="grid grid-cols-3 gap-2.5">
              {DURS.map((m) => (
                <button key={m} onClick={() => start(m)}
                  className="py-4 rounded-2xl bg-white/12 text-white border border-white/25 hover:bg-white/20 transition" style={{ fontWeight: 600 }}>
                  {m}분
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#04060d' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-7"><Moon glow={0.3} /></div>
            <p className="font-serif text-[24px] text-white/85 mb-2" style={{ fontWeight: 600 }}>이제 눈을 감아도 돼요</p>
            <p className="text-white/50 text-sm font-light mb-12 leading-relaxed">여기까지 와줘서 고마워요.<br />푹 쉬어요.</p>
            <button onClick={() => start(Math.round(totalRef.current / 60000))} className="w-full py-4 bg-white/12 text-white/80 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">한 번 더</button>
            <button onClick={onExit} className="w-full py-4 bg-white/85 text-navy rounded-full hover:bg-white transition" style={{ fontWeight: 600 }}>닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // play — 진행에 따라 달이 작아지고 하늘이 짙어짐
  const moonGlow = 1 - p * 0.8
  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={NIGHT_BG}>
        <div className="absolute inset-0 pointer-events-none transition-[background-color] duration-1000" style={{ background: `rgba(3,4,10,${p * 0.82})` }} />
        <div className="relative flex flex-col items-center" style={{ transform: `scale(${1 - p * 0.28})`, transition: 'transform 1s ease' }}>
          <Moon glow={moonGlow} />
        </div>
        <p className="absolute bottom-12 text-white/30 text-[12px] font-light transition-opacity duration-1000" style={{ opacity: 1 - p * 0.9 }}>
          숨을 길게 내쉬며, 몸을 무겁게 두어요
        </p>
      </div>
    </ModuleFrame>
  )
}

function Moon({ glow = 1 }) {
  const g = Math.max(0.15, glow)
  return (
    <div style={{
      width: 88, height: 88, borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 34%, #fdf6e3 0%, #f4e4b8 42%, #cbb988 100%)',
      boxShadow: `0 0 ${30 * g}px ${8 * g}px rgba(244,228,184,${0.45 * g}), inset -14px -10px 22px rgba(90,80,55,0.35)`,
      transition: 'box-shadow 1s ease',
    }} />
  )
}
