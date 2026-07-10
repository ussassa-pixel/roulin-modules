// TTS 음원 검수·재생성 API (관리용 — 명상앱의 generate-tts/재생성 로직을 모듈 앱에 맞게 단순화).
// UI: /care/app/?admin=tts (src/admin/TtsAdmin.jsx)
//
// 인증: 요청 헤더 x-admin-token === env TTS_ADMIN_TOKEN (없으면 501).
// GET  → 저장된 문구 목록 [{hash, text, voice, generatedAt, url, uploadedAt}]
// POST {hash}                → 해당 문구 재생성 (새 rev 저장, 옛 rev 삭제)
// POST {text, voice?}        → 새 문구 사전 생성 (검수용 일괄 등록)
import { del, list } from '@vercel/blob'
import { resolveVoice, cacheKeyFor, findLatestAudio, generateAndStore } from './_tts-core.js'

function authed(req) {
  const token = process.env.TTS_ADMIN_TOKEN
  return token && req.headers['x-admin-token'] === token
}

async function readMeta(hash) {
  const { blobs } = await list({ prefix: `tts/${hash}.json` })
  if (!blobs.length) return null
  const r = await fetch(blobs[0].url + '?ts=' + Date.now())
  if (!r.ok) return null
  return r.json().catch(() => null)
}

export default async function handler(req, res) {
  if (!process.env.TTS_ADMIN_TOKEN) {
    res.status(501).json({ error: 'admin_not_configured' })
    return
  }
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(501).json({ error: 'blob_not_configured' })
    return
  }

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'tts/', limit: 1000 })
      const metas = blobs.filter((b) => b.pathname.endsWith('.json'))
      const audios = blobs.filter((b) => b.pathname.endsWith('.mp3'))
      const items = await Promise.all(
        metas.map(async (m) => {
          const hash = m.pathname.replace(/^tts\//, '').replace(/\.json$/, '')
          const revs = audios
            .filter((a) => a.pathname.startsWith(`tts/${hash}-`))
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
          const meta = await fetch(m.url + '?ts=' + Date.now()).then((r) => (r.ok ? r.json() : null)).catch(() => null)
          return {
            hash,
            text: meta?.text || '(메타 없음)',
            voice: meta?.voice || '?',
            generatedAt: meta?.generatedAt || null,
            url: revs[0]?.url || null,
            uploadedAt: revs[0]?.uploadedAt || null,
            revisions: revs.length,
          }
        })
      )
      items.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
      res.status(200).json({ items })
      return
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      // 새 문구 사전 생성
      if (body.text) {
        const text = String(body.text).slice(0, 600).trim()
        const voice = body.voice === 'male' ? 'male' : 'female'
        const cfg = resolveVoice(voice)
        const hash = cacheKeyFor(cfg, text)
        const existing = await findLatestAudio(hash)
        if (existing) {
          res.status(200).json({ hash, url: existing.url, created: false })
          return
        }
        const { url } = await generateAndStore(cfg, text, hash)
        res.status(200).json({ hash, url, created: true })
        return
      }

      // 기존 문구 재생성
      if (body.hash) {
        const hash = String(body.hash)
        const meta = await readMeta(hash)
        if (!meta || !meta.text) {
          res.status(404).json({ error: 'meta_not_found' })
          return
        }
        const cfg = resolveVoice(meta.voice === 'male' ? 'male' : 'female')
        const { blobs: oldRevs } = await list({ prefix: `tts/${hash}-` })
        const { url } = await generateAndStore(cfg, meta.text, hash)
        // 새 rev 저장 성공 후 옛 rev 정리 (실패해도 무해 — list가 최신을 고름)
        if (url && oldRevs.length) {
          await del(oldRevs.map((b) => b.url)).catch(() => {})
        }
        res.status(200).json({ hash, url })
        return
      }

      res.status(400).json({ error: 'text_or_hash_required' })
      return
    }

    res.status(405).json({ error: 'method_not_allowed' })
  } catch (e) {
    res.status(500).json({ error: 'server_error', detail: String(e && e.message || e).slice(0, 300) })
  }
}
