// Vercel 서버리스 함수: ElevenLabs TTS 프록시 + Blob 영구 캐시.
// API 키는 서버 환경변수에만 두고(클라이언트 미노출), 오디오(mp3)만 반환한다.
//
// 과금 구조 (2026-07-10, 호영님 문의 반영): 같은 문구·목소리·설정 조합은
// 최초 1회만 ElevenLabs에서 생성해 Vercel Blob에 저장하고, 이후 요청은
// 저장된 음원으로 302 리다이렉트한다 → 재생성 과금 없음.
// 설정(voice/model/voice_settings)을 바꾸면 해시 키가 바뀌어 자연히 재생성된다.
//
// 필요한 환경변수 (Vercel → Project → Settings → Environment Variables):
//   ELEVENLABS_API_KEY        (필수)  — 없으면 501 → 클라이언트가 브라우저 음성으로 폴백
//   ELEVENLABS_VOICE_ID       (선택)  — 여성(기본) voice id (기본: 스톡 보이스)
//   ELEVENLABS_MALE_VOICE_ID  (선택)  — 남성 voice id (없으면 여성으로 폴백)
//   ELEVENLABS_MODEL_ID       (선택)  — 기본 eleven_multilingual_v2 (한국어 지원)
//   BLOB_READ_WRITE_TOKEN     (자동)  — Blob 스토어(roulin-tts) 연결 시 주입.
//                                       없으면 저장 없이 예전처럼 매번 생성만 한다.
//
// 쿼리: ?text=...&voice=male|female  (voice 생략 시 여성)
import { createHash } from 'node:crypto'
import { head, put } from '@vercel/blob'

export default async function handler(req, res) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    res.status(501).json({ error: 'elevenlabs_not_configured' })
    return
  }
  const text = String((req.query && req.query.text) || '').slice(0, 600).trim()
  if (!text) {
    res.status(400).json({ error: 'no_text' })
    return
  }
  const femaleId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
  const maleId = process.env.ELEVENLABS_MALE_VOICE_ID || femaleId
  const wantMale = String((req.query && req.query.voice) || '') === 'male'
  const voiceId = wantMale ? maleId : femaleId
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
  // 명상앱(octos-be TTSService)과 동일한 설정 — style/use_speaker_boost 없음(더 자연스럽게)
  const voiceSettings = { stability: 0.5, similarity_boost: 0.75 }

  // 캐시 키 = 출력에 영향을 주는 모든 입력의 해시
  const cacheKey = createHash('sha256')
    .update([voiceId, modelId, JSON.stringify(voiceSettings), text].join('\u0000'))
    .digest('hex')
    .slice(0, 40)
  const pathname = `tts/${cacheKey}.mp3`
  const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

  if (blobEnabled) {
    try {
      const stored = await head(pathname)
      res.setHeader('cache-control', 'public, max-age=604800, immutable')
      res.setHeader('x-tts-source', 'blob')
      res.redirect(302, stored.url)
      return
    } catch {
      // 미저장 → 아래에서 생성
    }
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
      }
    )
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      res.status(502).json({ error: 'tts_failed', status: r.status, detail: detail.slice(0, 300) })
      return
    }
    const buf = Buffer.from(await r.arrayBuffer())
    if (blobEnabled) {
      try {
        await put(pathname, buf, {
          access: 'public',
          contentType: 'audio/mpeg',
          addRandomSuffix: false,
          cacheControlMaxAge: 31536000,
        })
      } catch {
        // 저장 실패해도 이번 응답은 정상 반환 (다음 요청이 다시 저장 시도)
      }
    }
    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('cache-control', 'public, max-age=604800, immutable')
    res.setHeader('x-tts-source', 'elevenlabs')
    res.status(200).send(buf)
  } catch (e) {
    res.status(500).json({ error: 'server_error', detail: String(e).slice(0, 200) })
  }
}
