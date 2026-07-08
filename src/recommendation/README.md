# 추천 레이어 (recommendation)

대화 종료 후, 지금 상태에 맞는 돌봄 모듈 1~2개를 부드럽게 제시하기 위한 **선결 레지스트리 + 결정적 매칭 코어**.

> ⚠️ 이 폴더는 **스캐폴드**다. 임상 필드(safetyLevel·contra·targetStates·durationSec)는 전부 **DRAFT** — SW(임상) 확정 전까지 프로덕션 추천에 그대로 쓰지 말 것.

## 파일
- `registry.js` — 27개 모듈 메타데이터(`MODULES`, `BY_ID`). 각 모듈의 니즈/도메인/테마/안전등급/금기/시간.
- `recommend.js` — 순수 함수: `safetyGate`, `isEligible`, `scoreModule`, `recommend`. + LLM 스텁 `extractStateSignal`.

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

## SW 확정 필요 (미결)
- 27개 safetyLevel·contra 최종 판단, 특히 `compass`의 위기 게이트 조건.
- targetStates 문구, durationSec 실측.
- ③ StateSignal 스키마 상의 `dominantNeed` 판정 기준(어떤 종착 톤/모드에서 무엇으로).
