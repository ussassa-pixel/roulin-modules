// 룰랭 음성 레이어.
// ElevenLabs(/api/tts 프록시) 음성을 우선 쓰고, 미설정(키 없음)·실패 시 브라우저 TTS로 폴백.
// 같은 문구는 세션 내 캐시해 재생성 비용을 줄인다.
let elState = 'unknown' // 'unknown' | 'on' | 'off'
const cache = new Map() // text -> objectURL
const inflight = new Map() // text -> Promise<url>
let currentAudio = null
let koVoice = null

function pickKoVoice(voices) {
  const ko = voices.filter((v) => /ko(-|_)?KR|Korean|한국/i.test(v.lang + ' ' + v.name))
  if (!ko.length) return null
  return (
    ko.find((v) => /Google/i.test(v.name)) ||
    ko.find((v) => /SunHi|Heami|InJoon|Microsoft/i.test(v.name)) ||
    ko.find((v) => /Yuna|Siri/i.test(v.name)) ||
    ko.find((v) => !v.localService) ||
    ko[0]
  )
}
function ensureVoice() {
  if (koVoice || !window.speechSynthesis) return
  koVoice = pickKoVoice(window.speechSynthesis.getVoices() || [])
}
function humanize(t) {
  return t.replace(/\s*\n+\s*/g, ', ').replace(/[—·]/g, ', ').replace(/\s{2,}/g, ' ').trim()
}

export function stopSpeaking() {
  if (currentAudio) { try { currentAudio.pause() } catch { /* noop */ } currentAudio = null }
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// 브라우저 내장 TTS (폴백)
export function webSpeak(text) {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  ensureVoice()
  const u = new SpeechSynthesisUtterance(humanize(text))
  u.lang = 'ko-KR'
  if (koVoice) u.voice = koVoice
  u.rate = 0.9
  u.pitch = 1.02
  u.volume = 0.95
  window.speechSynthesis.speak(u)
}

async function fetchTts(text) {
  if (cache.has(text)) return cache.get(text)
  if (inflight.has(text)) return inflight.get(text)
  const promise = (async () => {
    const res = await fetch('/api/tts?text=' + encodeURIComponent(text))
    if (res.status === 501) { elState = 'off'; throw new Error('not_configured') }
    if (!res.ok) throw new Error('tts_' + res.status)
    const blob = await res.blob()
    if (!blob.size || !/audio/i.test(blob.type)) throw new Error('bad_audio')
    const url = URL.createObjectURL(blob)
    cache.set(text, url)
    elState = 'on'
    return url
  })()
  inflight.set(text, promise)
  try { return await promise } finally { inflight.delete(text) }
}

// ElevenLabs 우선, 실패 시 브라우저 폴백
export async function speakSmart(text) {
  if (!text) return
  stopSpeaking()
  if (elState === 'off') { webSpeak(text); return }
  try {
    const url = await fetchTts(text)
    const audio = new Audio(url)
    audio.volume = 0.95
    currentAudio = audio
    await audio.play().catch(() => {})
  } catch {
    webSpeak(text) // 일시 실패는 이번만 폴백(키 없음 501 이면 elState=off 로 영구 폴백)
  }
}
