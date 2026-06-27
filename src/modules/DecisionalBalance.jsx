import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 결정 저울(2×2) — Janis & Mann(1977) / 동기강화상담 양가감정.
// 기울기는 글자수가 아니라, 내담자가 각 요소에 매긴 '중요도 점수'(=무게)로 정한다.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const cellCls =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink text-[14px] outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition resize-none leading-relaxed'

// side: L=하는 쪽(이 결정을 '하게' 만드는 무게), R=안 하는 쪽('안 하게' 만드는 무게)
const CELLS = [
  { key: 'doPro', label: '할 때 좋은 점', ph: '얻게 되는 것', side: 'L' },
  { key: 'notCon', label: '안 할 때 아쉬운 점', ph: '놓치게 되는 것', side: 'L' },
  { key: 'doCon', label: '할 때 걱정되는 점', ph: '치러야 하는 것', side: 'R' },
  { key: 'notPro', label: '안 할 때 좋은 점', ph: '지킬 수 있는 것', side: 'R' },
]
const SIDE_LABEL = { L: '하는 쪽', R: '안 하는 쪽' }

export default function DecisionalBalance({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [decision, setDecision] = useState('')
  const [grid, setGrid] = useState({ doPro: '', doCon: '', notPro: '', notCon: '' })
  const [scores, setScores] = useState({ doPro: 3, doCon: 3, notPro: 3, notCon: 3 })

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const filled = CELLS.filter((c) => grid[c.key].trim())
  const filledCount = filled.length

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>결정 저울</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          마음이 양쪽으로 기울 때,<br />하나씩 저울에 올려볼게요.
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
          onClick={() => filledCount > 0 && setPhase('weigh')}
          disabled={filledCount === 0}
          className={`w-full py-4 rounded-full transition ${filledCount > 0 ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  // ⓵ 각 요소 시각화 + 중요도(무게) 점수 매기기
  if (phase === 'weigh') {
    const sideBlock = (side) => {
      const items = filled.filter((c) => c.side === side)
      if (!items.length) return null
      return (
        <div className="mb-5">
          <p className="text-[11px] tracking-[0.12em] text-amber mb-2 ml-1">{SIDE_LABEL[side]}</p>
          <div className="space-y-2.5">
            {items.map((c) => (
              <div key={c.key} className="rounded-2xl bg-white border border-line p-4">
                <p className="text-[10px] text-r-gray-soft mb-0.5">{c.label}</p>
                <p className="text-ink text-[14px] mb-3 leading-relaxed">{grid[c.key].trim()}</p>
                <Scorer value={scores[c.key]} onChange={(v) => setScores((p) => ({ ...p, [c.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      )
    }
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 내 마음엔, 얼마나 무겁나요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-7">각 항목의 중요도를 매겨보세요</p>
        <div className="max-h-[56vh] overflow-y-auto pr-1">
          {sideBlock('L')}
          {sideBlock('R')}
        </div>
        <button onClick={() => setPhase('scale')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-4">
          저울에 올리기
        </button>
      </div>
    )
  }

  // ⓶ 점수=무게로 저울 애니메이션 + 무게 측정
  if (phase === 'scale')
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <p className="text-center text-r-gray-soft text-xs mb-1 tracking-wide">{decision}</p>
        <BalanceScale items={filled} grid={grid} scores={scores} />
        <p className="text-center text-navy text-[15px] font-light mt-3 mb-5">지금 마음은 어느 쪽으로 기울어요?</p>
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

// 중요도 1~5 선택기 (점 5개)
function Scorer({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-r-gray-soft mr-1">덜 중요</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-label={`중요도 ${n}`}
          className="p-1 -m-1"
        >
          <span
            className="block rounded-full transition-all"
            style={{
              width: 16, height: 16,
              background: n <= value ? '#E0A33E' : '#EDE8DB',
              border: n <= value ? '1px solid #cf922f' : '1px solid #e3ddcd',
              transform: n === value ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        </button>
      ))}
      <span className="text-[10px] text-r-gray-soft ml-1">매우 중요</span>
    </div>
  )
}

// ── 양팔저울 (무게 = 중요도 점수 합) ──
const CX = 180, PIVOT_Y = 78, ARM = 116, STR = 62, PAN_RX = 56
const short = (s) => (s.length > 9 ? s.slice(0, 9) + '…' : s)

function BalanceScale({ items, grid, scores }) {
  const L = items.filter((c) => c.side === 'L').map((c) => ({ text: grid[c.key].trim(), score: scores[c.key] }))
  const R = items.filter((c) => c.side === 'R').map((c) => ({ text: grid[c.key].trim(), score: scores[c.key] }))
  const order = [
    ...L.map((c, i) => ({ ...c, side: 'L', slot: i })),
    ...R.map((c, i) => ({ ...c, side: 'R', slot: i })),
  ].map((c, g) => ({ ...c, g }))
  const total = order.length
  const leftChips = order.filter((c) => c.side === 'L')
  const rightChips = order.filter((c) => c.side === 'R')

  const wL = L.reduce((s, c) => s + c.score, 0)
  const wR = R.reduce((s, c) => s + c.score, 0)
  const sum = wL + wR
  const thetaFinal = sum ? Math.max(-12, Math.min(12, ((wR - wL) / sum) * 24)) : 0

  const [dropped, setDropped] = useState(0)
  const [theta, setTheta] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const rafRef = useRef(0)

  useEffect(() => {
    const timers = []
    for (let i = 0; i < total; i++) timers.push(setTimeout(() => setDropped(i + 1), 280 * (i + 1)))
    const tiltAt = 280 * total + 240
    timers.push(setTimeout(() => {
      const t0 = performance.now(), dur = 1200
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setTheta(thetaFinal * e)
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, tiltAt))
    timers.push(setTimeout(() => setShowResult(true), tiltAt + 800))
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(rafRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const rad = (theta * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const leftEnd = { x: CX - ARM * cos, y: PIVOT_Y - ARM * sin }
  const rightEnd = { x: CX + ARM * cos, y: PIVOT_Y + ARM * sin }
  const pan = (end) => ({ x: end.x, y: end.y + STR })

  const renderPan = (end, list) => {
    const p = pan(end)
    return (
      <g>
        <line x1={end.x} y1={end.y} x2={p.x - PAN_RX * 0.66} y2={p.y} stroke="#c9c2b2" strokeWidth="1" />
        <line x1={end.x} y1={end.y} x2={p.x + PAN_RX * 0.66} y2={p.y} stroke="#c9c2b2" strokeWidth="1" />
        <ellipse cx={p.x} cy={p.y} rx={PAN_RX} ry="9" fill="#fbf3df" stroke="#e3c98a" strokeWidth="1.2" />
        <ellipse cx={p.x} cy={p.y - 2.5} rx={PAN_RX} ry="9" fill="#fff" opacity="0.5" />
        {list.map((c) => {
          const cy = p.y - 15 - c.slot * 25
          const shown = c.g < dropped
          return (
            <g key={c.g} transform={`translate(${p.x}, ${cy})`}>
              <g style={{ transform: shown ? 'translateY(0)' : 'translateY(-48px)', opacity: shown ? 1 : 0, transition: 'transform .55s cubic-bezier(.34,1.4,.64,1), opacity .4s ease-out' }}>
                <rect x={-58} y={-11} width={116} height={22} rx={11} fill="#fff" stroke="#e3c98a" strokeWidth="1" />
                <text x={-48} y={3.5} textAnchor="start" fontSize="11" fill="#3A3733">{short(c.text)}</text>
                {/* 무게(중요도) 배지 */}
                <circle cx={45} cy={0} r={8.5} fill="#E0A33E" />
                <text x={45} y={3.4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">{c.score}</text>
              </g>
            </g>
          )
        })}
      </g>
    )
  }

  const heavier = Math.abs(wR - wL) < 1 ? '비슷' : wL > wR ? 'L' : 'R'
  const caption =
    heavier === '비슷' ? '지금은 양쪽 무게가 비슷해요'
    : heavier === 'L' ? '지금은 ‘하는 쪽’이 더 무거워요'
    : '지금은 ‘안 하는 쪽’이 더 무거워요'

  const sideLabel = (side, w) => (
    <span>
      {SIDE_LABEL[side]} <span className="text-amber font-medium">{w}</span>
    </span>
  )

  return (
    <div className="w-full flex flex-col items-center">
      <svg width="320" height="248" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx={CX} cy={272} rx="46" ry="7" fill="#e7dcc2" />
        <rect x={CX - 4} y={PIVOT_Y} width="8" height="190" rx="4" fill="#d8cba8" />
        <path d={`M ${CX - 13} ${PIVOT_Y + 4} L ${CX + 13} ${PIVOT_Y + 4} L ${CX} ${PIVOT_Y - 12} Z`} fill="#caa85f" />
        <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#caa85f" strokeWidth="4" strokeLinecap="round" />
        <circle cx={CX} cy={PIVOT_Y} r="5.5" fill="#b8923f" />
        <circle cx={leftEnd.x} cy={leftEnd.y} r="3" fill="#b8923f" />
        <circle cx={rightEnd.x} cy={rightEnd.y} r="3" fill="#b8923f" />
        {renderPan(leftEnd, leftChips)}
        {renderPan(rightEnd, rightChips)}
      </svg>

      {/* 무게 측정 결과 */}
      <div className="h-12 flex flex-col items-center justify-start transition-opacity duration-500" style={{ opacity: showResult ? 1 : 0 }}>
        <p className="text-[13px] text-r-gray flex gap-4">
          {sideLabel('L', wL)}<span className="text-r-gray-soft">·</span>{sideLabel('R', wR)}
        </p>
        <p className="text-[13px] text-navy mt-1">{caption}</p>
      </div>
    </div>
  )
}
