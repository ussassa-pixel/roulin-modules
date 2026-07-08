import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const SpeechContext = createContext(null)

// 사용 가능한 한국어 보이스 중 가장 자연스러운 것을 고른다.
// 네트워크(뉴럴) 보이스가 대개 더 부드럽고 사람에 가깝다 → localService=false 우선.
function pickKoVoice(voices) {
  const ko = voices.filter((v) => /ko(-|_)?KR|Korean|한국/i.test(v.lang + ' ' + v.name))
  if (!ko.length) return null
  const prefer = [
    (v) => /Google/i.test(v.name),                    // Google 한국의 (Chrome, 자연스러움)
    (v) => /SunHi|Heami|InJoon|Microsoft/i.test(v.name), // Windows 뉴럴/표준
    (v) => /Yuna|Siri/i.test(v.name),                 // Apple
    (v) => !v.localService,                            // 네트워크 보이스
    () => true,
  ]
  for (const test of prefer) {
    const hit = ko.find(test)
    if (hit) return hit
  }
  return ko[0]
}

// 딱딱함 완화: 줄바꿈은 짧은 쉼(,)으로, 문장 끝은 부드럽게.
function humanize(text) {
  return text
    .replace(/\s*\n+\s*/g, ', ')
    .replace(/—/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function SpeechProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const voiceRef = useRef(null)

  useEffect(() => {
    if (!window.speechSynthesis) return
    const load = () => { voiceRef.current = pickKoVoice(window.speechSynthesis.getVoices() || []) }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || isMutedRef.current || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(humanize(text))
    u.lang = 'ko-KR'
    if (voiceRef.current) u.voice = voiceRef.current
    // 룰랭 페르소나: 차분하고 따뜻하게 — 조금 느리고, 살짝 낮은 듯 부드러운 톤
    u.rate = 0.9
    u.pitch = 1.02
    u.volume = 0.95
    window.speechSynthesis.speak(u)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      isMutedRef.current = next
      if (next && window.speechSynthesis) window.speechSynthesis.cancel()
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
