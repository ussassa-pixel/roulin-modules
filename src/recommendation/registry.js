// ════════════════════════════════════════════════════════════════
//  registry.js — 41개 모듈 메타데이터 레지스트리 (추천 레이어 선결)
//
//  ⚠️ 임상 필드는 전부 **DRAFT**. safetyLevel / contraindications /
//     targetStates / durationSec 은 SW(임상) 확정이 필요하다.
//     아래 값은 명세(v2 5장, v3 7장)와 각 모듈 구현을 근거로 한 초안.
//
//  용어
//   type        : 'tool'(입력→산출물, 재추천 쿨다운/ priorOutput 대상)
//                 | 'practice'(타이머 가이드, 산출물 없음, 반복 정상)
//   need        : 지배적 니즈. 라우터 상태신호의 dominantNeed와 매칭.
//                 'soothe'(진정) | 'organize'(정리) | 'act'(행동)
//                 | 'savor'(음미/상향) | 'meaning'(가치) | 'connect'(관계)
//                 | 'close'(전환·마무리)
//                 (대화 니즈 'listen'(들어주기)는 모듈이 아니라 대화 몫)
//   domainTags  : 'self' | 'work' | 'family' | 'relationship' | 'health' | 'general'
//   themes      : 세부 매칭용 태그(자유 어휘)
//   safetyLevel : 'general' | 'caution' | 'crisis-bridge'
//   contra      : 금기(초안). 'crisis_L2+' 는 위기 게이트에서 자동 차단.
//   durationSec : 대략치(가변 모듈은 대표값)
//   hasEndRating: 종료 평가 사용 여부
// ════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} ModuleMeta
 * @property {string} id           App.jsx activeModule 키와 동일
 * @property {string} displayName
 * @property {'tool'|'practice'} type
 * @property {string[]} need
 * @property {string[]} domainTags
 * @property {string[]} themes
 * @property {string[]} targetStates  DRAFT
 * @property {'general'|'caution'|'crisis-bridge'} safetyLevel  DRAFT
 * @property {string[]} contra        DRAFT
 * @property {number} durationSec     DRAFT
 * @property {boolean} hasEndRating
 */

/** @type {ModuleMeta[]} */
export const MODULES = [
  // ── 진정 / 호흡 / 감각 ──
  { id: 'breathing', displayName: '호흡 원', type: 'practice', need: ['soothe'], domainTags: ['self', 'health'], themes: ['breath'],
    targetStates: ['마음이 빠르게 달림', '긴장·과각성'], safetyLevel: 'general', contra: [], durationSec: 180, hasEndRating: true },
  { id: 'balloon', displayName: '풍선 호흡', type: 'practice', need: ['soothe'], domainTags: ['self', 'health'], themes: ['breath', 'tactile'],
    targetStates: ['손에 잡히는 진정이 필요'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'finger', displayName: '손가락 호흡', type: 'practice', need: ['soothe'], domainTags: ['self', 'health'], themes: ['breath', 'focus'],
    targetStates: ['눈 둘 곳이 필요'], safetyLevel: 'general', contra: [], durationSec: 100, hasEndRating: true },
  { id: 'grounding', displayName: '5-4-3-2-1', type: 'tool', need: ['soothe'], domainTags: ['self', 'health'], themes: ['grounding', 'sensory'],
    targetStates: ['머릿속이 붕 뜸', '급성 불안·해리감'], safetyLevel: 'general', contra: [], durationSec: 150, hasEndRating: true },
  { id: 'present', displayName: '현재 순간', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['grounding', 'present'],
    targetStates: ['생각이 과거/미래로 흩어짐'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: true },
  { id: 'drinking', displayName: '한 잔의 시간', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['present', 'sensory'],
    targetStates: ['잠깐 멈추고 싶음'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'butterfly', displayName: '나비 포옹', type: 'practice', need: ['soothe'], domainTags: ['self', 'health'], themes: ['stabilize', 'body'],
    targetStates: ['마음이 떨리고 가라앉지 않음'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: true },
  { id: 'bubble', displayName: '뽁뽁이', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['sensory', 'tactile', 'play'],
    targetStates: ['안절부절못함'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'sound', displayName: '소리 정원', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['sensory', 'audio', 'play'],
    targetStates: ['말하고 싶지 않음'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'sand', displayName: '모래 정원', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['sensory', 'tactile', 'play'],
    targetStates: ['손을 움직이고 싶음'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'bodyrelease', displayName: '몸 풀어주기', type: 'practice', need: ['soothe'], domainTags: ['health', 'self'], themes: ['relaxation', 'body', 'pmr'],
    targetStates: ['신체 긴장·과각성'], safetyLevel: 'general', contra: ['통증 부위 강제 금지(카피로 처리)'], durationSec: 120, hasEndRating: true },
  { id: 'compassion', displayName: '자기 다독임', type: 'tool', need: ['soothe'], domainTags: ['self'], themes: ['selfkind'],
    targetStates: ['스스로에게 모질어짐'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'leaf', displayName: '생각 흘려보내기', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['defusion', 'letting-go'],
    targetStates: ['같은 생각이 맴돎', '반추'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },

  // ── 정리 / 감정 명료화 ──
  { id: 'mood', displayName: '지금 마음 온도', type: 'tool', need: ['organize'], domainTags: ['self'], themes: ['checkin', 'affect-labeling'],
    targetStates: ['지금 상태가 흐릿함', '감정 라벨 어려움'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'braindump', displayName: '머릿속 비우기', type: 'tool', need: ['organize'], domainTags: ['general', 'work', 'self'], themes: ['offload', 'sort'],
    targetStates: ['생각이 가득 차 무거움'], safetyLevel: 'general', contra: [], durationSec: 180, hasEndRating: true },
  { id: 'worrytree', displayName: '걱정 나무', type: 'tool', need: ['organize'], domainTags: ['self'], themes: ['worry', 'triage'],
    targetStates: ['걱정이 뒤엉킴', '통제 가능/불가능 뒤섞임'], safetyLevel: 'general', contra: ['crisis_L2+'], durationSec: 150, hasEndRating: true },
  { id: 'worry', displayName: '걱정 비우기', type: 'tool', need: ['organize', 'soothe'], domainTags: ['self'], themes: ['offload', 'sleep', 'night'],
    targetStates: ['자기 전 걱정 반추', '잠이 안 옴'], safetyLevel: 'general', contra: [], durationSec: 180, hasEndRating: true },
  { id: 'balance', displayName: '결정 저울', type: 'tool', need: ['organize'], domainTags: ['self', 'work'], themes: ['decision', 'ambivalence'],
    targetStates: ['할지 말지 양가감정'], safetyLevel: 'general', contra: ['crisis_L2+'], durationSec: 240, hasEndRating: true },

  // ── 행동 ──
  { id: 'intention', displayName: '실행 의도', type: 'tool', need: ['act'], domainTags: ['self', 'work'], themes: ['plan', 'procrastination'],
    targetStates: ['결정은 섰으나 실행 못 함', '미루기'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: true },
  { id: 'smalleststep', displayName: '가장 작은 한 걸음', type: 'tool', need: ['act'], domainTags: ['self', 'work'], themes: ['activation', 'procrastination'],
    targetStates: ['막막해서 착수 못 함'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: true },
  { id: 'woop', displayName: 'WOOP', type: 'tool', need: ['act'], domainTags: ['self'], themes: ['goal', 'obstacle', 'plan'],
    targetStates: ['소망은 있으나 걸림돌에 막힘'], safetyLevel: 'general', contra: [], durationSec: 210, hasEndRating: true },

  // ── 상향조절 / 회고 ──
  { id: 'goodthings', displayName: '오늘의 세 가지', type: 'tool', need: ['savor'], domainTags: ['self'], themes: ['gratitude', 'reflect'],
    targetStates: ['하루가 버겁게만 느껴짐'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: true },
  { id: 'savoring', displayName: '좋은 순간 머무르기', type: 'tool', need: ['savor'], domainTags: ['self'], themes: ['savoring', 'upregulation'],
    targetStates: ['무쾌감·부정 편향', '좋은 순간을 흘려보냄'], safetyLevel: 'general', contra: ['급성 비탄 직후(SW 검토: caution)'], durationSec: 120, hasEndRating: true },

  // ── 의미·가치 / 관계 / 전환 ──
  { id: 'compass', displayName: '나의 나침반', type: 'tool', need: ['meaning'], domainTags: ['self'], themes: ['values', 'act-therapy'],
    targetStates: ['방향 상실·공허감', '뭐가 중요했는지 흐려짐'], safetyLevel: 'caution', contra: ['위기 L1+ 시 라우터 게이트 필수'], durationSec: 120, hasEndRating: true },
  { id: 'relationlens', displayName: '관계 렌즈', type: 'tool', need: ['connect', 'organize'], domainTags: ['relationship', 'family'], themes: ['perspective', 'need-clarity'],
    targetStates: ['관계 갈등 반추', '무엇을 원하는지 모름'], safetyLevel: 'general', contra: ['급성 갈등 직후 고조상태(SW 검토: caution)'], durationSec: 150, hasEndRating: true },
  { id: 'dayclose', displayName: '하루 닫기', type: 'tool', need: ['close'], domainTags: ['self'], themes: ['transition', 'night', 'sleep', 'offload'],
    targetStates: ['하루 미종결·야간 반추'], safetyLevel: 'general', contra: [], durationSec: 150, hasEndRating: true },

  { id: 'vault', displayName: '마음 금고', type: 'tool', need: ['organize'], domainTags: ['self'], themes: ['containment', 'intrusive', 'reversible'],
    targetStates: ['버리지도 놓지도 못함', '침투적 반추'], safetyLevel: 'caution', contra: ['위기 L1+ 시 라우터 게이트 필수', '급성 해리 경향(SW 확정)'], durationSec: 150, hasEndRating: true },

  // ── 리추얼 (v4 ⑥ — 근거 미주장, 산출물 없음, EndRating 없음: 기분 측정이 의례의 결을 깬다) ──
  { id: 'comfortdraw', displayName: '위로 뽑기', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['ritual', 'comfort'],
    targetStates: ['이유 없이 한마디가 필요함', '가볍게 기대고 싶음'], safetyLevel: 'general', contra: ['따끔 모드는 위기 L1+ 차단(미구현)'], durationSec: 60, hasEndRating: false },
  { id: 'fortune', displayName: '포춘 쿠키', type: 'practice', need: ['savor'], domainTags: ['self'], themes: ['ritual', 'morning'],
    targetStates: ['하루의 시작', '가벼운 기대가 필요함'], safetyLevel: 'general', contra: [], durationSec: 45, hasEndRating: false },
  { id: 'capsule', displayName: '행운 캡슐', type: 'practice', need: ['savor', 'soothe'], domainTags: ['self'], themes: ['ritual', 'luck', 'play'],
    targetStates: ['작은 기운이 필요함', '기분 전환이 필요함'], safetyLevel: 'general', contra: [], durationSec: 60, hasEndRating: false },

  // ── 기분 상승 (v4.1 부록 — 능동형 uplift) ──
  // 라우터 구분: "긴장돼요" → bodyrelease(이완·하향) / "처져요·늘어져요" → bodywake(활성·상향) / "기분 전환" → music
  { id: 'music', displayName: '지금의 소리', type: 'tool', need: ['savor'], domainTags: ['self'], themes: ['music', 'uplift', 'mood-shift'],
    targetStates: ['기분 처짐', '전환 필요'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: false },
  { id: 'bodywake', displayName: '몸 깨우기', type: 'practice', need: ['savor'], domainTags: ['health', 'self'], themes: ['body', 'activation', 'uplift'],
    targetStates: ['무기력·처짐', '몸이 늘어짐'], safetyLevel: 'general', contra: ['불편 동작 강제 금지(카피로 처리)'], durationSec: 100, hasEndRating: false },

  // ── 가벼워짐·아침 계열 (부록 4종) ──
  // 겹침 배제: morningsong=아침 시동(music은 기분 대응) / kindness=능동 발신(comfortdraw는 수동 수신, compassion은 심상)
  //           / stamp=방금·즉시 자축(dayclose는 밤 정산) / reset=초경량 1분(정식 그라운딩·호흡 아님)
  { id: 'morningsong', displayName: '오늘을 여는 소리', type: 'tool', need: ['savor'], domainTags: ['self'], themes: ['music', 'morning', 'anticipation'],
    targetStates: ['하루의 시작', '아침 시동'], safetyLevel: 'general', contra: [], durationSec: 60, hasEndRating: false },
  { id: 'kindness', displayName: '오늘의 다정 배달', type: 'tool', need: ['soothe', 'savor'], domainTags: ['self'], themes: ['selfkind', 'self-compassion', 'active'],
    targetStates: ['스스로에게 모짊', '다정이 필요함'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: false },
  { id: 'stamp', displayName: '작은 성공 도장', type: 'tool', need: ['savor'], domainTags: ['self'], themes: ['celebration', 'completion', 'immediate'],
    targetStates: ['방금 무언가 해냄', '즉시 자축'], safetyLevel: 'general', contra: [], durationSec: 45, hasEndRating: false },
  { id: 'reset', displayName: '1분 리셋', type: 'practice', need: ['soothe'], domainTags: ['self', 'health'], themes: ['micro', 'reset', 'break'],
    targetStates: ['잠깐 끊고 싶음', '1분 전환'], safetyLevel: 'general', contra: [], durationSec: 60, hasEndRating: false },

  // ── 집중 ('집중이 안 될 때' 코너) ──
  // 겹침 배제: focuslaunch=착수 시동(smalleststep은 계획 산출, 이쪽은 즉시 의례) / grow=타임박스 지속
  //           / parking=집중 중 잡념 오프로딩(braindump는 전면 비우기) / follow=지속주의 앵커 게임
  { id: 'focuslaunch', displayName: '3·2·1 시작', type: 'tool', need: ['act'], domainTags: ['work', 'self'], themes: ['activation', 'procrastination', 'ritual', 'focus'],
    targetStates: ['막상 시작이 안 됨', '착수 마찰'], safetyLevel: 'general', contra: [], durationSec: 90, hasEndRating: false },
  { id: 'grow', displayName: '자라는 것', type: 'practice', need: ['act'], domainTags: ['work', 'self'], themes: ['focus', 'timebox', 'timer'],
    targetStates: ['시간을 정해 집중하고 싶음', '몰입 유지가 어려움'], safetyLevel: 'general', contra: [], durationSec: 300, hasEndRating: false },
  { id: 'parking', displayName: '딴생각 주차장', type: 'tool', need: ['organize'], domainTags: ['work', 'self'], themes: ['offload', 'intrusive', 'focus'],
    targetStates: ['집중 중 잡념이 자꾸 침투'], safetyLevel: 'general', contra: [], durationSec: 120, hasEndRating: false },
  { id: 'follow', displayName: '한 점 따라가기', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['attention', 'focus', 'play'],
    targetStates: ['주의가 자꾸 흩어짐'], safetyLevel: 'general', contra: [], durationSec: 80, hasEndRating: false },

  // ── 위기 브릿지 ──
  { id: 'stop', displayName: 'STOP', type: 'practice', need: ['soothe'], domainTags: ['self'], themes: ['impulse', 'pause'],
    targetStates: ['충동이 올라옴', '행동 직전 멈춤 필요'], safetyLevel: 'crisis-bridge', contra: [], durationSec: 60, hasEndRating: false },
]

export const BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]))

// 검증: id 유일성 (개발 시)
const _ids = MODULES.map((m) => m.id)
if (new Set(_ids).size !== _ids.length) {
  throw new Error('registry: duplicate module id')
}
