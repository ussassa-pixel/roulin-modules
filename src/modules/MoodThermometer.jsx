import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'

// ── 마음 온도 → 색 ────────────────────────────────────────────────
// valence(불쾌 0 ↔ 좋음 100) · arousal(가라앉음 0 ↔ 들뜸 100)을
// 사분면 코너색으로 이중선형 보간 → 슬라이더를 움직이면 색이 연속적으로 바뀐다.
const CREAM = [246, 243, 235]
const mix = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t))

function moodColor(valence, arousal) {
  const vx = valence / 100
  const ay = arousal / 100
  const lowNeg = [166, 190, 226]  // 가라앉음 — 차가운 파랑
  const highNeg = [240, 165, 150] // 불안·긴장 — 따뜻한 코랄
  const lowPos = [173, 216, 183]  // 평온 — 연두
  const highPos = [242, 199, 118] // 설렘·활기 — 골드
  const bottom = mix(lowNeg, lowPos, vx)   // arousal 낮음
  const top = mix(highNeg, highPos, vx)    // arousal 높음
  return mix(bottom, top, ay)
}

export default function MoodThermometer({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [valence, setValence] = useState(50)
  const [arousal, setArousal] = useState(50)
  const [pickedWord, setPickedWord] = useState(null)

  const tint = moodColor(valence, arousal)
  const soft = mix(tint, CREAM, 0.32) // 배경용 은은한 톤
  // 온도 색이 위에서 번지고 아래로 크림으로 잦아드는 배경. 슬라이더에 따라 부드럽게 전환.
  const bgStyle = {
    background: `radial-gradient(135% 105% at 50% 6%, rgb(${soft}) 0%, #F6F3EB 52%, #F1EEE3 100%)`,
    transition: 'background 0.6s ease',
  }
  const blob = `rgb(${tint})`

  const getWords = () => {
    const highArousal = arousal >= 50
    const positive = valence >= 50
    if (positive && highArousal) return ['설렘', '활기참', '기대됨', '들뜸']
    if (positive && !highArousal) return ['평온함', '편안함', '안도됨', '만족스러움']
    if (!positive && highArousal) return ['불안함', '초조함', '짜증남', '긴장됨']
    return ['가라앉음', '지침', '공허함', '무기력함']
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-200/25 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#E0A33E]/15 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>지금 마음 온도</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray mb-12 leading-relaxed font-light">
              맞히려 애쓰지 않아도 괜찮습니다.<br />
              지금 느낌에 가까운 쪽으로 옮겨 봅니다.
            </p>
            <button
              onClick={() => setPhase('running')}
              className="w-full py-4 bg-navy text-white rounded-full text-[14px] tracking-wide hover:bg-[#0c1a2b] transition active:scale-[0.98]"
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
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10" style={bgStyle}>
          {/* 온도 색으로 물드는 은은한 글로우 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-breath-slow"
              style={{ background: blob, opacity: 0.22, transition: 'background 0.6s ease' }} />
          </div>
          <div className="max-w-md w-full relative">
            <p className="text-center text-r-gray mb-12 text-lg font-light">
              지금 어느 쪽에 가까운가요?
            </p>

            <div className="mb-10">
              <div className="flex justify-between text-sm text-r-gray-soft mb-2">
                <span>불쾌해요</span>
                <span>좋아요</span>
              </div>
              <input
                type="range" min="0" max="100" value={valence}
                onChange={(e) => setValence(Number(e.target.value))}
                className="w-full accent-amber"
              />
            </div>

            <div className="mb-12">
              <div className="flex justify-between text-sm text-r-gray-soft mb-2">
                <span>가라앉아요</span>
                <span>들떠 있어요</span>
              </div>
              <input
                type="range" min="0" max="100" value={arousal}
                onChange={(e) => setArousal(Number(e.target.value))}
                className="w-full accent-amber"
              />
            </div>

            <button
              onClick={() => setPhase('naming')}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              다음
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'naming') {
    const words = getWords()
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10" style={bgStyle}>
          <div className="max-w-md w-full">
            <p className="text-center text-r-gray mb-3 text-sm">이 중에 가까운 말이 있나요?</p>
            <p className="text-center text-r-gray-soft mb-10 text-xs">없으면 골라도, 안 골라도 괜찮습니다</p>

            <div className="grid grid-cols-2 gap-3 mb-12">
              {words.map((word) => (
                <button
                  key={word}
                  onClick={() => setPickedWord(word)}
                  className={`py-5 rounded-2xl transition border ${
                    pickedWord === word
                      ? 'bg-amber-soft text-navy border-amber/40'
                      : 'bg-white/85 text-ink border-line hover:border-[#DCD5C4]'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPhase('done')}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              마무리
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl animate-breath-slow"
            style={{ background: blob, opacity: 0.28, transition: 'background 0.6s ease' }} />
        </div>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10" style={bgStyle}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-r-gray mb-2 text-sm">지금, 이런 마음이네요</p>
            <p className="font-serif text-[34px] text-navy mb-12" style={{ fontWeight: 600 }}>
              {pickedWord || '여기쯤'}
            </p>
            <p className="text-r-gray mb-12 leading-relaxed text-sm font-light">
              이름을 붙인 것만으로도 충분합니다.<br />
              이대로 머물러도, 뭔가 해봐도 괜찮습니다.
            </p>
            <button
              onClick={onExit}
              className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition"
            >
              닫기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}
