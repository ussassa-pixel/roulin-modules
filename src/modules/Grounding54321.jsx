import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

const STEPS = [
  { count: 5, sense: '보이는 것',   label: '눈에 들어오는 것',   hint: '주변을 천천히 둘러봐요',             color: 'from-rose-50 to-stone-50',    orb: 'bg-rose-200/30' },
  { count: 4, sense: '들리는 것',   label: '귀에 들리는 소리',   hint: '가까운 소리, 먼 소리',              color: 'from-amber-50 to-stone-50',   orb: 'bg-amber-200/30' },
  { count: 3, sense: '만져지는 것', label: '몸에 닿는 감각',     hint: '옷, 의자, 발바닥의 느낌',           color: 'from-emerald-50 to-stone-50', orb: 'bg-emerald-200/30' },
  { count: 2, sense: '냄새',        label: '맡아지는 냄새',      hint: '없어도 괜찮아요. 상상해도 좋아요',  color: 'from-sky-50 to-stone-50',     orb: 'bg-sky-200/30' },
  { count: 1, sense: '맛',          label: '입 안의 맛',         hint: '없어도 괜찮아요. 기억의 맛도 좋아요', color: 'from-indigo-50 to-stone-50', orb: 'bg-indigo-200/30' },
]

export default function Grounding54321({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [items, setItems] = useState({ 5: [], 4: [], 3: [], 2: [], 1: [] })
  const [currentInput, setCurrentInput] = useState('')

  const currentStep = STEPS[stepIndex]
  const currentItems = currentStep ? items[currentStep.count] : []
  const isStepComplete = currentItems.length >= (currentStep?.count || 0)

  const addItem = () => {
    if (!currentInput.trim() || !currentStep) return
    setItems((prev) => ({
      ...prev,
      [currentStep.count]: [...prev[currentStep.count], currentInput.trim()],
    }))
    setCurrentInput('')
  }

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
      setCurrentInput('')
    } else {
      setPhase('done')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStepComplete) addItem()
      else goNext()
    }
  }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl animate-drift" />
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl animate-drift" style={{ animationDelay: '5s' }} />
        </div>

        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="text-2xl text-stone-700 mb-3 font-light">5-4-3-2-1</p>
            <p className="text-sm text-stone-500 mb-12 leading-relaxed">
              감각으로 지금 이 자리로 돌아와요<br />
              <span className="text-xs">보이는 5개 · 들리는 4개 · 만져지는 3개 · 냄새 2개 · 맛 1개</span>
            </p>

            <div className="flex justify-center items-end gap-3 mb-12">
              {[5, 4, 3, 2, 1].map((n, i) => (
                <div
                  key={n}
                  className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-stone-600 animate-fade-up"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {n}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('running')}
              className="w-full p-5 bg-white/80 backdrop-blur rounded-2xl hover:bg-white transition text-stone-700"
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
      <div className={`min-h-screen relative bg-gradient-to-br ${currentStep.color} transition-all duration-[2000ms]`}>
        <button
          onClick={onExit}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 z-20 text-sm"
        >
          나가기
        </button>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full ${currentStep.orb} blur-3xl animate-breath-slow`} />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span key={`${stepIndex}-${currentItems.length}`} className="text-7xl font-light text-stone-700 animate-fade-up">
                  {currentStep.count - currentItems.length}
                </span>
                <span className="text-xl text-stone-500">개의</span>
              </div>
              <p className="text-xl text-stone-700 font-light">{currentStep.sense}</p>
              <p className="text-xs text-stone-400 mt-2">{currentStep.hint}</p>
            </div>

            {currentItems.length > 0 && (
              <div className="space-y-2 mb-4 animate-fade-in">
                {currentItems.map((item, i) => (
                  <div key={i} className="p-3 bg-white/60 backdrop-blur rounded-xl text-stone-600 text-sm">
                    ✓ {item}
                  </div>
                ))}
              </div>
            )}

            {!isStepComplete && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${currentStep.label} 하나...`}
                  className="w-full p-4 bg-white/80 backdrop-blur rounded-2xl border-none outline-none text-stone-700 placeholder-stone-400"
                  autoFocus
                />
                <button
                  onClick={addItem}
                  disabled={!currentInput.trim()}
                  className={`w-full p-3 rounded-2xl transition ${
                    currentInput.trim()
                      ? 'bg-stone-700 text-white hover:bg-stone-800'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  추가
                </button>
              </div>
            )}

            {isStepComplete && (
              <button
                onClick={goNext}
                className="w-full p-4 bg-stone-700 text-white rounded-2xl hover:bg-stone-800 transition animate-fade-in"
              >
                {stepIndex < STEPS.length - 1 ? '다음 감각으로' : '마무리'}
              </button>
            )}

            <div className="flex justify-center gap-2 mt-12">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-700 ${
                    i < stepIndex  ? 'w-6 bg-stone-400'
                    : i === stepIndex ? 'w-6 bg-stone-600'
                    : 'w-6 bg-stone-300/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )
  }

  return null
}
