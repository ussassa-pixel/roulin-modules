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

        {/* 카드 세 장 — 딥네이비 + 골드 프레임의 뒷면. 고르면 3D 플립으로 공개 */}
        {!revealed && (
          <div className="flex justify-center gap-4 mb-12" style={{ perspective: '900px' }}>
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => flip(i)}
                aria-label={`카드 ${i + 1}`}
                className="group relative w-[104px] h-[158px] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-3"
                style={{
                  transform: `rotate(${(i - 1) * 4}deg)`,
                  boxShadow: '0 16px 32px rgba(17,35,56,0.24), 0 3px 8px rgba(17,35,56,0.14)',
                }}
              >
                {/* 딥네이비 바탕 */}
                <span className="absolute inset-0" style={{ background: 'linear-gradient(150deg, #1E3A5C 0%, #112338 55%, #0A1626 100%)' }} />
                {/* 골드 이중 프레임 */}
                <span className="absolute inset-[6px] rounded-xl border border-amber/50 pointer-events-none" />
                <span className="absolute inset-[10px] rounded-lg border border-amber/15 pointer-events-none" />
                {/* 중앙 후광 + 스파크 */}
                <span className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 46%, rgba(224,163,62,0.28) 0%, rgba(224,163,62,0) 58%)' }} />
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spark className="w-6 h-6 text-amber drop-shadow-[0_0_7px_rgba(224,163,62,0.75)]" />
                </span>
                {/* 위아래 작은 점 장식 */}
                <span className="absolute top-[18px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber/60" />
                <span className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber/60" />
                {/* 광택 스윕 */}
                <span className="absolute -inset-y-6 left-[-48px] w-9 rotate-[18deg] bg-white/12 blur-[7px] transition-all duration-700 group-hover:left-[130%]" />
              </button>
            ))}
          </div>
        )}

        {revealed && (
          <div className="mb-10" style={{ perspective: '1100px' }}>
            <div
              className="relative mx-auto w-72 min-h-[15rem] rounded-3xl overflow-hidden flex flex-col items-center justify-center px-8 py-10"
              style={{
                animation: 'flipIn 0.75s cubic-bezier(0.2, 0.75, 0.3, 1) both',
                background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
                boxShadow: '0 26px 52px rgba(17,35,56,0.18), 0 5px 14px rgba(17,35,56,0.08)',
              }}
            >
              {/* 골드 이중 프레임 */}
              <span className="absolute inset-[8px] rounded-[20px] border border-amber/40 pointer-events-none" />
              <span className="absolute inset-[13px] rounded-2xl border border-amber/12 pointer-events-none" />
              <Spark className="w-4 h-4 text-amber mb-5 drop-shadow-[0_0_5px_rgba(224,163,62,0.55)]" />
              <p className="font-serif text-[19px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>
                {revealed.text}
              </p>
              <span className="mt-6 w-8 h-px bg-amber/50" />
            </div>
            <style>{`@keyframes flipIn {
              0%   { transform: rotateY(-100deg); opacity: 0; }
              60%  { transform: rotateY(10deg);   opacity: 1; }
              100% { transform: rotateY(0deg);    opacity: 1; }
            }`}</style>
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
