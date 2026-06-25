import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'

export default function SandGarden({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    drawSandBackground(ctx, canvas.width, canvas.height)
  }

  const drawSandBackground = (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#f5ecd9')
    gradient.addColorStop(1, '#ecdfc4')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < (w * h) / 400; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      ctx.fillStyle = `rgba(180, 160, 120, ${Math.random() * 0.15})`
      ctx.fillRect(x, y, 1.5, 1.5)
    }
  }

  const drawGroove = (ctx, x1, y1, x2, y2) => {
    ctx.strokeStyle = 'rgba(150, 130, 95, 0.5)'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 250, 235, 0.7)'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
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
  }

  const draw = (e) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    drawGroove(ctx, lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y)
    lastPosRef.current = pos
  }

  const endDraw = () => {
    drawingRef.current = false
  }

  const smooth = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    drawSandBackground(ctx, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (phase === 'running') {
      setTimeout(initCanvas, 50)
    }
  }, [phase])

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
