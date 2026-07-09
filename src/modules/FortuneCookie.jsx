import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import fortunePool from '../content/fortuneCookies.json'

// 포춘 쿠키 — 아침을 시작하는 뽑기(v4 ⑥ 계열). 쿠키 셋 중 하나를 골라
// 오늘 몫의 좋은 한 줄을 꺼낸다. 근거를 주장하지 않는 순수 의례.
// 조각은 날짜 기반 결정적 선택 — 어떤 쿠키를 골라도, 몇 번을 열어도
// 그날은 같은 조각("오늘의 운세"처럼 하루 단위 고정). 고르는 행위가 의례다.
// 리추얼이므로 EndRating 없음(기분 측정이 의례의 결을 깬다).

function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function todayFortune() {
  const d = new Date()
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  return fortunePool.items[hashStr('fortune:' + key) % fortunePool.items.length]
}

// 쿠키 반쪽 — 부드러운 앰버 그라데이션 + 살짝의 하이라이트
function CookieHalf({ flip = false, size = 'w-16 h-20' }) {
  return (
    <svg viewBox="0 0 80 96" className={size} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <defs>
        <linearGradient id={`ckg${flip ? 'r' : 'l'}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0C878" />
          <stop offset="55%" stopColor="#E0A33E" />
          <stop offset="100%" stopColor="#C88A2E" />
        </linearGradient>
      </defs>
      {/* 접힌 반달 조각 */}
      <path
        d="M72 48 C72 20 56 6 34 8 C14 10 4 26 6 46 C8 68 22 88 44 90 C58 91 70 76 72 48 Z"
        fill={`url(#ckg${flip ? 'r' : 'l'})`}
      />
      {/* 갈라진 단면 */}
      <path d="M72 48 C70 74 58 91 44 90 C52 76 56 62 72 48 Z" fill="#F3E7CC" opacity="0.9" />
      {/* 하이라이트 */}
      <path d="M20 22 C28 14 40 12 48 15 C38 16 28 20 22 30 Z" fill="#FFF" opacity="0.35" />
    </svg>
  )
}

export default function FortuneCookie({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → cracked
  const fortune = todayFortune()

  return (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          {phase === 'intro' && (
            <>
              <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>포춘 쿠키</p>
              <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
              <p className="text-[14px] text-r-gray font-light mb-10 leading-relaxed">
                오늘 몫의 한 줄이 들어 있어요.<br />마음 가는 쿠키를 하나 골라봐요.
              </p>

              {/* 쿠키 세 개 — 하나를 고르면 톡, 갈라진다 */}
              <div className="relative mx-auto mb-10 flex items-end justify-center gap-4 h-32">
                <span
                  className="absolute inset-x-0 top-2 bottom-0 rounded-full"
                  style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(224,163,62,0.20) 0%, rgba(224,163,62,0) 70%)' }}
                  aria-hidden="true"
                />
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setPhase('cracked')}
                    aria-label={`쿠키 ${i + 1}`}
                    className="relative flex transition duration-300 hover:-translate-y-2 hover:drop-shadow-[0_10px_18px_rgba(17,35,56,0.14)]"
                    style={{ transform: `rotate(${(i - 1) * 7}deg)` }}
                  >
                    <span className="flex -space-x-4">
                      <CookieHalf size="w-11 h-14" />
                      <CookieHalf flip size="w-11 h-14" />
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-[12px] text-r-gray-soft">어떤 쿠키를 골라도, 오늘의 조각은 당신 몫이에요.</p>
            </>
          )}

          {phase === 'cracked' && (
            <>
              <p className="eyebrow mb-8">오늘의 조각</p>

              {/* 갈라진 쿠키 + 종이 조각 */}
              <div className="relative mx-auto mb-10 w-full max-w-xs">
                <div className="flex items-center justify-center gap-24 mb-[-46px]">
                  <span style={{ transform: 'rotate(-16deg)', animation: 'crackL 0.5s ease both' }}><CookieHalf /></span>
                  <span style={{ transform: 'rotate(16deg)', animation: 'crackR 0.5s ease both' }}><CookieHalf flip /></span>
                </div>
                <div
                  className="relative mx-auto bg-white border border-line rounded-2xl px-6 py-7 shadow-[0_12px_36px_rgba(17,35,56,0.08)]"
                  style={{ animation: 'slipUp 0.6s 0.25s ease both' }}
                >
                  <p className="font-serif text-[17px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>
                    {fortune.text}
                  </p>
                </div>
                <style>{`
                  @keyframes crackL { 0% { transform: rotate(0) translateX(24px); } 100% { transform: rotate(-16deg) translateX(0); } }
                  @keyframes crackR { 0% { transform: rotate(0) translateX(-24px); } 100% { transform: rotate(16deg) translateX(0); } }
                  @keyframes slipUp { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
                `}</style>
              </div>

              <p className="text-[12px] text-r-gray-soft mb-8">오늘 다시 열어도, 같은 조각이 기다려요.</p>
              <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
                오늘의 몫으로 챙길게요
              </button>
            </>
          )}
        </div>
      </div>
    </ModuleFrame>
  )
}
