// Vercel 서버리스 함수: ElevenLabs TTS 프록시 + Blob 영구 캐시.
// API 키는 서버 환경변수에만 두고(클라이언트 미노출), 오디오(mp3)만 반환한다.
//
// 과금 구조 (2026-07-10, 호영님 문의 반영): 같은 문구·목소리·설정 조합은
// 최초 1회만 ElevenLabs에서 생성해 Vercel Blob에 저장하고, 이후 요청은
// 저장된 음원으로 302 리다이렉트한다 → 재생성 과금 없음.
//
// 저장 구조 (검수·재생성 지원):
//   tts/<hash>-<rev>.mp3  — 음원. 재생성 시 rev가 바뀐 새 파일 (CDN 캐시 무효화)
//   tts/<hash>.json       — 원문 메타 {text, voice, ...} (관리 페이지 표시용, 덮어쓰기 허용)
// 조회는 list(prefix)로 최신 rev를 찾는다. 재생성은 api/tts-admin.js 참조.
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
import { resolveVoice, cacheKeyFor, findLatestAudio, generateAndStore } from './_tts-core.js'

export default async function handler(req, res) {
  if (!process.env.ELEVENLABS_API_KEY) {
    res.status(501).json({ error: 'elevenlabs_not_configured' })
    return
  }
  const text = String((req.query && req.query.text) || '').slice(0, 600).trim()
  if (!text) {
    res.status(400).json({ error: 'no_text' })
    return
  }
  const voice = String((req.query && req.query.voice) || '') === 'male' ? 'male' : 'female'
  const cfg = resolveVoice(voice)
  const hash = cacheKeyFor(cfg, text)
  const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

  if (blobEnabled) {
    try {
      const stored = await findLatestAudio(hash)
      if (stored) {
        res.setHeader('cache-control', 'public, max-age=604800, immutable')
        res.setHeader('x-tts-source', 'blob')
        res.redirect(302, stored.url)
        return
      }
    } catch {
      // 조회 실패 → 아래에서 생성
    }
  }

  try {
    const { buf } = await generateAndStore(cfg, text, hash, { store: blobEnabled })
    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('cache-control', 'public, max-age=604800, immutable')
    res.setHeader('x-tts-source', 'elevenlabs')
    res.status(200).send(buf)
  } catch (e) {
    const detail = String(e && e.message || e).slice(0, 300)
    if (detail.startsWith('tts_failed')) {
      res.status(502).json({ error: 'tts_failed', detail })
    } else {
      res.status(500).json({ error: 'server_error', detail: detail.slice(0, 200) })
    }
  }
}
