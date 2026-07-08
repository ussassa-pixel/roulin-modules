// ════════════════════════════════════════════════════════════════
//  recommend.js — 종료 후 추천 레이어 (결정적/규칙 기반 코어)
//
//  파이프라인(v3 5장):
//   ① safetyGate      위기 L2+ → 일반 추천 전면 차단, safety_connector로
//   ② trigger         (서비스 몫) 이 세션이 모듈 권할 국면인가
//   ③ stateSignal     (LLM/Flash 1콜, 서비스 몫) 상태 신호 추출 — 아래 스텁
//   ④ matchCandidates 상태 → 후보 (여기, 결정적·규칙 기반)
//   ⑤ pick            1~2개 제시
//
//  이 파일은 ①④⑤의 순수 함수만 제공(테스트 가능·비결정성 없음).
//  ②③은 룰랭 서비스 런타임(대화·LLM 접근)에서 붙인다.
// ════════════════════════════════════════════════════════════════

import { MODULES, BY_ID } from './registry.js'

const CRISIS_RANK = { none: 0, L1: 1, L2: 2, L3: 3 }
const rank = (lvl) => CRISIS_RANK[lvl] ?? 0

/**
 * 상태 신호 (③의 산출물). 장기 메모리와 별개의 '지금' 신호.
 * @typedef {Object} StateSignal
 * @property {'listen'|'organize'|'act'|'soothe'} dominantNeed  들어주기/정리/행동/진정
 * @property {string[]} [secondaryNeeds]  확장 니즈: savor|meaning|connect|close ...
 * @property {'self'|'work'|'family'|'relationship'|'health'|'general'} [domain]
 * @property {boolean} [acuteDistress]     급성 디스트레스(높은 각성/고통)
 * @property {'none'|'L1'|'L2'|'L3'} crisisLevel
 * @property {'day'|'evening'|'night'} [timeOfDay]
 * @property {string[]} [themes]           세부 태그(선택)
 * @property {string} [reasonText]         추천 이유용 사용자 발화(verbatim, intro 슬롯)
 */

// ── ① 안전 게이트 (최우선) ────────────────────────────────────
export function safetyGate(signal) {
  if (rank(signal.crisisLevel) >= CRISIS_RANK.L2) {
    return { blocked: true, action: 'safety_connector', reason: '위기 신호(L2+) — 일반 추천 차단' }
  }
  return { blocked: false }
}

// ── ④ 적격성 (금기·안전등급 필터) ─────────────────────────────
export function isEligible(mod, signal) {
  const c = rank(signal.crisisLevel)
  // crisis-bridge 모듈은 일반 추천 대상 아님(안전 흐름 전용)
  if (mod.safetyLevel === 'crisis-bridge') return false
  // 명시적 위기 금기
  if (mod.contra.includes('crisis_L2+') && c >= CRISIS_RANK.L2) return false
  // caution 모듈: 위기 신호가 전혀 없을 때만
  if (mod.safetyLevel === 'caution' && c > CRISIS_RANK.none) return false
  return true
}

// ── ④ 점수 (결정적) ──────────────────────────────────────────
const overlap = (a = [], b = []) => a.filter((x) => b.includes(x)).length

export function scoreModule(mod, signal) {
  let s = 0
  const wantNeeds = [signal.dominantNeed, ...(signal.secondaryNeeds || [])]
  if (overlap(mod.need, wantNeeds) > 0) s += 4

  if (signal.domain) {
    if (mod.domainTags.includes(signal.domain)) s += 2
    else if (mod.domainTags.includes('general')) s += 1
  }
  s += Math.min(3, overlap(mod.themes, signal.themes || []))

  if (signal.acuteDistress) {
    if (mod.need.includes('soothe')) s += 2
    if (mod.durationSec <= 120) s += 1
    if (mod.durationSec >= 210) s -= 1 // 급성일 땐 긴 도구 지양
  }
  if (signal.timeOfDay === 'night' && overlap(mod.themes, ['night', 'sleep']) > 0) s += 2
  return s
}

// ── ④⑤ 후보 매핑 + 제시 ──────────────────────────────────────
/**
 * @param {StateSignal} signal
 * @param {{ n?: number, exclude?: string[] }} [opts]
 *   exclude: 최근 사용/쿨다운 중인 module id (라우터가 넘김)
 * @returns {{blocked:boolean, action?:string, reason?:string, candidates?:Array}}
 */
export function recommend(signal, opts = {}) {
  const { n = 2, exclude = [] } = opts
  const gate = safetyGate(signal)
  if (gate.blocked) return gate

  const scored = MODULES
    .filter((m) => !exclude.includes(m.id))
    .filter((m) => isEligible(m, signal))
    .map((m) => ({ id: m.id, displayName: m.displayName, score: scoreModule(m, signal), durationSec: m.durationSec }))
    .filter((c) => c.score > 0)
    .sort((a, b) => (b.score - a.score) || a.id.localeCompare(b.id)) // 결정적: 점수 desc, id asc

  const candidates = scored.slice(0, n).map((c) => ({
    ...c,
    reason: buildReason(c.id, signal),
  }))
  return { blocked: false, candidates }
}

// 제시용 이유 문구(간단). 실제 카피 톤은 UI에서 다듬음.
function buildReason(id, signal) {
  const ts = BY_ID[id]?.targetStates?.[0]
  return ts ? `${ts}일 때` : ''
}

// ── ③ 상태 신호 추출 (스텁 — 서비스에서 구현) ───────────────
/**
 * 최근 6메시지 + 종착 모드/톤을 Flash 1콜로 StateSignal 로 요약.
 * 프롬프트/스키마는 서비스 레포에. 여기선 계약만 명시.
 * @returns {Promise<StateSignal>}
 */
export async function extractStateSignal(/* conversation, endMode */) {
  throw new Error('extractStateSignal: 서비스 런타임(LLM)에서 구현. StateSignal 계약 참조.')
}
