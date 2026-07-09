import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import comfortPool from '../content/comfortPool.json'

// 위로 뽑기 (v4 §5 comfort_draw) — 심리학적 근거를 주장하지 않는 순수 리추얼.
// 효과·치유 어휘 금지. 기본은 항상 다정 풀.
// "따끔" 모드는 안전 게이트(위기 L1+ 차단) 배선 후에만 추가한다 — 지금은 미구현.
// 리추얼이므로 EndRating 없음 — 카드를 받고 "지금 기분 어떠세요?"를 물으면 의례의 결이 깨진다.
const DRAWN_KEY = 'roulin_comfort_drawn' // 최근 뽑은 카드 id — 연속 중복 방지용
const DRAWN_MAX = 10

function getDrawn() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAWN_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function rememberDrawn(id) {
  try {
    const log = getDrawn().filter((x) => x !== id)
    log.push(id)
    localStorage.setItem(DRAWN_KEY, JSON.stringify(log.slice(-DRAWN_MAX)))
  } catch {
    /* noop */
  }
}

// 최근 뽑은 것을 피해 서로 다른 카드 3장
function dealThree() {
  const drawn = getDrawn()
  let pool = comfortPool.items.filter((it) => !drawn.includes(it.id))
  if (pool.length < 3) pool = [...comfortPool.items]
  const picked = []
  const copy = [...pool]
  while (picked.length < 3 && copy.length > 0) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return picked
}

// 카드 뒷면의 스파클(roulin 별)
function Spark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" />
    </svg>
  )
}

export default function ComfortDraw({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState(null) // 뒤집은 카드 index
  const [redrawn, setRedrawn] = useState(false) // 한 번 더는 1회만

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const startDraw = () => {
    setCards(dealThree())
    setFlipped(null)
    setPhase('draw')
  }

  const flip = (i) => {
    if (flipped !== null) return
    setFlipped(i)
    rememberDrawn(cards[i].id)
  }

  const redraw = () => {
    if (redrawn) return
    setRedrawn(true)
    setCards(dealThree())
    setFlipped(null)
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>위로 뽑기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          이유는 없어도 돼요.<br />오늘의 카드 한 장을 뒤집어 봐요.
        </p>
        <button onClick={startDraw} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          카드 섞기
        </button>
      </div>
    )

  if (phase === 'draw') {
    const revealed = flipped !== null ? cards[flipped] : null
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">{revealed ? '오늘의 한 장' : '마음 가는 카드를 한 장 골라요'}</p>

        {/* 카드 세 장 — 고르기 전엔 나란히, 고르면 그 카드만 크게 */}
        {!revealed && (
          <div className="flex justify-center gap-3 mb-12">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => flip(i)}
                aria-label={`카드 ${i + 1}`}
                className="w-24 h-36 rounded-2xl border border-amber/30 bg-amber-soft flex items-center justify-center
                           transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_28px_rgba(17,35,56,0.10)]"
                style={{ transform: `rotate(${(i - 1) * 4}deg)` }}
              >
                <Spark className="w-6 h-6 text-amber/70" />
              </button>
            ))}
          </div>
        )}

        {revealed && (
          <div className="mb-10" style={{ perspective: '900px' }}>
            <div
              className="mx-auto w-64 min-h-[13rem] rounded-3xl bg-white border border-line shadow-[0_12px_36px_rgba(17,35,56,0.08)]
                         flex flex-col items-center justify-center px-7 py-9"
              style={{ animation: 'flipIn 0.6s ease both' }}
            >
              <Spark className="w-4 h-4 text-amber mb-5" />
              <p className="font-serif text-[18px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>
                {revealed.text}
              </p>
            </div>
            <style>{`@keyframes flipIn { 0% { transform: rotateY(90deg); opacity: 0; } 100% { transform: rotateY(0deg); opacity: 1; } }`}</style>
          </div>
        )}

        {revealed ? (
          <div className="space-y-3">
            <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              마음에 담을게요
            </button>
            {!redrawn && (
              <button onClick={redraw} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
                다른 카드로 한 번만 더
              </button>
            )}
          </div>
        ) : (
          <p className="text-[12px] text-r-gray-soft">어떤 카드를 골라도 괜찮아요.</p>
        )}
      </div>
    )
  }

  return null
}
