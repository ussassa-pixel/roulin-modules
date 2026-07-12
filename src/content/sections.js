// 런처 카테고리(섹션) 정의 — App.jsx(런처)와 CareTrail(머문 자국 색)이 함께 쓴다.
// color: 머문 자국 구슬용. base(중심)→edge(테두리)로 카테고리마다 뚜렷이 다른 색상군.
export const SECTIONS = [
  {
    key: 'calm',
    title: '가라앉히기',
    desc: '마음이 빠르게 달리거나 붕 떠 있을 때. 호흡과 감각으로 지금을 진정시켜요.',
    color: { base: '#7cc0f6', edge: '#3b82f6' },
    ids: ['mood', 'breathing', 'balloon', 'finger', 'present', 'grounding', 'compassion', 'sound', 'sand', 'bubble', 'leaf', 'drinking', 'butterfly', 'worry', 'goodthings', 'stop'],
  },
  {
    key: 'sort',
    title: '생각 정리 · 행동',
    desc: '생각이 엉켜 무거울 때. 갈래를 나누고 다음 한 걸음을 정해요.',
    color: { base: '#5fd6a5', edge: '#0ea86f' },
    ids: ['braindump', 'worrytree', 'balance', 'woop', 'intention', 'smalleststep'],
  },
  {
    key: 'life',
    title: '관계 · 가치 · 하루',
    desc: '어떤 관계가 마음에 걸리거나, 하루를 닫고 싶을 때.',
    color: { base: '#b79df8', edge: '#7c4fe0' },
    ids: ['relationlens', 'savoring', 'compass', 'dayclose', 'bodyrelease', 'vault'],
  },
  {
    key: 'lift',
    title: '리추얼 · 기분 전환',
    desc: '이유 없이 한마디가 필요하거나, 기분을 살짝 바꾸고 싶을 때.',
    color: { base: '#f6bd4e', edge: '#dd8a10' },
    ids: ['comfortdraw', 'fortune', 'capsule', 'music', 'bodywake', 'morningsong', 'kindness', 'stamp', 'reset'],
  },
  {
    key: 'focus',
    title: '집중이 안 될 때',
    desc: '시작이 안 되거나 자꾸 흐트러질 때. 시동을 걸고 잡념을 비워 몰입해요.',
    color: { base: '#f4a0be', edge: '#e0518a' },
    ids: ['focuslaunch', 'grow', 'parking', 'follow', 'catch'],
  },
]

const ID_TO_SECTION = new Map(SECTIONS.flatMap((s) => s.ids.map((id) => [id, s])))

// 모듈 id → 소속 섹션 (과거 careLog 항목도 id를 저장하므로 그대로 조회 가능)
export const sectionOf = (id) => ID_TO_SECTION.get(id) || null
