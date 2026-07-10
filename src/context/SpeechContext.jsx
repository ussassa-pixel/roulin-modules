import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { speakSmart, stopSpeaking, warmupAudio } from '../lib/tts'

const SpeechContext = createContext(null)

export function SpeechProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)

  // 사용자 제스처마다 오디오 출력을 예열(내부에서 최근 재생 있으면 스킵) →
  // 런처에 머물다 들어와도 진입 즉시 말하는 모듈(STOP 등)의 첫 단어가 잘리지 않도록.
  useEffect(() => {
    const onDown = () => warmupAudio()
    window.addEventListener('pointerdown', onDown, { capture: true })
    return () => window.removeEventListener('pointerdown', onDown, { capture: true })
  }, [])

  // 발화가 끝날 때 resolve되는 Promise 반환 — 모듈이 음성 길이에 단계를 맞출 수 있다.
  const speak = useCallback((text) => {
    if (isMutedRef.current || !text) return Promise.resolve()
    return speakSmart(text, 'male') // 남성 목소리 고정. ElevenLabs 우선, 실패 시 브라우저 음성 폴백
  }, [])

  // 단계 전환·나가기 때 이전 음성을 끊기 위해 모듈에 노출
  const stop = useCallback(() => stopSpeaking(), [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      isMutedRef.current = next
      if (next) stopSpeaking()
      return next
    })
  }, [])

  return (
    <SpeechContext.Provider value={{ isMuted, toggleMute, speak, stop }}>
      {children}
    </SpeechContext.Provider>
  )
}

export function useSpeech() {
  return useContext(SpeechContext)
}
