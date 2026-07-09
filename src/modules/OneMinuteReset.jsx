import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import resets from '../content/oneMinuteResets.json'

// 1분 리셋 (부록 one_minute_reset) — 초미니 뽑기 컨테이너(연습형).
// 30초짜리 행동들을 개별 모듈화하면 오히려 무거움 → 하나의 컨테이너에서 뽑는다.
// 핵심 가치: "지금 딱 1분, 아무거나 하나" — 즉시성·무선택 부담.
// 그라운딩·호흡 정식 모듈의 축소판이 아님(정식 개입 X, 초경량 리셋).
// 강요 없음: [다른 거]·[목록에서 고르기]·[건너뛰기]·나가기 항상 열림. EndRating 없음.

export default function OneMinuteReset({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → draw | list → do → close
  const [item, setItem] = useState(null)
  const seenRef = useRef(new Set()) // 세션 내 중복 방지

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const draw = () => {
    let pool = resets.items.filter((it) => !seenRef.current.has(it.id))
    if (pool.length === 0) {
      seenRef.current.clear()
      pool = resets.items
    }
    const picked = pool[Math.floor(Math.random() * pool.length)]
    seenRef.current.add(picked.id)
    return picked
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>1분 리셋</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          지금 딱 1분,<br />하나만 해볼까요?
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">고르기도 귀찮으면, 뽑아드릴게요.</p>
        <button onClick={() => { setItem(draw()); setPhase('draw') }} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          하나 뽑기
        </button>
        <button onClick={() => setPhase('list')} className="mt-4 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          목록에서 고르기
        </button>
      </div>
    )

  if (phase === 'draw' && item)
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">이번 1분은</p>
        <div className="mb-10" style={{ perspective: '900px' }}>
          <div
            key={item.id}
            className="relative mx-auto w-72 rounded-3xl overflow-hidden px-8 py-10"
            style={{
              animation: 'resetFlip 0.6s cubic-bezier(0.2, 0.75, 0.3, 1) both',
              background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
              boxShadow: '0 26px 52px rgba(17,35,56,0.16), 0 5px 14px rgba(17,35,56,0.08)',
            }}
          >
            <span className="absolute inset-[8px] rounded-[20px] border border-amber/35 pointer-events-none" />
            <p className="font-serif text-[19px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>{item.text}</p>
          </div>
          <style>{`@keyframes resetFlip { 0% { transform: rotateY(-95deg); opacity: 0; } 100% { transform: rotateY(0); opacity: 1; } }`}</style>
        </div>
        <button onClick={() => setPhase('do')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          해볼게요
        </button>
        <div className="flex justify-center gap-6 mt-3">
          <button onClick={() => setItem(draw())} className="py-2 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition">다른 거</button>
          <button onClick={() => setPhase('list')} className="py-2 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition">목록에서 고르기</button>
        </div>
      </div>
    )

  if (phase === 'list')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center eyebrow mb-6">마음 가는 걸 하나 골라요</p>
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1 mb-6">
          {resets.items.map((it) => (
            <button
              key={it.id}
              onClick={() => { seenRef.current.add(it.id); setItem(it); setPhase('do') }}
              className="roulin-card w-full text-left px-5 py-4 text-ink text-[14px] leading-relaxed"
            >
              {it.text}
            </button>
          ))}
        </div>
        <button onClick={() => { setItem(draw()); setPhase('draw') }} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
          그냥 뽑아주세요
        </button>
      </div>
    )

  if (phase === 'do' && item)
    return <ResetTimer item={item} onDone={() => setPhase('close')} onExit={onExit} />

  if (phase === 'close')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>1분, 잘 썼어요.</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-12" />
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          닫기
        </button>
      </div>
    )

  return null
}

// 60초 카운트다운 — 건너뛰기 상시
function ResetTimer({ item, onDone, onExit }) {
  const DUR = 60
  const [prog, setProg] = useState(0)
  const [paused, setPaused] = useState(false)
  const elapsed = useRef(0)
  const pausedRef = useRef(false)
  pausedRef.current = paused

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return
      elapsed.current += 100
      const p = Math.min(elapsed.current / (DUR * 1000), 1)
      setProg(p)
      if (p >= 1) { clearInterval(id); onDone() }
    }, 100)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const R = 80, C = 2 * Math.PI * R
  const remain = Math.max(0, Math.ceil((1 - prog) * DUR))

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #FBF9F1 0%, #F5F3EB 65%)' }}>
      <button onClick={onExit} className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-r-gray-soft hover:text-navy transition z-10">나가기</button>

      <div className="relative mb-8 flex items-center justify-center" style={{ width: 176, height: 176 }}>
        <svg width="176" height="176" viewBox="0 0 176 176" className="absolute inset-0 -rotate-90">
          <circle cx="88" cy="88" r={R} fill="none" stroke="#E7E2D5" strokeWidth="5" />
          <circle cx="88" cy="88" r={R} fill="none" stroke="#E0A33E" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - prog)} style={{ transition: 'stroke-dashoffset .1s linear' }} />
        </svg>
        <span className="font-serif text-[34px] text-navy" style={{ fontWeight: 600 }}>{remain}</span>
      </div>

      <p className="text-center text-[18px] text-navy/85 font-light leading-relaxed max-w-xs mb-3">{item.text}</p>
      <p className="text-[12px] text-r-gray-soft mb-10">천천히, 이거 하나면 돼요.</p>

      <div className="flex items-center gap-3">
        <button onClick={() => setPaused((x) => !x)} className="px-5 py-2.5 rounded-full bg-white border border-line text-ink text-[13px] hover:border-[#DCD5C4] transition">
          {paused ? '이어서' : '잠깐 멈춤'}
        </button>
        <button onClick={onDone} className="px-5 py-2.5 rounded-full text-r-gray text-[13px] hover:text-navy transition">건너뛰기</button>
      </div>
    </div>
  )
}
