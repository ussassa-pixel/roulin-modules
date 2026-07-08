// Vercel 서버리스 함수: ElevenLabs TTS 프록시.
// API 키는 서버 환경변수에만 두고(클라이언트 미노출), 오디오(mp3)만 반환한다.
//
// 필요한 환경변수 (Vercel → Project → Settings → Environment Variables):
//   ELEVENLABS_API_KEY   (필수)  — 없으면 501 → 클라이언트가 브라우저 음성으로 폴백
//   ELEVENLABS_VOICE_ID  (선택)  — 룰랭 목소리 voice id (기본: 스톡 보이스)
//   ELEVENLABS_MODEL_ID  (선택)  — 기본 eleven_multilingual_v2 (한국어 지원)
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
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: modelId,
          // 차분하고 따뜻한 룰랭 톤
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
        }),
      }
    )
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      res.status(502).json({ error: 'tts_failed', status: r.status, detail: detail.slice(0, 300) })
      return
    }
    const buf = Buffer.from(await r.arrayBuffer())
    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('cache-control', 'public, max-age=604800, immutable')
    res.status(200).send(buf)
  } catch (e) {
    res.status(500).json({ error: 'server_error', detail: String(e).slice(0, 200) })
  }
}
