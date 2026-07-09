import { useMemo, useState } from 'react'
import dailyActions from '../content/dailyActions.json'
import { pickDailyAction, dateKey } from '../recommendation/dailyAction'

// ① 오늘의 행동 하나 (v4 §3) — 런처에 하루 1개 노출.
// 이 데모 앱엔 위기 신호가 없으므로 crisisLevel:'none' 고정.
// 룰랭 서비스에 얹을 땐 라우터가 crisisLevel을 넘겨 L1+에서 비노출한다.
const LOG_KEY = 'roulin_daily_action' // [{id, dateKey, skipped?}] 최근 30개
const LOG_MAX = 30
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function getLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function saveLog(log) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-LOG_MAX)))
  } catch {
    /* noop */
  }
}

export default function DailyActionCard() {
  const [hidden, setHidden] = useState(false)

  const action = useMemo(() => {
    const now = new Date()
    const today = dateKey(now)
    const log = getLog()

    const todayEntry = log.find((e) => e.dateKey === today)
    if (todayEntry) {
      if (todayEntry.skipped) return null // 오늘은 넘김 — 당일 재노출 금지
      const found = dailyActions.items.find((it) => it.id === todayEntry.id)
      if (found) return found // 1일 1개 — 오늘 이미 정해진 항목 유지
    }

    // 최근 7일 노출 항목 제외
    const recentIds = log.filter((e) => now - new Date(e.dateKey) < WEEK_MS).map((e) => e.id)
    const picked = pickDailyAction(dailyActions.items, { now, recentIds, crisisLevel: 'none' })
    if (picked) saveLog([...log.filter((e) => e.dateKey !== today), { id: picked.id, dateKey: today }])
    return picked
  }, [])

  if (!action || hidden) return null

  const skipToday = () => {
    const today = dateKey(new Date())
    const log = getLog()
    saveLog([...log.filter((e) => e.dateKey !== today), { id: action.id, dateKey: today, skipped: true }])
    setHidden(true)
  }

  return (
    <div className="max-w-md mx-auto px-6 pb-8">
      <div className="rounded-2xl bg-amber-soft/50 border border-amber/25 px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow">오늘의 행동 하나</span>
          <span className="tag-pill">{action.domain}</span>
        </div>
        <p className="font-serif text-[17px] text-navy leading-relaxed mb-1" style={{ fontWeight: 600 }}>
          {action.text}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[12px] text-r-gray-soft">해도, 안 해도 괜찮아요.</p>
          <button onClick={skipToday} className="text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
            오늘은 넘기기
          </button>
        </div>
      </div>
    </div>
  )
}
