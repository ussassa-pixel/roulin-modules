import { useMemo, useState } from 'react'
import { getActiveSlot, slotInstanceKey, isDeclined } from '../recommendation/timeSlots'

// ④ 시간대 진입점 (v4 §4) — 기존 모듈의 시간대 패키징.
// 진입 카피는 질문형 1회, 강요 없음. 거절 시 같은 슬롯 인스턴스(당일) 재노출 금지.
const DECLINE_KEY = 'roulin_slot_declined' // 슬롯 인스턴스 키 목록, 최근 14개

function getDeclined() {
  try {
    const raw = JSON.parse(localStorage.getItem(DECLINE_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export default function TimeSlotBanner({ modules, onPick }) {
  const [dismissed, setDismissed] = useState(false)

  const slot = useMemo(() => {
    const now = new Date()
    const active = getActiveSlot(now)
    if (!active) return null
    if (isDeclined(active, now, getDeclined())) return null
    return active
  }, [])

  if (!slot || dismissed) return null

  // 매핑된 모듈 중 이 앱에 실제로 있는 것만 (worry_drawer 등 출시 전 항목은 자동 제외)
  const options = slot.modules.map((id) => modules.find((m) => m.id === id)).filter(Boolean)
  if (options.length === 0) return null

  const decline = () => {
    try {
      const log = getDeclined()
      log.push(slotInstanceKey(slot, new Date()))
      localStorage.setItem(DECLINE_KEY, JSON.stringify(log.slice(-14)))
    } catch {
      /* noop */
    }
    setDismissed(true)
  }

  return (
    <div className="max-w-md mx-auto px-6 pb-8">
      <div className="rounded-2xl bg-white border border-line px-6 py-5">
        <span className="eyebrow">{slot.label}</span>
        <p className="font-serif text-[18px] text-navy leading-snug mt-2 mb-1.5" style={{ fontWeight: 600 }}>
          {slot.ask}
        </p>
        <p className="text-[13px] text-r-gray leading-relaxed mb-4">{slot.sub}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((m) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="px-4 py-2 rounded-full bg-navy text-white text-[13px] hover:bg-[#0c1a2b] transition"
            >
              {m.title}
            </button>
          ))}
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-[13px] text-r-gray-soft hover:text-r-gray transition"
          >
            지금은 괜찮아요
          </button>
        </div>
      </div>
    </div>
  )
}
