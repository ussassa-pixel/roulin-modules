import { useState, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

const PROMPTS = [
  { label: '첫 번째', placeholder: '아주 작은 것도 괜찮아요. 따뜻한 커피 한 잔, 누군가의 말 한마디...' },
  { label: '두 번째', placeholder: '오늘 잠깐이라도 마음이 가벼웠던 순간이 있었나요?' },
  { label: '세 번째', placeholder: '내가 잘 해낸 것, 누군가에게 받은 것, 그저 다행이었던 것...' },
]

export default function ThreeGoodThings({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [things, setThings] = useState(['', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { speak } = useSpeech()

  useEffect(() => {
    if (phase === 'intro') speak('하루를 돌아보며, 좋았던 순간 세 가지를 적어볼게요.')
    if (phase === 'done') speak('세 가지를 모았어요. 오늘 하루도 이런 순간들이 있었네요.')
  }, [phase, speak])

  useEffect(() => {
    if (phase !== 'writing') return
    speak(`${PROMPTS[currentIndex].label}, 오늘 좋았던 일은 무엇이었나요?`)
  }, [phase, currentIndex, speak])

  const updateThing = (value) => {
    setThings((prev) => { const next = [...prev]; next[currentIndex] = value; return next })
  }

  const goNext = () => {
    if (currentIndex < 2) {
      setCurrentIndex((i) => i + 1)
    } else {
      setPhase('done')
    }
  }

  const canGoNext = things[currentIndex].trim().length > 0

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3 leading-snug">오늘의 세 가지</p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-14 leading-relaxed">
              하루를 돌아보며<br />좋았던 순간 세 가지를 적어볼게요
            </p>
            <button
              onClick={() => setPhase('writing')}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'writing') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center px-6 py-16">
          <div style={{ width: '100%', maxWidth: '320px' }}>
            <div className="flex justify-center gap-2 mb-12">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-px rounded-full transition-all duration-700 ${
                  i < currentIndex ? 'w-10 bg-stone-400'
                  : i === currentIndex ? 'w-10 bg-stone-600'
                  : 'w-10 bg-stone-300'
                }`} />
              ))}
            </div>

            <p key={`label-${currentIndex}`} className="text-[11px] tracking-[0.18em] text-[#bbb] text-center mb-2 animate-fade-up">
              {PROMPTS[currentIndex].label}
            </p>
            <p key={`title-${currentIndex}`} className="font-serif text-[22px] text-[#111] text-center mb-8 animate-fade-up">
              오늘 좋았던 일은?
            </p>

            <textarea
              value={things[currentIndex]}
              onChange={(e) => updateThing(e.target.value)}
              placeholder={PROMPTS[currentIndex].placeholder}
              autoFocus
              style={{
                width: '100%',
                paddingTop: '20px',
                paddingBottom: '20px',
                paddingLeft: '24px',
                paddingRight: '24px',
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRadius: '16px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#111111',
                fontSize: '15px',
                fontWeight: '300',
                lineHeight: '1.75',
                minHeight: '180px',
                marginBottom: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: '"Noto Sans KR", system-ui, sans-serif',
                display: 'block',
              }}
            />

            <button
              onClick={goNext}
              disabled={!canGoNext}
              className={`w-full py-4 rounded-2xl text-[14px] font-light tracking-wide transition ${
                canGoNext
                  ? 'bg-[#1C1C1E] text-white active:scale-[0.98]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {currentIndex < 2 ? '다음' : '마무리'}
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm text-center animate-fade-up">
            <p className="font-serif text-[28px] text-[#111] mb-3">세 가지를 모았어요</p>
            <div className="w-8 h-px bg-[#ccc] mx-auto mb-4" />
            <p className="text-[14px] text-[#999] font-light mb-10 leading-relaxed">
              오늘 하루도 이런 순간들이 있었네요.<br />내일도 또 와요.
            </p>

            <div className="space-y-3 text-left mb-10">
              {things.map((thing, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl text-[#111] text-[14px] font-light leading-relaxed"
                  style={{ padding: '16px 20px' }}
                >
                  <p className="text-[10px] tracking-[0.15em] text-[#bbb] mb-1">{PROMPTS[i].label}</p>
                  <p>{thing}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onExit}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl text-[14px] font-light tracking-wide active:scale-[0.98] transition-transform"
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
