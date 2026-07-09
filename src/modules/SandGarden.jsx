import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function SandGarden({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const audioRef = useRef(null) // { ctx, gain, filter }

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawSandBackground(ctx, canvas.offsetWidth, canvas.offsetHeight)
  }

  // ── 실사풍 모래 바닥 ──────────────────────────────────────────
  const drawSandBackground = (ctx, w, h) => {
    // 따뜻한 모래 베이스(위가 살짝 밝음)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#efe3c8')
    g.addColorStop(0.5, '#e7d8b6')
    g.addColorStop(1, '#dcc9a1')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // 굵은 모래 알갱이(밝은 알 + 그림자 알을 나란히 → 입체감)
    const grains = Math.floor((w * h) / 90)
    for (let i = 0; i < grains; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const s = 0.8 + Math.random() * 2.2
      const t = Math.random()
      if (t < 0.5) ctx.fillStyle = `rgba(255,250,235,${0.12 + Math.random() * 0.28})` // 하이라이트 알
      else if (t < 0.82) ctx.fillStyle = `rgba(168,142,98,${0.10 + Math.random() * 0.22})` // 그림자 알
      else ctx.fillStyle = `rgba(120,96,58,${0.08 + Math.random() * 0.14})` // 짙은 알
      ctx.beginPath()
      ctx.arc(x, y, s, 0, Math.PI * 2)
      ctx.fill()
    }

    // 부드러운 상단 광 + 가장자리 비네트
    const light = ctx.createRadialGradient(w * 0.5, h * 0.28, 0, w * 0.5, h * 0.28, Math.max(w, h) * 0.75)
    light.addColorStop(0, 'rgba(255,252,240,0.35)')
    light.addColorStop(0.6, 'rgba(255,252,240,0)')
    light.addColorStop(1, 'rgba(90,70,40,0.14)')
    ctx.fillStyle = light
    ctx.fillRect(0, 0, w, h)
  }

  // ── 손가락으로 판 굵은 홈(밀린 모래 능선 + 그림자 골 + 바닥 반사) ──
  const drawGroove = (ctx, x1, y1, x2, y2) => {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 1) 양옆으로 밀려 쌓인 밝은 모래 능선(넓고 부드럽게)
    ctx.shadowColor = 'rgba(120,96,58,0.35)'
    ctx.shadowBlur = 10
    ctx.strokeStyle = 'rgba(255,251,239,0.95)'
    ctx.lineWidth = 34
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'

    // 2) 파인 골(그림자) — 깊이
    ctx.strokeStyle = 'rgba(112,88,54,0.5)'
    ctx.lineWidth = 22
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()

    // 3) 골 바닥의 은은한 반사광
    ctx.strokeStyle = 'rgba(247,240,224,0.55)'
    ctx.lineWidth = 9
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }

  // ── 끌리는 소리(Web Audio: 대역통과 노이즈, 속도로 음량·음색 조절) ──
  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    const ctx = new Ctx()
    const len = Math.floor(ctx.sampleRate * 2)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1 // 화이트 노이즈
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1400
    filter.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
    source.start(0)
    audioRef.current = { ctx, gain, filter }
    return audioRef.current
  }

  const dragSound = (speed) => {
    const a = audioRef.current
    if (!a) return
    const now = a.ctx.currentTime
    const vol = Math.min(0.16, 0.02 + speed * 0.010) // 빠를수록 크게(상한)
    // 매 이동마다 잠깐 올렸다 곧 0으로 감쇠 → 멈추면 자연히 잦아든다
    a.gain.gain.setTargetAtTime(vol, now, 0.02)
    a.gain.gain.setTargetAtTime(0.0001, now + 0.04, 0.16)
    a.filter.frequency.setTargetAtTime(1100 + Math.min(speed * 45, 1500), now, 0.05)
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => {
    drawingRef.current = true
    lastPosRef.current = getPos(e)
    lastTimeRef.current = performance.now()
    const a = ensureAudio()
    if (a && a.ctx.state === 'suspended') a.ctx.resume()
  }

  const draw = (e) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    const last = lastPosRef.current
    const dx = pos.x - last.x
    const dy = pos.y - last.y
    const dist = Math.hypot(dx, dy)
    const nowT = performance.now()
    const dt = Math.max(1, nowT - lastTimeRef.current)
    const speed = dist / dt * 16 // px/frame 근사
    drawGroove(ctx, last.x, last.y, pos.x, pos.y)
    if (dist > 0.5) dragSound(speed)
    lastPosRef.current = pos
    lastTimeRef.current = nowT
  }

  const endDraw = () => {
    drawingRef.current = false
    const a = audioRef.current
    if (a) a.gain.gain.setTargetAtTime(0.0001, a.ctx.currentTime, 0.12)
  }

  const smooth = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    drawSandBackground(ctx, canvas.offsetWidth, canvas.offsetHeight)
  }

  useEffect(() => {
    if (phase === 'running') setTimeout(initCanvas, 50)
  }, [phase])

  useEffect(() => () => {
    const a = audioRef.current
    if (a) { try { a.ctx.close() } catch { /* noop */ } audioRef.current = null }
  }, [])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-200/25 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#E0A33E]/12 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>모래 정원</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-sm text-r-gray mb-12 leading-relaxed font-light">
              손끝으로 모래 위에 천천히 그려 봅니다<br />
              무엇을 그려도, 그냥 선만 그어도 괜찮습니다
            </p>
            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return (
      <div className="min-h-screen relative">
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-navy hover:text-[#0c1a2b] z-30 text-[11px] tracking-wider font-light bg-white/70 border border-line backdrop-blur px-3 py-1.5 rounded-full"
        >
          나가기
        </button>

        <canvas
          ref={canvasRef}
          className="w-full h-screen touch-none cursor-crosshair block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e) }}
          onTouchMove={(e) => { e.preventDefault(); draw(e) }}
          onTouchEnd={endDraw}
        />

        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
          <button
            onClick={smooth}
            className="px-5 py-3 bg-white/80 border border-line backdrop-blur rounded-full text-ink hover:border-[#DCD5C4] transition text-sm"
          >
            모래 고르기
          </button>
        </div>
      </div>
    )
  }

  return null
}
