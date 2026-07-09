// 돌봄 자국 — 사용자가 머문 모듈을 로컬에 조용히 쌓아 둔다.
// 성취/연속 기록(streak)이 아니라 '자국'. 민감 산출물은 저장하지 않고, 무엇을·언제만 남긴다.
const KEY = 'roulin_care_log'
const MAX = 200

export function getCareLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

// entry: { id, title, tag }
export function logCare(entry) {
  if (!entry || !entry.id) return
  try {
    const log = getCareLog()
    log.push({ id: entry.id, title: entry.title || '', tag: entry.tag || '', at: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX)))
  } catch {
    /* localStorage 불가 시 조용히 넘어감 */
  }
}

export function clearCareLog() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
