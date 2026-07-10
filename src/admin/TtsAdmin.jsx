import { useEffect, useState } from 'react'

// TTS 음원 검수 페이지 (팀 내부용) — /care/app/?admin=tts
// 저장된 문구별 음원을 들어보고, 어색하면 재생성한다 (명상앱 재생성 로직의 모듈판).
// 새 문구를 미리 생성해 검수 목록에 올릴 수도 있다.
const API = import.meta.env.BASE_URL + 'api/tts-admin'

export default function TtsAdmin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('tts_admin_token') || '')
  const [items, setItems] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [newText, setNewText] = useState('')
  const [newVoice, setNewVoice] = useState('female')

  const call = async (opts = {}) => {
    const res = await fetch(API, {
      headers: { 'x-admin-token': token, ...(opts.body ? { 'content-type': 'application/json' } : {}) },
      ...opts,
    })
    if (res.status === 401) throw new Error('토큰이 올바르지 않습니다')
    if (!res.ok) throw new Error('요청 실패 (' + res.status + ')')
    return res.json()
  }

  const load = async () => {
    setError('')
    try {
      sessionStorage.setItem('tts_admin_token', token)
      const data = await call()
      setItems(data.items)
    } catch (e) {
      setError(String(e.message || e))
      setItems(null)
    }
  }

  const regenerate = async (hash) => {
    setBusy(hash)
    setError('')
    try {
      await call({ method: 'POST', body: JSON.stringify({ hash }) })
      await load()
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setBusy('')
    }
  }

  const createNew = async () => {
    if (!newText.trim()) return
    setBusy('new')
    setError('')
    try {
      await call({ method: 'POST', body: JSON.stringify({ text: newText.trim(), voice: newVoice }) })
      setNewText('')
      await load()
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setBusy('')
    }
  }

  useEffect(() => {
    if (token) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-serif text-[24px] text-navy mb-1" style={{ fontWeight: 600 }}>TTS 음원 검수</p>
        <p className="text-[13px] text-r-gray-soft mb-6">문구별 저장 음원을 들어보고, 어색하면 재생성하세요. 재생성해도 과금은 그 1회뿐입니다.</p>

        <div className="flex gap-2 mb-6">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="관리 토큰"
            className="flex-1 px-4 py-2 rounded-lg border border-line bg-white text-[14px]"
          />
          <button onClick={load} className="px-5 py-2 bg-navy text-white rounded-lg text-[14px]">불러오기</button>
        </div>

        {error && <p className="text-[13px] text-red-600 mb-4">{error}</p>}

        {items && (
          <>
            <div className="roulin-card p-4 mb-6">
              <p className="text-[13px] text-navy mb-2" style={{ fontWeight: 600 }}>새 문구 사전 생성 (검수용)</p>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={2}
                placeholder="모듈에서 읽을 문구를 붙여넣기"
                className="w-full px-3 py-2 rounded-lg border border-line text-[14px] mb-2"
              />
              <div className="flex gap-2 items-center">
                <select value={newVoice} onChange={(e) => setNewVoice(e.target.value)} className="px-3 py-2 rounded-lg border border-line text-[13px]">
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
                <button onClick={createNew} disabled={busy === 'new'} className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] disabled:opacity-50">
                  {busy === 'new' ? '생성 중…' : '생성'}
                </button>
              </div>
            </div>

            <p className="text-[12px] text-r-gray-soft mb-3">{items.length}개 문구 저장됨</p>
            {items.map((it) => (
              <div key={it.hash} className="roulin-card p-4 mb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-[14px] text-navy leading-relaxed flex-1">{it.text}</p>
                  <span className="tag-pill shrink-0">{it.voice === 'male' ? '남성' : '여성'}</span>
                </div>
                <div className="flex items-center gap-3">
                  {it.url ? <audio controls preload="none" src={it.url} className="h-9 flex-1" /> : <p className="text-[12px] text-r-gray-soft flex-1">음원 없음</p>}
                  <button
                    onClick={() => regenerate(it.hash)}
                    disabled={busy === it.hash}
                    className="px-4 py-2 text-[13px] rounded-lg border border-line text-navy hover:bg-white disabled:opacity-50"
                  >
                    {busy === it.hash ? '재생성 중…' : '재생성'}
                  </button>
                </div>
                {it.generatedAt && <p className="text-[11px] text-r-gray-soft mt-2">생성: {new Date(it.generatedAt).toLocaleString('ko-KR')}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
