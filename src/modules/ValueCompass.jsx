import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'
import StepScene from '../components/StepScene'

// 나의 나침반 — ACT 가치 명료화(Hayes). '왜'를 다룸(행동 모듈의 '무엇을'과 구분).
// 안전: 라우터 게이트 통과 후에만 추천되는 전제. 의미 상실을 파고들지 않고 '지금 소중한 것 하나'로만 향함.
const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

export default function ValueCompass({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [value, setValue] = useState('')
  const [why, setWhy] = useState('')
  const [tinyStep, setTinyStep] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>나의 나침반</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          바쁘게 지내다 보면<br />뭐가 중요했는지 흐려질 때가 있어요.
        </p>
        <button onClick={() => setPhase('value')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'value')
    return page(
      <StepScene key="value" total={3} index={0} accent="#E0A33E" icon="heart" label="소중한 것" question={'요즘의 나에게,\n이것만은 소중하다 싶은 게 있다면?'} hint="사람, 일, 몸, 뭐든 좋아요">
        <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="예: 가족과 저녁 먹는 시간" autoFocus />
        <button
          onClick={() => value.trim() && setPhase('why')}
          disabled={!value.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${value.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={value.trim() ? { background: '#E0A33E' } : {}}
        >
          다음
        </button>
      </StepScene>
    )

  if (phase === 'why')
    return page(
      <StepScene key="why" total={3} index={1} accent="#EDB24A" icon="root" label="이유" question={'그게 소중한 이유를\n한 줄로 적어본다면?'} hint="떠오르는 대로">
        <textarea className={taCls} rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="예: 그때만은 마음이 놓여서" autoFocus />
        <button
          onClick={() => why.trim() && setPhase('tiny')}
          disabled={!why.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${why.trim() ? 'text-white hover:brightness-95' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
          style={why.trim() ? { background: '#EDB24A' } : {}}
        >
          다음
        </button>
      </StepScene>
    )

  if (phase === 'tiny')
    return page(
      <StepScene key="tiny" total={3} index={2} accent="#3E6E8E" icon="foot" label="오늘 한 걸음" question={'오늘 그것에\n아주 조금 가까워지는 방법이 있을까요?'} hint="2분짜리도 좋아요 · 없으면 건너뛰어도 돼요">
        <input className={inputCls} value={tinyStep} onChange={(e) => setTinyStep(e.target.value)} placeholder="예: 오늘은 휴대폰 없이 저녁 먹기" autoFocus />
        <button onClick={() => setPhase('summary')} className="w-full py-4 rounded-full transition mt-5 text-white hover:brightness-95" style={{ background: '#3E6E8E' }}>
          나침반 보기
        </button>
        <button onClick={() => { setTinyStep(''); setPhase('summary') }} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-navy mt-1">
          건너뛰기
        </button>
      </StepScene>
    )

  if (phase === 'summary')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="flex justify-center mb-6"><Compass3D /></div>
        <div className="rounded-2xl bg-amber-soft/50 border border-amber/30 p-6 mb-8 text-left">
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>{value}</p>
          <p className="text-r-gray text-[14px] mt-1.5 leading-relaxed">{why}</p>
          {tinyStep.trim() && <p className="text-[13px] text-amber mt-4">오늘 한 걸음 · <span className="text-ink">{tinyStep}</span></p>}
        </div>
        <p className="text-[13px] text-r-gray mb-10">방향만 알아도, 오늘은 충분해요.</p>
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

// 크고 3D 같은 나침반 — 유리 돔 + 금속 베젤 + 바늘이 흔들리다 자리잡고 미세하게 살아있음
function Compass3D() {
  const C = 82 // center
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15)
  return (
    <svg width="200" height="212" viewBox="0 0 164 176" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="c3-halo" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#E0A33E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#E0A33E" stopOpacity="0" />
        </radialGradient>
        {/* 금속 베젤(위 밝고 아래 어둡게 → 입체) */}
        <linearGradient id="c3-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf6ea" />
          <stop offset="45%" stopColor="#e6d3a6" />
          <stop offset="100%" stopColor="#b1975f" />
        </linearGradient>
        {/* 다이얼 면(오목한 느낌) */}
        <radialGradient id="c3-face" cx="42%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="60%" stopColor="#f4efe2" />
          <stop offset="100%" stopColor="#e3dcc8" />
        </radialGradient>
        {/* 바늘 북(빨강) / 남(강철) */}
        <linearGradient id="c3-north" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0623e" />
          <stop offset="100%" stopColor="#d1402a" />
        </linearGradient>
        <linearGradient id="c3-south" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4a63" />
          <stop offset="100%" stopColor="#1d2a40" />
        </linearGradient>
        {/* 유리 돔 광택 */}
        <radialGradient id="c3-glass" cx="36%" cy="28%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c3-pin" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#d9c38f" />
          <stop offset="100%" stopColor="#9c8047" />
        </radialGradient>
      </defs>

      <ellipse cx={C} cy={C} rx="82" ry="82" fill="url(#c3-halo)" />
      {/* 바닥 그림자(입체 부양감) */}
      <ellipse cx={C} cy="162" rx="52" ry="9" fill="#b8a882" opacity="0.35" />

      {/* 베젤 */}
      <circle cx={C} cy={C} r="72" fill="url(#c3-bezel)" />
      <circle cx={C} cy={C} r="72" fill="none" stroke="#8f7841" strokeWidth="1" opacity="0.5" />
      {/* 다이얼 면 */}
      <circle cx={C} cy={C} r="60" fill="url(#c3-face)" stroke="#cdbf9a" strokeWidth="1" />

      {/* 눈금 */}
      {ticks.map((deg) => {
        const major = deg % 90 === 0
        const a = (deg - 90) * (Math.PI / 180)
        const r1 = 60, r2 = major ? 50 : 55
        return (
          <line key={deg}
            x1={C + r1 * Math.cos(a)} y1={C + r1 * Math.sin(a)}
            x2={C + r2 * Math.cos(a)} y2={C + r2 * Math.sin(a)}
            stroke={major ? '#b1975f' : '#cdbf9a'} strokeWidth={major ? 1.6 : 1} strokeLinecap="round" />
        )
      })}
      {/* 방위 */}
      <text x={C} y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="#d1402a" fontFamily="Lora, serif">N</text>
      <text x={C} y="136" textAnchor="middle" fontSize="12" fill="#7a746a" fontFamily="Lora, serif">S</text>
      <text x="138" y={C + 5} textAnchor="middle" fontSize="12" fill="#7a746a" fontFamily="Lora, serif">E</text>
      <text x="27" y={C + 5} textAnchor="middle" fontSize="12" fill="#7a746a" fontFamily="Lora, serif">W</text>

      {/* 바늘 — 흔들리다 자리잡고(settle) 미세하게 계속 살아있음(sway) */}
      <g className="animate-compass-settle" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <g className="animate-compass-sway" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <g>
            <path d={`M ${C} 34 L ${C + 9} ${C} L ${C} ${C} L ${C - 9} ${C} Z`} fill="url(#c3-north)" />
            <path d={`M ${C} 130 L ${C - 9} ${C} L ${C} ${C} L ${C + 9} ${C} Z`} fill="url(#c3-south)" />
            <path d={`M ${C} 34 L ${C} ${C} L ${C - 9} ${C} Z`} fill="#fff" opacity="0.22" />
          </g>
        </g>
      </g>
      {/* 중심 핀 */}
      <circle cx={C} cy={C} r="6.5" fill="url(#c3-pin)" stroke="#8f7841" strokeWidth="0.8" />
      <circle cx={C - 1.5} cy={C - 1.5} r="1.6" fill="#fff" opacity="0.8" />

      {/* 유리 돔 광택 */}
      <ellipse cx={C - 14} cy={C - 20} rx="42" ry="30" fill="url(#c3-glass)" />
    </svg>
  )
}
