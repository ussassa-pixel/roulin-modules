// ════════════════════════════════════════════════════════════════
//  dailyAction.js — ① 오늘의 행동 하나 (v4 §3) 노출 로직
//
//  성격: 모듈이 아니라 라우터/런처가 제안하는 일일 초소형 행동.
//  smallest_step 과의 구분 — 그건 사용자가 자기 과제를 스스로 줄이는
//  도구(사용자→), 이건 앱이 범용 행동을 제안(→사용자).
//
//  규칙(전부 여기서 결정적으로 처리):
//   - 1일 1개 (같은 날짜키 → 같은 항목. 저장은 호출자 몫)
//   - timeband 매칭 (morning|day|evening|night)
//   - 같은 항목 7일 내 재노출 금지 (recentIds 로 호출자가 넘김)
//   - 위기 L1+ 시 비노출 (null 반환)
//   - weather 조건 항목(비 냄새 등)은 해당 날씨 신호가 있을 때만
//   - preferDomains: 대화에서 유추한 도메인이 있으면 그쪽을 우선
//  콘텐츠 풀: src/content/dailyActions.json (DRAFT — SW 감수 필요)
//
//  ★ 개인화 계약 (서비스 통합 시):
//   1순위 — 룰랭 서비스의 LLM이 그날의 대화에서 그 사람의 상황·수준에
//           맞는 행동 한 줄을 직접 생성한다(③ stateSignal 확장).
//   2순위 — 생성 실패/저신뢰 시 이 풀에서 preferDomains·weather 신호로
//           고른다. 이 파일은 그 폴백 + 시그널 반영 지점이다.
// ════════════════════════════════════════════════════════════════

const CRISIS_RANK = { none: 0, L1: 1, L2: 2, L3: 3 }

/** 로컬 기준 날짜키 YYYY-MM-DD — '오늘' 판정과 결정적 선택의 시드 */
export function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 현재 시각의 timeband */
export function timebandOf(d) {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'day'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

// 결정적 문자열 해시(djb2) — 같은 날짜키면 같은 선택
function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * 오늘의 행동 하나를 고른다. 결정적: 같은 입력 → 같은 결과.
 * @param {Array<{id:string,text:string,domain:string,timeband:string[],safety:string,weather?:string}>} items
 * @param {{ now?: Date, recentIds?: string[], crisisLevel?: 'none'|'L1'|'L2'|'L3',
 *           weather?: string|null, preferDomains?: string[] }} [opts]
 *   recentIds: 최근 7일 내 노출된 항목 id (호출자가 로그에서 계산해 넘김)
 *   weather: 'rain' 등 날씨 신호 (없으면 날씨 조건 항목 제외)
 *   preferDomains: ③ stateSignal에서 유추한 도메인 — 매칭 항목이 있으면 그쪽에서만 고름
 * @returns {object|null} 항목 또는 null(위기 L1+ / 적합 항목 없음)
 */
export function pickDailyAction(items, opts = {}) {
  const { now = new Date(), recentIds = [], crisisLevel = 'none', weather = null, preferDomains = [] } = opts
  if ((CRISIS_RANK[crisisLevel] ?? 0) >= CRISIS_RANK.L1) return null // 위기 시 비노출

  const band = timebandOf(now)
  const eligible = items
    .filter((it) => it.safety === 'general')
    .filter((it) => it.timeband.includes(band))
    .filter((it) => !it.weather || it.weather === weather)
    .filter((it) => !recentIds.includes(it.id))

  if (eligible.length === 0) return null

  // 대화 신호가 있으면 그 도메인을 우선 (매칭이 하나도 없으면 전체로 폴백)
  let pool = eligible
  if (preferDomains.length > 0) {
    const preferred = eligible.filter((it) => preferDomains.includes(it.domain))
    if (preferred.length > 0) pool = preferred
  }

  const idx = hashStr(dateKey(now) + ':' + band) % pool.length
  return pool[idx]
}
