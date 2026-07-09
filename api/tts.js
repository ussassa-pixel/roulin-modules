// Vercel 서버리스 함수: ElevenLabs TTS 프록시.
// API 키는 서버 환경변수에만 두고(클라이언트 미노출), 오디오(mp3)만 반환한다.
//
// 필요한 환경변수 (Vercel → Project → Settings → Environment Variables):
//   ELEVENLABS_API_KEY        (필수)  — 없으면 501 → 클라이언트가 브라우저 음성으로 폴백
//   ELEVENLABS_VOICE_ID       (선택)  — 여성(기본) voice id (기본: 스톡 보이스)
//   ELEVENLABS_MALE_VOICE_ID  (선택)  — 남성 voice id (없으면 여성으로 폴백)
//   ELEVENLABS_MODEL_ID       (선택)  — 기본 eleven_multilingual_v2 (한국어 지원)
//
// 쿼리: ?text=...&voice=male|female  (voice 생략 시 여성)
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
  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: modelId,
          // 명상앱(octos-be TTSService)과 동일한 설정 — style/use_speaker_boost 없음(더 자연스럽게)
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
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
