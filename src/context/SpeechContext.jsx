import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { speakSmart, stopSpeaking } from '../lib/tts'

const SpeechContext = createContext(null)
const VOICE_KEY = 'roulin_voice'

function initialVoice() {
  try {
    return localStorage.getItem(VOICE_KEY) === 'male' ? 'male' : 'female'
  } catch {
    return 'female'
  }
}

export function SpeechProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const [voice, setVoiceState] = useState(initialVoice)
  const voiceRef = useRef(voice)

  const speak = useCallback((text) => {
    if (isMutedRef.current || !text) return
    speakSmart(text, voiceRef.current) // ElevenLabs 우선, 미설정/실패 시 브라우저 음성으로 폴백
  }, [])

  const setVoice = useCallback((v) => {
    const next = v === 'male' ? 'male' : 'female'
    if (next === voiceRef.current) return
    voiceRef.current = next
    setVoiceState(next)
    try { localStorage.setItem(VOICE_KEY, next) } catch { /* noop */ }
    stopSpeaking() // 진행 중 안내는 멈추고, 다음 안내부터 새 목소리로
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
    <SpeechContext.Provider value={{ isMuted, toggleMute, speak, voice, setVoice }}>
      {children}
    </SpeechContext.Provider>
  )
}

export function useSpeech() {
  return useContext(SpeechContext)
}
