// ════════════════════════════════════════════════════════════════
//  timeSlots.js — ④ 시간대 진입점 (v4 §4) 로직
//
//  신기능이 아니라 기존 모듈의 시간대 기반 패키징.
//  - 클라이언트 시각 기반(서버 불필요)
//  - 슬롯-모듈 매핑은 src/content/timeSlots.json (코드 수정 없이 조정)
//  - 진입 카피는 질문형 1회, 강요 없음
//  - 거절 시 같은 슬롯 인스턴스(당일) 재노출 금지 → slotInstanceKey 로 판정
//  - 야간 슬롯은 저자극 원칙(lowStimulus 플래그, UI가 존중)
// ════════════════════════════════════════════════════════════════

import config from '../content/timeSlots.json'

const toMin = (hm) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

/** now가 슬롯 창(start~end, 자정 넘김 허용) 안인가 */
export function inWindow(now, start, end) {
  const cur = now.getHours() * 60 + now.getMinutes()
  const s = toMin(start)
  const e = toMin(end)
  if (s <= e) return cur >= s && cur < e
  return cur >= s || cur < e // 자정을 넘는 창 (예: 22:00~01:00)
}

/** 지금 활성인 슬롯 (없으면 null) */
export function getActiveSlot(now = new Date(), slots = config.slots) {
  return slots.find((slot) => inWindow(now, slot.start, slot.end)) || null
}

/**
 * 슬롯 인스턴스 키 — "당일 재노출 금지"의 '당일' 단위.
 * 자정을 넘는 창(22:00~01:00)에서 새벽 0시대는 전날 저녁과 같은 인스턴스로 묶는다.
 */
export function slotInstanceKey(slot, now = new Date()) {
  const anchor = new Date(now)
  const s = toMin(slot.start)
  const e = toMin(slot.end)
  const cur = now.getHours() * 60 + now.getMinutes()
  if (s > e && cur < e) anchor.setDate(anchor.getDate() - 1) // 자정 이후 = 전날 인스턴스
  const y = anchor.getFullYear()
  const m = String(anchor.getMonth() + 1).padStart(2, '0')
  const d = String(anchor.getDate()).padStart(2, '0')
  return `${slot.id}:${y}-${m}-${d}`
}

/** 이 인스턴스에서 이미 거절했는가 (declinedKeys: 호출자가 저장소에서 넘김) */
export function isDeclined(slot, now, declinedKeys = []) {
  return declinedKeys.includes(slotInstanceKey(slot, now))
}
