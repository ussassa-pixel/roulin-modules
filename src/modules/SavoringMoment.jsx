import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import { useSpeech } from '../context/SpeechContext'

// 좋은 순간 머무르기 — 음미(Bryant & Veroff) / 확장-구축(Fredrickson).
// 효과 주장 금지: "머물러 보기" 프레이밍만. 라벨 금지(관찰만).
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

// 눈을 감고 음성으로 안내받는 유도 스크립트. dur는 다음 안내까지의 여백(상상할 시간).
const GUIDE = [
  { text: '이제 눈을 편안히 감아볼게요.', dur: 5500 },
  { text: '준비되면, 그 순간으로 천천히 돌아가볼게요.', dur: 7000 },
  { text: '그때 무엇이 보였나요. 어떤 소리가 났나요.', dur: 9000 },
  { text: '조금만 더, 그 느낌에 머물러볼게요.', dur: 9000 },
]

export default function SavoringMoment({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [moment, setMoment] = useState('')
  const [sense, setSense] = useState('')
  const [bodyFeel, setBodyFeel] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>좋은 순간 머무르기</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          오늘, 아주 잠깐이라도<br />괜찮았던 순간이 있었나요?
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">크지 않아도 돼요. 커피 첫 모금 같은 것도.</p>
        <button onClick={() => setPhase('moment')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'moment')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">어떤 순간이었어요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">한 장면으로</p>
        <input className={inputCls} value={moment} onChange={(e) => setMoment(e.target.value)} placeholder="예: 점심에 잠깐 해가 들었을 때" autoFocus />
        <button
          onClick={() => moment.trim() && setPhase('dwell')}
          disabled={!moment.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${moment.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          그 순간에 머무르기
        </button>
      </div>
    )

  if (phase === 'dwell')
    return <Dwell onDone={() => setPhase('sense')} />

  if (phase === 'sense')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">그 순간에서 가장 남는 감각 하나는?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">보임 · 소리 · 온도 · 무엇이든</p>
        <input className={inputCls} value={sense} onChange={(e) => setSense(e.target.value)} placeholder="예: 따뜻함" autoFocus />
        <button
          onClick={() => sense.trim() && setPhase('body')}
          disabled={!sense.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${sense.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
      </div>
    )

  if (phase === 'body')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">지금 몸은 어때요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-8">떠오르는 대로 한 단어도 좋아요</p>
        <input className={inputCls} value={bodyFeel} onChange={(e) => setBodyFeel(e.target.value)} placeholder="예: 조금 느슨해졌어요" autoFocus />
        <button
          onClick={() => bodyFeel.trim() && setPhase('summary')}
          disabled={!bodyFeel.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${bodyFeel.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          정리 보기
        </button>
      </div>
    )

  if (phase === 'summary')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8">
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>
            {moment} <span className="text-amber">—</span> {sense}
          </p>
        </div>
        <p className="text-[13px] text-r-gray mb-10">좋은 순간은 이렇게 한 번 더 살아요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">마무리</button>
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

// dwell — 눈을 감고 음성으로 유도. 각 안내를 목소리로 들려주고 상상할 여백을 둔다.
// 문구 자동 전환 + 언제든 건너뛰기(이탈 허용).
function Dwell({ onDone }) {
  const [i, setI] = useState(0)
  const { speak, stop } = useSpeech()

  useEffect(() => {
    if (i >= GUIDE.length) { onDone(); return }
    speak(GUIDE[i].text) // 남성 음성 안내(단계 여백 ≫ 음성 길이라 잘리지 않음)
    const t = setTimeout(() => setI(i + 1), GUIDE[i].dur)
    return () => clearTimeout(t)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  // dwell을 떠나면(건너뛰기·다음) 안내 음성 정지
  useEffect(() => () => stop(), [stop])

  const cur = GUIDE[Math.min(i, GUIDE.length - 1)]
  const eyesClosed = i === 0

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at 50% 42%, #FBF3DF 0%, #F5F3EB 60%, #F0EDE2 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-200/25 blur-3xl animate-breath-slow" />
      <button onClick={onDone} className="absolute top-6 right-6 text-[11px] tracking-wider font-light text-r-gray-soft hover:text-navy transition z-10">건너뛰기</button>

      {/* 감은 눈 아이콘 — 눈을 감아도 되는 시간임을 알려준다 */}
      <div className="relative z-10 mb-8">
        <ClosedEye />
      </div>

      <p key={i} className="relative z-10 text-center text-[19px] text-navy/80 font-light animate-fade-in leading-relaxed" style={{ minHeight: '56px' }}>
        {cur.text}
      </p>
      {eyesClosed && (
        <p className="relative z-10 mt-3 text-center text-[12px] text-r-gray-soft animate-fade-in">
          소리에 귀만 맡겨 두어도 괜찮아요
        </p>
      )}
    </div>
  )
}

// 감은 눈 — 부드러운 곡선
function ClosedEye() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 16 Q32 36 56 16" stroke="#E0A33E" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* 속눈썹 */}
      <g stroke="#E0A33E" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M16 26 l -3 5" />
        <path d="M25 30 l -2 5.5" />
        <path d="M34 31 l 0 6" />
        <path d="M43 30 l 2 5.5" />
        <path d="M51 26 l 3 5" />
      </g>
    </svg>
  )
}
