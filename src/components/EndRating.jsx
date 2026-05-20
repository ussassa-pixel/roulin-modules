import { useState, useEffect } from 'react'
import { useSpeech } from '../context/SpeechContext'

export default function EndRating({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const { speak } = useSpeech()

  useEffect(() => {
    speak('지금 기분 어떠세요?')
  }, [speak])

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
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-sm">
        <p className="font-serif text-[26px] text-[#111] text-center mb-2 leading-snug">
          지금 기분<br />어떠세요?
        </p>
        <div className="w-8 h-px bg-[#ccc] mx-auto mb-12" />

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full py-4 rounded-2xl text-[14px] transition font-light tracking-wide ${
                selected === opt.value
                  ? 'bg-[#1C1C1E] text-white'
                  : 'bg-white text-[#333] hover:bg-[#EDEDE9]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onComplete(null)}
          className="w-full mt-5 py-3 text-[12px] text-[#bbb] hover:text-[#888] font-light tracking-wide"
        >
          답하지 않고 닫기
        </button>
      </div>
    </div>
  )
}
