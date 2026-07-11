// 음원 사전 생성 — voice-lines.mjs의 전 문구를 ElevenLabs로 생성해
// public/voice/<hash>.mp3 + src/content/voiceManifest.json 으로 저장한다.
//
// 실행:  node scripts/generate-voice.mjs [--force]
//   ELEVENLABS_API_KEY 필요 — `vercel env pull .env.local` 후 실행하면 된다.
//   .env.local / .env 를 자동으로 읽는다. --force 는 기존 해시도 전량 재생성.
//
// 설정은 api/_tts-core.js(런타임 폴백)와 동일해야 목소리 톤이 같다.
// 각 음원 앞에 0.4초 무음 리드인을 굽는다(<break/>) — 브라우저 오디오 출력이
// 유휴 후 깨어나며 첫 200~400ms를 감쇠시키는 문제를 무음이 흡수한다.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { VOICE, VOICE_LINES } from './voice-lines.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'voice')
const MANIFEST = path.join(ROOT, 'src', 'content', 'voiceManifest.json')
const FORCE = process.argv.includes('--force')
const LEAD_IN = '<break time="0.4s" />'

// .env.local / .env 간이 로더 (dotenv 의존성 없이)
for (const f of ['.env.local', '.env']) {
  const p = path.join(ROOT, f)
  if (!existsSync(p)) continue
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('ELEVENLABS_API_KEY 가 없습니다. 먼저 `vercel env pull .env.local` 을 실행하세요.')
  process.exit(1)
}

// api/_tts-core.js resolveVoice와 동일한 해석
const femaleId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
const voiceId = VOICE === 'male' ? (process.env.ELEVENLABS_MALE_VOICE_ID || femaleId) : femaleId
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
const voiceSettings = { stability: 0.5, similarity_boost: 0.75 }

const hashOf = (text) =>
  createHash('sha256').update([VOICE, voiceId, modelId, text].join('|')).digest('hex').slice(0, 16)

async function generate(text) {
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: `${LEAD_IN} ${text}`, model_id: modelId, voice_settings: voiceSettings }),
    }
  )
  if (!r.ok) throw new Error(`tts_failed ${r.status} ${(await r.text().catch(() => '')).slice(0, 200)}`)
  return Buffer.from(await r.arrayBuffer())
}

mkdirSync(OUT_DIR, { recursive: true })
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}

let made = 0, skipped = 0, failed = 0
for (const text of VOICE_LINES) {
  const hash = hashOf(text)
  const file = `${hash}.mp3`
  const outPath = path.join(OUT_DIR, file)
  const key = `${VOICE}|${text}`
  if (!FORCE && existsSync(outPath) && manifest[key]?.file === file) {
    skipped++
    continue
  }
  try {
    const buf = await generate(text)
    writeFileSync(outPath, buf)
    // 128kbps CBR → 대략 bytes/16000 초 (리드인 0.4s 포함 실측치)
    const sec = Math.round((buf.length / 16000) * 10) / 10
    manifest[key] = { file, sec }
    made++
    console.log(`✓ ${sec.toFixed(1).padStart(5)}s  ${text.replace(/\n/g, ' ⏎ ').slice(0, 48)}`)
    await new Promise((r) => setTimeout(r, 300)) // rate limit 배려
  } catch (e) {
    failed++
    console.error(`✗ 실패: ${text.slice(0, 40)} — ${e.message}`)
  }
}

// 목록에서 빠진(문구가 바뀐) 항목 정리 — 파일은 남겨두고 manifest만 정돈
const valid = new Set(VOICE_LINES.map((t) => `${VOICE}|${t}`))
for (const key of Object.keys(manifest)) if (!valid.has(key)) delete manifest[key]

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n생성 ${made} · 스킵 ${skipped} · 실패 ${failed} · manifest ${Object.keys(manifest).length}개`)
if (failed > 0) process.exit(1)
