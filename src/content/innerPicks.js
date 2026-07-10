// 내부 콘텐츠 딥링크 (2026-07-10 A안): 외부 음원 검색 링크 → 우리 '소리'(calmSounds)·무료 명상.
// 소리 목록은 octos-fe2-meditation src/features/calmSounds/manifest.json의
// 공개 트랙(hidden:false)만 쓴다. 명상은 무료(is_free) 세션만 — 컨텐츠 보강 시 여기에 추가.

const BASE = (import.meta.env.VITE_MEDITATION_URL || 'https://meditation.roulin.ai').replace(/\/$/, '')

export const soundUrl = (id) => `${BASE}/sounds/play/${id}`
export const meditationUrl = (id) => `${BASE}/meditation/session/${id}`

// ISO 원리 유지: 지금 기분에서 출발하는 소리 → 살짝 이동(to). 급점프 지양.
export const SOUNDS_BY_MOOD = {
  처짐: [
    { id: 'nature_forest', title: '아침 숲', subtitle: '멀리서 들리는 새소리', to: '조금 깨어남', note: '가라앉은 기운을 서두르지 않고 천천히 깨워요.' },
    { id: 'nature_stream', title: '얕은 시냇물', subtitle: '돌 사이로 흐르는 물', to: '조금 깨어남', note: '멈춘 것 같은 마음에 작은 흐름을 만들어줘요.' },
  ],
  답답: [
    { id: 'nature_wave', title: '밤의 파도', subtitle: '느리게 밀려오는 물결', to: '트임', note: '꽉 찬 가슴을 밀물과 썰물의 리듬으로 틔워줘요.' },
    { id: 'nature_stream', title: '얕은 시냇물', subtitle: '돌 사이로 흐르는 물', to: '트임', note: '갇힌 공기가 물처럼 흘러가게 해줘요.' },
  ],
  곤두섬: [
    { id: 'nature_rain', title: '창밖의 빗소리', subtitle: '차분하게 이어지는 저녁 비', to: '차분', note: '곤두선 신경을 고르게 적셔줘요.' },
    { id: 'noise_pink', title: '핑크 노이즈', subtitle: '백색소음보다 부드러운 결', to: '차분', note: '주변 자극을 부드럽게 한 겹 덮어줘요.' },
  ],
  허전: [
    { id: 'nature_fire', title: '타닥이는 모닥불', subtitle: '낮게 타오르는 장작', to: '온기', note: '빈 방에 온기가 도는 소리예요.' },
    { id: 'nature_night', title: '여름밤 풀벌레', subtitle: '어둑한 밤공기의 소리', to: '온기', note: '혼자 있는 밤에도 곁이 있는 것 같은 소리예요.' },
  ],
}

export const MORNING_SOUNDS = [
  { id: 'nature_forest', title: '아침 숲', subtitle: '멀리서 들리는 새소리', to: '시동', note: '하루가 천천히 밝아지는 소리로 시작해요.' },
  { id: 'nature_stream', title: '얕은 시냇물', subtitle: '돌 사이로 흐르는 물', to: '시동', note: '오늘 하루가 무리 없이 흘러가도록.' },
]

// 무료 명상 기분별 매핑 (2026-07-10, 프로드 ?scope=all 기준 — 코스 밖 단독 명상 3편 포함).
// 전부 is_free + 게스트 접근 가능. id는 프로드 DB 기준(딥링크 대상이 meditation.roulin.ai).
export const MEDITATIONS_BY_MOOD = {
  처짐: { id: '705c2a48-f245-4365-a76f-43f7169254d0', title: '마인드풀니스 소개: 주의를 기울이는 것' },
  답답: { id: '1270e04f-f5ce-4899-93c2-198a5b6c618c', title: '지하철 안에서 답답해 내리고 싶을 때 하는 명상' },
  곤두섬: { id: '918a73ee-99aa-4069-a969-d8c6dc24cee2', title: '잠이 안 올 때 하는 명상' },
  허전: { id: 'd0623355-6e12-4938-82cb-23eed4929fad', title: '‘관찰’과 그냥 보는 것의 차이' },
}

export const MORNING_MEDITATION = { id: '5f08352c-d470-48c2-8c9a-c2c37582a39a', title: '출근길 하루를 시작하는 명상' }
