import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { speakSmart, stopSpeaking } from '../lib/tts'

const SpeechContext = createContext(null)

export function SpeechProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)

  const speak = useCallback((text) => {
    if (isMutedRef.current || !text) return
    speakSmart(text) // ElevenLabs 우선, 미설정/실패 시 브라우저 음성으로 폴백
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
