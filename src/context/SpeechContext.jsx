import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { speakSmart, stopSpeaking, warmupAudio } from '../lib/tts'

const SpeechContext = createContext(null)

export function SpeechProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)

  // 첫 사용자 제스처(런처 카드 탭 등)에서 오디오 출력을 예열 →
  // 진입 즉시 말하는 모듈(STOP 등)의 첫 단어가 잘리지 않도록.
  useEffect(() => {
    const onFirst = () => warmupAudio()
    window.addEventListener('pointerdown', onFirst, { once: true, capture: true })
    return () => window.removeEventListener('pointerdown', onFirst, { capture: true })
  }, [])

  const speak = useCallback((text) => {
    if (isMutedRef.current || !text) return
    speakSmart(text, 'male') // 남성 목소리 고정. ElevenLabs 우선, 실패 시 브라우저 음성 폴백
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      isMutedRef.current = next
      if (next) stopSpeaking()
      return next
    })
  }, [])

  return (
    <SpeechContext.Provider value={{ isMuted, toggleMute, speak }}>
      {children}
    </SpeechContext.Provider>
  )
}

export function useSpeech() {
  return useContext(SpeechContext)
}
