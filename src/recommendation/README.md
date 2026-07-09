# 추천 레이어 (recommendation)

대화 종료 후, 지금 상태에 맞는 돌봄 모듈 1~2개를 부드럽게 제시하기 위한 **선결 레지스트리 + 결정적 매칭 코어**.

> ⚠️ 이 폴더는 **스캐폴드**다. 임상 필드(safetyLevel·contra·targetStates·durationSec)는 전부 **DRAFT** — SW(임상) 확정 전까지 프로덕션 추천에 그대로 쓰지 말 것.

## 파일
- `registry.js` — 28개 모듈 메타데이터(`MODULES`, `BY_ID`). 각 모듈의 니즈/도메인/테마/안전등급/금기/시간.
- `recommend.js` — 순수 함수: `safetyGate`, `isEligible`, `scoreModule`, `recommend`. + LLM 스텁 `extractStateSignal`.
- `dailyAction.js` — v4 ① 오늘의 행동 하나: `pickDailyAction`(1일 1개·timeband 매칭·7일 재노출 금지·위기 L1+ 비노출, 결정적). 풀: `src/content/dailyActions.json` (DRAFT).
- `timeSlots.js` — v4 ④ 시간대 진입점: `getActiveSlot`·`slotInstanceKey`(자정 넘김 창 처리)·`isDeclined`(당일 재노출 금지). 매핑: `src/content/timeSlots.json`.

## 파이프라인 (v3 5장)
```
세션 종료 ─▶ ① safetyGate ─▶ ② trigger(서비스) ─▶ ③ extractStateSignal(LLM/Flash, 서비스)
          ─▶ ④ recommend(signal)  ← 여기(결정적) ─▶ ⑤ 1~2개 제시
```
- **①④⑤**만 이 폴더(순수·결정적·테스트 가능). **②③**은 룰랭 서비스 런타임(대화·LLM 접근)에서 붙인다.

## 사용
```js
import { recommend } from './recommendation/recommend.js'

const signal = {
  dominantNeed: 'soothe',      // listen|organize|act|soothe
  domain: 'work',
  acuteDistress: true,
  crisisLevel: 'none',         // none|L1|L2|L3
  timeOfDay: 'night',
  reasonText: '자꾸 일 생각이 나서 잠이 안 와요',
}
const res = recommend(signal, { n: 2, exclude: ['grounding'] /* 쿨다운 */ })
// res.blocked===true 면 res.action='safety_connector'
// 아니면 res.candidates = [{id, displayName, score, durationSec, reason}, ...]
```

## 안전 규칙(현재 구현)
- `crisisLevel >= L2` → **전면 차단**, `safety_connector`로.
- `safetyLevel:'caution'`(예: 나의 나침반) → 위기 신호가 **전혀 없을 때만**.
- `contra:['crisis_L2+']`(걱정 나무·결정 저울) → L2+에서 제외.
- `safetyLevel:'crisis-bridge'`(STOP) → 일반 추천 **대상 아님**(안전 흐름 전용).
- 결정적: 동일 signal → 동일 결과(점수 desc, 동점 시 id asc).

## v4 즉시 착수분 (이번에 구현)
- **① daily_action** — 콘텐츠 `content/dailyActions.json`(36개 DRAFT, "귀찮지만 하고 나면 나은" 어른 톤) + `dailyAction.js` 로직 + 런처 `DailyActionCard`. 이 데모엔 위기 신호가 없어 `crisisLevel:'none'` 고정 — 서비스 통합 시 라우터가 넘긴다. **개인화 계약**: 1순위는 서비스 LLM이 그날의 대화에서 맞춤 행동 생성(③ stateSignal 확장), 이 풀은 폴백 — `preferDomains`(대화 유추 도메인 우선)·`weather`(비 오는 날 항목) 신호를 이미 받는다.
- **④ time_slots** — 매핑 `content/timeSlots.json`(아침 06:00~11:00 / 퇴근길 17:30~20:00 / 잠들기 전 22:00~01:00) + `timeSlots.js` + 런처 `TimeSlotBanner`. worry_drawer는 `pending`으로 두어 출시 후 매핑만 추가하면 됨. "자기 전"은 클라이언트 시계 휴리스틱 — 카피가 질문형·거절 가능인 이유. 실제 판정(사용 패턴·대화 맥락)은 서비스 몫.
- **⑥ comfort_draw / fortune** — 다정 풀 `content/comfortPool.json`(50개 DRAFT) + `modules/ComfortDraw.jsx`(id `comfortdraw`), 아침용 포춘 쿠키 `content/fortuneCookies.json`(36개 DRAFT) + `modules/FortuneCookie.jsx`(id `fortune`, 날짜 기반 결정적 — 하루 동안 같은 조각). **리추얼 2종은 EndRating 없음**(기분 측정이 의례의 결을 깸). **따끔 모드 미구현** — 위기 L1+ 차단 게이트 배선 후에만.
- **②③(걱정 서랍·미래 편지)은 미구현** — 본체 DB(`module_outputs`)+스케줄링 선결(v4 §6), mind_vault와 인프라 공유 설계.

## v4.1 부록 — 기분 상승(uplift) 2종 (구현됨)
- **music_pick(id `music`)** — 기분 4분류(처짐/답답/곤두섬/허전) → ISO 원리로 곡 매칭. 풀 `content/musicPool.json`(54곡, 실재 확인 = 배포 전 검수 항목). **저작권 4규칙 준수**: 재생 X·가사 X·앨범아트 X·링크아웃만(코드리뷰 항목, MusicPick.jsx 헤더). 무저장 — 세션 내 중복만 방지.
- **body_wake(id `bodywake`)** — 90초 3동작 활성 연습. bodyrelease와 정반대(하향 vs 상향) — 라우터 구분: 긴장→release / 처짐→wake / 전환→music (registry 주석 참조).

## SW 확정 필요 (미결)
- 28개 safetyLevel·contra 최종 판단, 특히 `compass`의 위기 게이트 조건.
- targetStates 문구, durationSec 실측.
- ③ StateSignal 스키마 상의 `dominantNeed` 판정 기준(어떤 종착 톤/모드에서 무엇으로).
- v4: 행동 풀 36개·다정 풀 50개 감수, 따끔 풀 작성·감수, ② 재개봉 연장 1회 제한, ③ 배달 안전 게이트.
