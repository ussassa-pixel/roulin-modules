// ════════════════════════════════════════════════════════════════
//  checkin.js — 경로 C "지금 어때요?" (recommender 스펙 §3, 1단계 출시분)
//
//  대화·시간대 없이 사용자가 상태 칩을 직접 골라 추천을 받는 최소 진입.
//  상태→모듈 매핑을 사용자가 직접 트리거하므로 LLM 불필요 — 전부 순수 규칙.
//  세 경로(A 대화/B 시간대/C 직접 선택) 공통으로 recommend.js 엔진을 통과한다.
//
//  절대 규칙(스펙 §0):
//   · 위기 표현은 상태 칩에 넣지 않는다 — "많이 힘들다면" 안전 링크는
//     추천 엔진과 분리해 UI(CheckIn.jsx)에 상시 노출
//   · 1~2개만 제시, 거절([지금은 괜찮아요])은 항상 동등 노출
//  이 단독 데모엔 위기 신호가 없어 crisisLevel:'none' — 서비스 통합 시
//  safety_checker 판정을 signal에 실어 보내면 엔진 ①게이트가 차단한다.
// ════════════════════════════════════════════════════════════════

import { MODULES, BY_ID } from './registry.js'
import { recommend } from './recommend.js'

// ── 상태 칩 (6~8개, 문구 확정 = 미결 §7 — DRAFT) ──
// signal은 recommend.js의 StateSignal 계약을 따른다. reason은 경로 C의
// 상태 기반 연결문(대화가 없으니 verbatim 인용 대신 칩 기반 문구).
export const CHIPS = [
  {
    key: 'down', label: '처져요',
    signal: { dominantNeed: 'savor', themes: ['uplift', 'activation', 'music'], crisisLevel: 'none' },
    reason: '좀 처진다고 하셔서, 이런 걸 준비했어요.',
  },
  {
    key: 'stuffy', label: '답답해요',
    signal: { dominantNeed: 'savor', secondaryNeeds: ['soothe'], themes: ['mood-shift', 'music', 'breath'], crisisLevel: 'none' },
    reason: '답답하다고 하셔서, 숨 트일 만한 걸 골랐어요.',
  },
  {
    key: 'anxious', label: '불안해요',
    signal: { dominantNeed: 'soothe', acuteDistress: true, themes: ['breath', 'grounding', 'stabilize'], crisisLevel: 'none' },
    reason: '마음이 곤두서 있다고 하셔서, 가라앉힐 만한 걸 골랐어요.',
  },
  {
    key: 'tangled', label: '머리가 복잡해요',
    signal: { dominantNeed: 'organize', themes: ['offload', 'sort'], crisisLevel: 'none' },
    reason: '머리가 복잡하다고 하셔서, 정리할 자리를 준비했어요.',
  },
  {
    key: 'stuck', label: '뭘 할지 모르겠어요',
    signal: { dominantNeed: 'act', themes: ['activation', 'procrastination', 'plan'], crisisLevel: 'none' },
    reason: '막막하다고 하셔서, 아주 작은 시작을 준비했어요.',
  },
  {
    key: 'reset', label: '그냥 리셋하고 싶어요',
    signal: { dominantNeed: 'soothe', themes: ['micro', 'reset', 'ritual'], crisisLevel: 'none' },
    reason: '잠깐 끊어가고 싶다고 하셔서, 가벼운 걸 골랐어요.',
  },
  {
    key: 'hollow', label: '좀 허전해요',
    signal: { dominantNeed: 'savor', secondaryNeeds: ['soothe'], themes: ['music', 'comfort'], crisisLevel: 'none' },
    reason: '마음이 좀 허전하다고 하셔서, 채워줄 만한 걸 골랐어요.',
  },
  // 8번째 칩 [괜찮아요, 둘러볼래요]는 추천이 아니라 브라우즈 출구 — UI에서 처리
]

// ── ② 쿨다운 — 도구형 재추천 피로 방지 (기간 N=3일은 DRAFT, §7 미결) ──
// 연습형(호흡·bodyrelease 등)은 반복이 정상이라 쿨다운 없음.
export const COOLDOWN_DAYS = 3

export function computeCooldownExcludes(careLog, { now = new Date(), days = COOLDOWN_DAYS } = {}) {
  const cutoff = now.getTime() - days * 86400000
  const ids = new Set()
  for (const e of careLog) {
    if (e && e.at >= cutoff) {
      const meta = BY_ID[e.id]
      if (meta && meta.type === 'tool') ids.add(e.id)
    }
  }
  return [...ids]
}

/**
 * 칩 하나 → 엔진(①게이트 → ②필터 → ③스코어 → ④상위 1~2) → 후보.
 * @param {string} chipKey CHIPS의 key
 * @param {{ careLog?: Array, now?: Date }} [opts] careLog: 쿨다운 계산용 사용 기록
 * @returns {{blocked:boolean, action?:string, candidates?:Array, reason?:string}}
 */
export function recommendForChip(chipKey, opts = {}) {
  const chip = CHIPS.find((c) => c.key === chipKey)
  if (!chip) return { blocked: false, candidates: [] }
  const exclude = computeCooldownExcludes(opts.careLog || [], { now: opts.now })
  const res = recommend(chip.signal, { n: 2, exclude })
  return { ...res, reason: chip.reason }
}

// ── [괜찮아요, 둘러볼래요] — 카테고리 브라우즈 (고르고 싶은 사람의 출구) ──
export const CATEGORIES = [
  { key: 'soothe', label: '진정', desc: '가라앉히고, 고르기' },
  { key: 'organize', label: '정리', desc: '꺼내서, 나누기' },
  { key: 'act', label: '행동', desc: '작게, 움직이기' },
  { key: 'uplift', label: '기분 전환', desc: '살짝, 끌어올리기' },
  { key: 'morning', label: '아침', desc: '하루를, 열기' },
]

export function modulesForCategory(key) {
  const match = (m) => {
    if (m.safetyLevel === 'crisis-bridge') return false
    if (key === 'morning') return m.themes.includes('morning')
    if (key === 'uplift') return m.need.includes('savor')
    return m.need.includes(key)
  }
  return MODULES.filter(match).map((m) => m.id)
}
