// 룰랭 음성 레이어.
// ElevenLabs(/api/tts 프록시) 음성을 우선 쓰고, 미설정(키 없음)·실패 시 브라우저 TTS로 폴백.
// 같은 문구는 세션 내 캐시해 재생성 비용을 줄인다.
let elState = 'unknown' // 'unknown' | 'on' | 'off'
// 서버 voice_settings를 바꿀 때마다 올린다 → URL이 바뀌어 immutable 캐시(브라우저·CDN)를 우회.
const TTS_REV = 2
const cache = new Map() // 'voice|text' -> objectURL
const inflight = new Map() // 'voice|text' -> Promise<url>
let currentAudio = null
let koVoice = null

// ── 오디오 출력 예열 ──────────────────────────────────────────────
// 브라우저는 세션 첫 재생 때 출력 스트림이 깨어나며 앞부분(수백 ms)을 흘린다.
// 그래서 진입 즉시 말하는 모듈(STOP 등)은 첫 단어가 잘린다.
// 첫 사용자 제스처에서 무음을 한 번 재생해 스트림을 미리 열어 둔다.
let warmed = false
function makeSilentWavUrl(ms = 250) {
  const rate = 8000
  const n = Math.floor((rate * ms) / 1000)
  const buf = new ArrayBuffer(44 + n * 2)
  const dv = new DataView(buf)
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
  wr(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE'); wr(12, 'fmt ')
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true)
  dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true)
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); wr(36, 'data'); dv.setUint32(40, n * 2, true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })) // 샘플이 모두 0 = 무음
}
export function warmupAudio() {
  if (warmed) return
  warmed = true
  try {
    const a = new Audio(makeSilentWavUrl())
    a.volume = 0.01
    a.play().catch(() => {})
  } catch { /* noop */ }
}

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

// 발화 세대 토큰: 새 발화나 정지가 생기면 올라간다.
// fetch가 늦게 도착한 옛 발화는 자기 세대가 최신이 아니면 재생하지 않는다(겹침 방지).
let speakSeq = 0

export function stopSpeaking() {
  speakSeq++ // 진행/대기 중이던 발화를 모두 무효화
  if (currentAudio) { try { currentAudio.pause() } catch { /* noop */ } currentAudio = null }
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// 브라우저 내장 TTS (폴백). 남성은 피치를 낮춰 최소한의 구분을 준다.
export function webSpeak(text, voice = 'female') {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  ensureVoice()
  const u = new SpeechSynthesisUtterance(humanize(text))
  u.lang = 'ko-KR'
  if (koVoice) u.voice = koVoice
  u.rate = 0.9
  u.pitch = voice === 'male' ? 0.8 : 1.02
  u.volume = 0.95
  window.speechSynthesis.speak(u)
}

async function fetchTts(text, voice) {
  const key = voice + '|' + text
  if (cache.has(key)) return cache.get(key)
  if (inflight.has(key)) return inflight.get(key)
  const promise = (async () => {
    const q = import.meta.env.BASE_URL + 'api/tts?text=' + encodeURIComponent(text) + (voice === 'male' ? '&voice=male' : '') + '&rev=' + TTS_REV
    const res = await fetch(q)
    if (res.status === 501) { elState = 'off'; throw new Error('not_configured') }
    if (!res.ok) throw new Error('tts_' + res.status)
    const blob = await res.blob()
    if (!blob.size || !/audio/i.test(blob.type)) throw new Error('bad_audio')
    const url = URL.createObjectURL(blob)
    cache.set(key, url)
    elState = 'on'
    return url
  })()
  inflight.set(key, promise)
  try { return await promise } finally { inflight.delete(key) }
}

// ElevenLabs 우선, 실패 시 브라우저 폴백. voice: 'female'(기본) | 'male'
export async function speakSmart(text, voice = 'female') {
  if (!text) return
  stopSpeaking()          // 이전 발화 즉시 중단 + 세대 증가
  const seq = speakSeq    // 이 발화의 세대
  if (elState === 'off') { webSpeak(text, voice); return }
  try {
    const url = await fetchTts(text, voice)
    if (seq !== speakSeq) return // 그 사이 다음으로 넘어갔음(새 발화/정지) → 재생 안 함
    const audio = new Audio(url)
    audio.volume = 0.95
    currentAudio = audio
    await audio.play().catch(() => {})
  } catch {
    if (seq !== speakSeq) return
    webSpeak(text, voice) // 일시 실패는 이번만 폴백(키 없음 501 이면 elState=off 로 영구 폴백)
  }
}
