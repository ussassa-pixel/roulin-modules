import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 걱정 나무 — CBT 걱정 관리(해결형 vs 비해결형) + 긴급/시간 축.
// 걱정을 나뭇가지 끝에 매달고, ①바꿀 수 있나 ②지금 빨리 할 수 있나 로 분기해
// 나무의 어느 자리에 놓일지(지금 손닿는 가지 / 시간이 필요한 가지 / 바람에 맡기는 잎)를 보여준다.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

// 열매(걱정)가 매달릴 가지 마디 좌표 (viewBox 320×340)
const SPOTS = { hang: [232, 120], now: [96, 214], later: [214, 96], gone: [150, 380] }

export default function WorryTree({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [worry, setWorry] = useState('')
  const [action, setAction] = useState('')
  const [kind, setKind] = useState(null) // 'now' | 'later' | 'letgo'

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>걱정 나무</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          걱정을 나무에 걸어두고,<br />어디에 둘지 함께 살펴볼게요.
        </p>
        <button onClick={() => setPhase('worry')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'worry')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 어떤 걱정이 있나요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">하나만 골라서</p>
        <textarea className={taCls} rows={3} value={worry} onChange={(e) => setWorry(e.target.value)} placeholder="떠오르는 걱정 하나를 적어주세요" autoFocus />
        <button onClick={() => worry.trim() && setPhase('t1')} disabled={!worry.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${worry.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}>
          나무에 걸기
        </button>
      </div>
    )

  if (phase === 't1')
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <TreeScene worry={worry} target="hang" />
        <p className="text-navy text-lg font-light mt-2 mb-6 text-center">지금 내가 바꿀 수 있는 일인가요?</p>
        <div className="space-y-3 w-full">
          <button onClick={() => setPhase('t2')} className="w-full py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">네, 바꿀 수 있어요</button>
          <button onClick={() => { setKind('letgo'); setPhase('result') }} className="w-full py-3.5 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">아니요, 지금은 어려워요</button>
        </div>
      </div>
    )

  if (phase === 't2')
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <TreeScene worry={worry} target="hang" />
        <p className="text-navy text-lg font-light mt-2 mb-1 text-center">그럼, 지금 바로 할 수 있는 일인가요?</p>
        <p className="text-r-gray-soft text-xs mb-6 text-center">중요해도, 지금 당장이 아닐 수 있어요</p>
        <div className="space-y-3 w-full">
          <button onClick={() => { setKind('now'); setPhase('act') }} className="w-full py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">네, 지금 할 수 있어요</button>
          <button onClick={() => { setKind('later'); setPhase('result') }} className="w-full py-3.5 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">중요하지만, 시간이 필요해요</button>
        </div>
      </div>
    )

  if (phase === 'act')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">그럼 무엇을 해볼 수 있을까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">아주 작은 한 가지면 돼요</p>
        <input className={inputCls} value={action} onChange={(e) => setAction(e.target.value)} placeholder="예: 내일 오전에 담당자에게 메일 한 통" autoFocus />
        <button onClick={() => action.trim() && setPhase('result')} disabled={!action.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${action.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}>
          나무에 놓기
        </button>
      </div>
    )

  if (phase === 'result') {
    const meta = {
      now: { title: '지금 손이 닿는 가지', line: '오늘 한 걸음이면 돼요.' },
      later: { title: '시간이 필요한 가지', line: '서두르지 않아도 돼요. 때가 오면 하면 됩니다.' },
      letgo: { title: '바람에 맡기는 잎', line: '바꿀 수 없는 건, 붙잡지 않아도 괜찮아요.' },
    }[kind]
    return page(
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        <TreeScene worry={worry} target={kind === 'letgo' ? 'gone' : kind} />
        <p className="font-serif text-[20px] text-navy mt-2 mb-1.5 text-center" style={{ fontWeight: 600 }}>{meta.title}</p>
        <p className="text-[13px] text-r-gray mb-1 text-center leading-relaxed">{meta.line}</p>
        {kind === 'now' && <p className="text-[13px] text-amber mb-1 text-center">오늘 한 걸음 · <span className="text-ink">{action}</span></p>}
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-6">마무리</button>
      </div>
    )
  }

  if (phase === 'rating')
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )

  return null
}

// 나무 + 매달린 걱정 열매. target 자리로 스르륵 이동(결과 화면에서 reveal).
function TreeScene({ worry, target }) {
  const [pos, setPos] = useState('hang')
  useEffect(() => {
    if (target === 'hang') { setPos('hang'); return }
    setPos('hang')
    const t = setTimeout(() => setPos(target), 450) // 잠깐 매달렸다가 제자리로
    return () => clearTimeout(t)
  }, [target])

  const [nx, ny] = SPOTS[pos]
  const gone = pos === 'gone'
  const label = worry.length > 9 ? worry.slice(0, 9) + '…' : worry

  return (
    <svg width="300" height="300" viewBox="0 0 320 340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="foliage" cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#bfe0c0" />
          <stop offset="100%" stopColor="#8bbf95" />
        </radialGradient>
        <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9855f" />
          <stop offset="50%" stopColor="#c8a373" />
          <stop offset="100%" stopColor="#9c7850" />
        </linearGradient>
      </defs>

      {/* 땅 */}
      <ellipse cx="160" cy="322" rx="96" ry="10" fill="#e7dcc2" />
      {/* 줄기 */}
      <path d="M 150 320 Q 146 250, 152 180 Q 156 140, 168 110" stroke="url(#trunk)" strokeWidth="16" fill="none" strokeLinecap="round" />
      {/* 가지 */}
      <path d="M 152 190 Q 120 200, 96 214" stroke="url(#trunk)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 160 150 Q 200 120, 214 96" stroke="url(#trunk)" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 165 130 Q 210 118, 232 120" stroke="url(#trunk)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* 잎 덩어리 */}
      <ellipse cx="170" cy="86" rx="70" ry="54" fill="url(#foliage)" opacity="0.95" />
      <ellipse cx="104" cy="140" rx="44" ry="36" fill="url(#foliage)" opacity="0.9" />
      <ellipse cx="236" cy="112" rx="46" ry="38" fill="url(#foliage)" opacity="0.9" />
      <ellipse cx="86" cy="200" rx="34" ry="26" fill="url(#foliage)" opacity="0.85" />
      <ellipse cx="210" cy="150" rx="30" ry="24" fill="url(#foliage)" opacity="0.8" />

      {/* 걱정 열매 (매달렸다가 target 자리로) */}
      <g style={{ transform: `translate(${nx}px, ${ny}px)`, opacity: gone ? 0 : 1, transition: 'transform 1.1s cubic-bezier(0.34,1.1,0.64,1), opacity 1.1s ease-in' }}>
        <line x1="0" y1="0" x2="0" y2="14" stroke="#8a6a45" strokeWidth="1.6" />
        <g transform="translate(0, 30)">
          <rect x={-Math.max(30, label.length * 6 + 16) / 2} y={-13} width={Math.max(30, label.length * 6 + 16)} height={26} rx={13}
            fill="#fff" stroke="#E0A33E" strokeWidth="1.3" />
          <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#3A3733">{label}</text>
        </g>
      </g>
    </svg>
  )
}
