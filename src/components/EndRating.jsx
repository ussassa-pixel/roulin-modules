import { useState } from 'react'

// 음성 없음 — 종료 평가 질문까지 읽어주면 과하다는 피드백(2026-07-11)으로 화면 텍스트만.
export default function EndRating({ onComplete }) {
  const [selected, setSelected] = useState(null)

  const options = [
    { value: 'better', label: '조금 나아졌어요' },
    { value: 'same', label: '비슷해요' },
    { value: 'worse', label: '더 불편해요' },
    { value: 'unsure', label: '잘 모르겠어요' },
  ]

  const handleSelect = (value) => {
    setSelected(value)
    setTimeout(() => onComplete(value), 500)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-sm">
        <p className="font-serif text-[26px] text-navy text-center mb-3 leading-snug" style={{ fontWeight: 600 }}>
          지금 기분<br />어떠세요?
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-12" />

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full py-4 rounded-full text-[14px] transition tracking-wide border ${
                selected === opt.value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-ink border-line hover:border-[#DCD5C4]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onComplete(null)}
          className="w-full mt-5 py-3 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide"
        >
          답하지 않고 닫기
        </button>
      </div>
    </div>
  )
}
