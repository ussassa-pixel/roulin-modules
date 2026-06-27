import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 결정 저울(2×2) — Janis & Mann(1977) / 동기강화상담 양가감정. 가중치/점수화는 후순위.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const cellCls =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink text-[14px] outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'

const CELLS = [
  { key: 'doPro', label: '할 때 좋은 점', ph: '얻게 되는 것' },
  { key: 'doCon', label: '할 때 걱정되는 점', ph: '치러야 하는 것' },
  { key: 'notPro', label: '안 할 때 좋은 점', ph: '지킬 수 있는 것' },
  { key: 'notCon', label: '안 할 때 아쉬운 점', ph: '놓치게 되는 것' },
]

// ── 양팔저울 애니메이션 ──
// 하는 쪽(L) = 할 때 좋은 점 + 안 할 때 아쉬운 점
// 안 하는 쪽(R) = 할 때 걱정 + 안 할 때 좋은 점
// 적은 글자 수(=마음이 쏠린 정도)만큼 그쪽 접시가 내려간다.
const CX = 180, PIVOT_Y = 78, ARM = 116, STR = 62, PAN_RX = 54
const short = (s) => (s.length > 11 ? s.slice(0, 11) + '…' : s)

function BalanceScale({ grid }) {
  const L = [
    grid.doPro.trim() && { label: '할 때 좋은 점', text: grid.doPro.trim() },
    grid.notCon.trim() && { label: '안 할 때 아쉬운 점', text: grid.notCon.trim() },
  ].filter(Boolean)
  const R = [
    grid.doCon.trim() && { label: '할 때 걱정', text: grid.doCon.trim() },
    grid.notPro.trim() && { label: '안 할 때 좋은 점', text: grid.notPro.trim() },
  ].filter(Boolean)
  const order = [
    ...L.map((c, i) => ({ ...c, side: 'L', slot: i })),
    ...R.map((c, i) => ({ ...c, side: 'R', slot: i })),
  ].map((c, g) => ({ ...c, g }))
  const total = order.length
  const leftChips = order.filter((c) => c.side === 'L')
  const rightChips = order.filter((c) => c.side === 'R')

  const lenL = L.reduce((s, c) => s + c.text.length, 0)
  const lenR = R.reduce((s, c) => s + c.text.length, 0)
  const sum = lenL + lenR
  const thetaFinal = sum ? Math.max(-11, Math.min(11, ((lenR - lenL) / sum) * 20)) : 0

  const [dropped, setDropped] = useState(0)
  const [theta, setTheta] = useState(0)
  const [showCaption, setShowCaption] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const timers = []
    for (let i = 0; i < total; i++) timers.push(setTimeout(() => setDropped(i + 1), 260 * (i + 1)))
    const tiltAt = 260 * total + 220
    timers.push(setTimeout(() => {
      const t0 = performance.now(), dur = 1100
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setTheta(thetaFinal * e)
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, tiltAt))
    timers.push(setTimeout(() => setShowCaption(true), tiltAt + 700))
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(rafRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rad = (theta * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const leftEnd = { x: CX - ARM * cos, y: PIVOT_Y - ARM * sin }
  const rightEnd = { x: CX + ARM * cos, y: PIVOT_Y + ARM * sin }
  const pan = (end) => ({ x: end.x, y: end.y + STR })

  const renderPan = (end, list, sideLabel) => {
    const p = pan(end)
    return (
      <g>
        {/* 줄 (V자) */}
        <line x1={end.x} y1={end.y} x2={p.x - PAN_RX * 0.66} y2={p.y} stroke="#c9c2b2" strokeWidth="1" />
        <line x1={end.x} y1={end.y} x2={p.x + PAN_RX * 0.66} y2={p.y} stroke="#c9c2b2" strokeWidth="1" />
        {/* 접시 */}
        <ellipse cx={p.x} cy={p.y} rx={PAN_RX} ry="9" fill="#fbf3df" stroke="#e3c98a" strokeWidth="1.2" />
        <ellipse cx={p.x} cy={p.y - 2.5} rx={PAN_RX} ry="9" fill="#fff" opacity="0.5" />
        {/* 접시 아래 측 라벨 */}
        <text x={p.x} y={p.y + 26} textAnchor="middle" fontSize="11" fill="#A8A294" fontWeight="500">{sideLabel}</text>
        {/* 칩 */}
        {list.map((c) => {
          const cy = p.y - 15 - c.slot * 25
          const shown = c.g < dropped
          return (
            <g key={c.g} transform={`translate(${p.x}, ${cy})`}>
              <g style={{ transform: shown ? 'translateY(0)' : 'translateY(-48px)', opacity: shown ? 1 : 0, transition: 'transform .55s cubic-bezier(.34,1.4,.64,1), opacity .4s ease-out' }}>
                <rect x={-53} y={-11} width={106} height={22} rx={11} fill="#fff" stroke="#e3c98a" strokeWidth="1" />
                <text x={0} y={3.5} textAnchor="middle" fontSize="11.5" fill="#3A3733">{short(c.text)}</text>
              </g>
            </g>
          )
        })}
      </g>
    )
  }

  const caption =
    Math.abs(thetaFinal) < 2 ? '지금은 양쪽이 비슷해요'
    : thetaFinal < 0 ? '지금은 ‘하는 쪽’으로 조금 기울어요'
    : '지금은 ‘안 하는 쪽’으로 조금 기울어요'

  return (
    <div className="w-full flex flex-col items-center">
      <svg width="320" height="248" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg">
        {/* 기둥 + 받침 */}
        <ellipse cx={CX} cy={272} rx="46" ry="7" fill="#e7dcc2" />
        <rect x={CX - 4} y={PIVOT_Y} width="8" height="190" rx="4" fill="#d8cba8" />
        {/* 받침 삼각(중심추) */}
        <path d={`M ${CX - 13} ${PIVOT_Y + 4} L ${CX + 13} ${PIVOT_Y + 4} L ${CX} ${PIVOT_Y - 12} Z`} fill="#caa85f" />
        {/* 빔 */}
        <g>
          <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#caa85f" strokeWidth="4" strokeLinecap="round" />
          <circle cx={CX} cy={PIVOT_Y} r="5.5" fill="#b8923f" />
          <circle cx={leftEnd.x} cy={leftEnd.y} r="3" fill="#b8923f" />
          <circle cx={rightEnd.x} cy={rightEnd.y} r="3" fill="#b8923f" />
        </g>
        {renderPan(leftEnd, leftChips, '하는 쪽')}
        {renderPan(rightEnd, rightChips, '안 하는 쪽')}
      </svg>
      <p
        className="text-[13px] text-r-gray mt-1 h-5 transition-opacity duration-500"
        style={{ opacity: showCaption ? 1 : 0 }}
      >
        {caption}
      </p>
    </div>
  )
}

export default function DecisionalBalance({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [decision, setDecision] = useState('')
  const [grid, setGrid] = useState({ doPro: '', doCon: '', notPro: '', notCon: '' })

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const filledCount = Object.values(grid).filter((v) => v.trim()).length

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>결정 저울</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          마음이 양쪽으로 기울 때,<br />저울에 가만히 올려볼게요.
        </p>
        <button onClick={() => setPhase('decision')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'decision')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">무엇을 두고 고민 중이에요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">‘~할지 말지’ 형태로</p>
        <input className={inputCls} value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="예: 지금 이직을 할지 말지" autoFocus />
        <button
          onClick={() => decision.trim() && setPhase('grid')}
          disabled={!decision.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${decision.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'grid')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-[15px] font-light mb-1 leading-relaxed">{decision}</p>
        <p className="text-center text-r-gray-soft text-xs mb-6">떠오르는 만큼만 적어도 돼요</p>
        <div className="space-y-3 mb-6">
          {CELLS.map(({ key, label, ph }) => (
            <div key={key}>
              <label className="block text-[12px] text-amber mb-1.5 ml-1">{label}</label>
              <textarea className={cellCls} rows={2} value={grid[key]} onChange={(e) => setGrid((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} />
            </div>
          ))}
        </div>
        <button
          onClick={() => filledCount > 0 && setPhase('review')}
          disabled={filledCount === 0}
          className={`w-full py-4 rounded-full transition ${filledCount > 0 ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          저울 보기
        </button>
      </div>
    )

  if (phase === 'review')
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <p className="text-center text-r-gray-soft text-xs mb-1 tracking-wide">{decision}</p>
        <BalanceScale grid={grid} />
        <p className="text-center text-navy text-[15px] font-light mt-4 mb-5">지금 마음은 어느 쪽으로 기울어요?</p>
        <div className="space-y-3 w-full">
          <button onClick={() => setPhase('rating')} className="w-full py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">조금은 정해진 것 같아요</button>
          <button onClick={() => setPhase('rating')} className="w-full py-3.5 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">아직 더 두고 볼래요</button>
        </div>
      </div>
    )

  if (phase === 'rating')
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )

  return null
}
