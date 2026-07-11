// 룰랭 음성 레이어.
// 재생 우선순위: ① 사전 생성된 정적 음원(public/voice + voiceManifest, 0.4s 무음 리드인 포함)
// → ② /api/tts (ElevenLabs 프록시, Blob 캐시) → ③ 브라우저 TTS.
// 같은 문구는 세션 내 캐시해 재요청을 줄인다.
// 음원 생성·갱신: scripts/generate-voice.mjs (문구 목록은 scripts/voice-lines.mjs)
import manifest from '../content/voiceManifest.json'

let elState = 'unknown' // 'unknown' | 'on' | 'off' — /api/tts 폴백 경로에만 적용
// 서버 voice_settings를 바꿀 때마다 올린다 → URL이 바뀌어 immutable 캐시(브라우저·CDN)를 우회.
const TTS_REV = 2
const cache = new Map() // 'voice|text' -> objectURL
const inflight = new Map() // 'voice|text' -> Promise<url>
let currentAudio = null
let koVoice = null

// ── 오디오 출력 예열 ──────────────────────────────────────────────
// 브라우저는 재생이 한동안 없으면 출력 스트림이 잠들고, 다음 재생의 앞부분
// (수백 ms)을 흘린다. 그래서 진입 즉시 말하는 모듈(STOP 등)은 첫 단어가 잘린다.
// 세션당 1회 예열로는 부족 — 런처에서 머물다 들어오면 다시 잠들어 있다.
// 최근 재생이 없을 때마다 무음을 짧게 틀어 스트림을 다시 깨운다.
let lastAudioAt = 0
const WARM_IDLE_MS = 15000
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
  if (Date.now() - lastAudioAt < WARM_IDLE_MS) return
  lastAudioAt = Date.now()
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
// 발화가 실제로 끝날 때 resolve — 모듈이 음성 길이에 맞춰 단계를 넘길 수 있게.
export function webSpeak(text, voice = 'female') {
  if (!window.speechSynthesis || !text) return Promise.resolve()
  window.speechSynthesis.cancel()
  ensureVoice()
  const u = new SpeechSynthesisUtterance(humanize(text))
  u.lang = 'ko-KR'
  if (koVoice) u.voice = koVoice
  u.rate = 0.9
  u.pitch = voice === 'male' ? 0.8 : 1.02
  u.volume = 0.95
  return new Promise((resolve) => {
    // onend가 안 오는 환경(음성 없음 등) 대비 상한: 글자수 기반 넉넉히
    const cap = setTimeout(resolve, Math.max(3000, text.length * 250))
    u.onend = u.onerror = () => { clearTimeout(cap); resolve() }
    window.speechSynthesis.speak(u)
  })
}

// 사전 생성된 정적 음원 URL (manifest에 없으면 null → API 폴백)
export function staticVoiceUrl(text, voice) {
  const entry = manifest[voice + '|' + text]
  return entry ? import.meta.env.BASE_URL + 'voice/' + entry.file : null
}

const warnedMisses = new Set()

async function fetchTts(text, voice) {
  const key = voice + '|' + text
  if (cache.has(key)) return cache.get(key)
  if (inflight.has(key)) return inflight.get(key)
  const promise = (async () => {
    // ① 정적 음원 — 서버리스 경유 없음, CDN/브라우저 캐시
    const staticUrl = staticVoiceUrl(text, voice)
    if (staticUrl) {
      try {
        const res = await fetch(staticUrl)
        if (!res.ok) throw new Error('static_' + res.status)
        const blob = await res.blob()
        if (!blob.size || !/audio/i.test(blob.type)) throw new Error('bad_static_audio')
        const url = URL.createObjectURL(blob)
        cache.set(key, url)
        return url
      } catch {
        // 파일 누락 등 — 아래 API 폴백으로 계속
      }
    } else if (Object.keys(manifest).length && !warnedMisses.has(key)) {
      warnedMisses.add(key)
      console.warn('[tts] manifest에 없는 문구 — scripts/voice-lines.mjs 갱신 필요:', text)
    }
    // ② /api/tts 폴백 (ElevenLabs + Blob 캐시)
    if (elState === 'off') throw new Error('not_configured')
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

// 문구들을 미리 받아 캐시에 넣는다(재생 없음) — 진입 즉시 말하는 모듈의 시작 지연 제거.
// 정적 음원은 항상 프리페치, API 폴백 대상은 키가 있을 때만.
export function prefetchTts(texts, voice = 'female') {
  for (const t of texts) {
    if (!t) continue
    if (!staticVoiceUrl(t, voice) && elState === 'off') continue
    fetchTts(t, voice).catch(() => { /* 재생 시점에 폴백 */ })
  }
}

// ElevenLabs 우선, 실패 시 브라우저 폴백. voice: 'female'(기본) | 'male'
// 반환 Promise는 발화가 **끝날 때**(중단 포함) resolve — 단계 전환을 음성에 맞출 수 있다.
export async function speakSmart(text, voice = 'female') {
  if (!text) return
  stopSpeaking()          // 이전 발화 즉시 중단 + 세대 증가
  const seq = speakSeq    // 이 발화의 세대
  if (elState === 'off' && !staticVoiceUrl(text, voice)) { await webSpeak(text, voice); return }
  warmupAudio() // fetch하는 동안 무음으로 출력 스트림을 깨워 첫 단어 잘림 방지
  try {
    const url = await fetchTts(text, voice)
    if (seq !== speakSeq) return // 그 사이 다음으로 넘어갔음(새 발화/정지) → 재생 안 함
    const audio = new Audio(url)
    audio.volume = 0.95
    currentAudio = audio
    lastAudioAt = Date.now()
    await new Promise((resolve) => {
      audio.onended = audio.onerror = audio.onpause = resolve
      audio.play().catch(resolve)
    })
    lastAudioAt = Date.now()
  } catch {
    if (seq !== speakSeq) return
    await webSpeak(text, voice) // 일시 실패는 이번만 폴백(키 없음 501 이면 elState=off 로 영구 폴백)
  }
}
