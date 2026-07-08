# roulin-modules — 프로젝트 컨텍스트

룰랭(roulin.ai, AI 자기돌봄 서비스)의 **간단한 치료/돌봄 마이크로 모듈** 모음. 대화 세션이 아니라 **대화 종료 후 추천으로** 단독 실행되는 짧은 모듈들이다. 각 모듈은 독립 실행되고 `onExit`(닫기)로만 종료한다(모듈 간 내비게이션 없음).

- **배포(라이브):** https://roulin-modules.vercel.app
- **레포:** github.com/ussassa-pixel/roulin-modules (브랜치: `master`)
- **스택:** React 19 + Vite + Tailwind CSS 3

## 명령어
```bash
npm install      # 최초 1회
npm run dev      # 개발 (localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 미리보기
```

## 배포 방법 (중요)
**GitHub↔Vercel 자동배포는 연결돼 있지 않다.** (Vercel 프로젝트는 팀 `ussassa0-tech`, 저장소는 `ussassa-pixel` 계정이라 GitHub 연동 미설정.) 그래서 **`git push`만으로는 라이브가 안 바뀐다.** 배포는 CLI로:
```bash
git add -A && git commit -m "..." && git push origin master   # 코드 백업(GitHub)
vercel --prod --yes                                            # 라이브 반영 (vercel login 선행)
```
배포 확인: 라이브 JS 번들 해시가 로컬 빌드와 일치 + 고유 문구 grep.

## 디자인 시스템 — roulin.ai MVP 톤 (반드시 일치)
roulin.ai 실측 기반. 토큰은 [tailwind.config.js](tailwind.config.js)·[src/index.css](src/index.css)에 정의.
- **폰트(세리프):** `Lora, MaruBuri(마루부리), "Noto Serif KR", Georgia, serif` — 제목·본문 모두 세리프(한글 마루부리, index.css에 @font-face)
- **팔레트:** `cream #F5F3EB`(배경) · `navy #112338`(제목·주텍스트·다크버튼, weight 600) · `amber #E0A33E`(포인트: 번호·디바이더·태그) · `amber-soft #F3E7CC`(태그/요약카드 배경) · `r-gray #6E6A60`(본문) · `r-gray-soft #A8A294`(힌트) · `line #E7E2D5`(보더)
- **버튼:** primary = `bg-navy text-white rounded-full`(pill), 보조 = `bg-white text-ink border border-line rounded-full`, 비활성 = `bg-line text-r-gray-soft`
- **입력:** `rounded-2xl border border-line bg-white ... focus:border-[#DCD5C4] placeholder-[#A8A294]`
- **제목 패턴:** `font-serif text-[28px] text-navy` + `style={{fontWeight:600}}`, 아래 `w-8 h-px bg-amber/60` 디바이더
- **레이아웃:** `min-h-screen bg-cream flex flex-col items-center justify-center p-6`, 본문 `max-w-md`
- **카피 톤:** 차분한 "~습니다/~봐요" 존대, 짧은 문장. 해결사·지시 톤 금지.

> ⚠️ 과거 stone/amber·`#f5f1eb`·`bg-stone-700` 토큰은 **구버전**. 절대 쓰지 말 것 — 위 roulin 톤이 현재 표준.

## 일러스트 — "빛/글래스 젬" 패밀리 (코드 기반, Lottie 미사용)
조악한 일러스트는 코드로 프리미엄화했다. 외부 에셋·라이선스 의존 없음.
- **손가락 호흡:** 카툰 손 제거 → 딥네이비 몰입 + 빛나는 앰버 구슬이 호흡 능선을 오르내림(`BreathRidge`)
- **달·하트·잎(WorryDump/SelfCompassion/LeafFloating):** 글래스 젬 + 후광 SVG
- 새 일러스트는 이 톤(부드러운 그라데이션 + 후광 + 앰버 포인트)으로 통일.

## 구조
```
src/
  App.jsx              # 모듈 라우팅 + 런처(번호 카드·태그 pill). MODULES 배열 = 런처 목록
  components/
    ModuleFrame.jsx    # 공통 프레임. props: { children, onExit, dark }. 좌상단 소리끄기/우상단 나가기
    EndRating.jsx      # 종료 평가. props: { onComplete }. 대부분 모듈 마지막 phase에서 호출
  context/SpeechContext.jsx   # 음성 안내(useSpeech: speak/isMuted/toggleMute)
  modules/             # 모듈 22개 (아래)
  index.css            # 폰트 @font-face + :root 토큰 + 공통 유틸(.tag-pill .roulin-card .card-num 등)
```

### 모듈 호출 규약
- 각 모듈: `export default function X({ onExit })`, 내부 `phase` 상태기계, 마지막에
  `<ModuleFrame onExit={onExit}><EndRating onComplete={() => onExit()} /></ModuleFrame>`
- App.jsx에 추가: import + `{activeModule === 'id' && <X onExit={exit} />}` + `MODULES` 배열에 카드 1줄

### 모듈 27개
호흡/감각/진정 (16): MoodThermometer, BreathingCircle, BalloonBreathing, FingerBreathing, PresentMoment, Grounding54321, SelfCompassion, SoundGarden, SandGarden, BubbleWrap, LeafFloating, DrinkingMeditation, ButterflyHug, WorryDump, ThreeGoodThings, StopCard
생각정리·행동 (6): BrainDump, WorryTree, DecisionalBalance, Woop, ImplementationIntention, SmallestStep
범주 공백 채우기 (5): RelationLens(관계·조망수용), SavoringMoment(음미·상향조절), ValueCompass(가치·ACT), DayClose(하루 닫기·야간 의례), BodyRelease(근이완, **연습형**: 산출물 없음, 타이머 가이드)

> 명세(v2/v3)는 `reason/priorOutput/onSave/ModuleClose` 라우터 계약을 말하지만 **아직 미구현**. 현재 모든 모듈은 `{onExit}` + `EndRating`만 사용. 추천 레이어 구축 시 그 계약을 얹는다.
> 타이머 모듈(SavoringMoment.dwell, BodyRelease.guide)은 항상 일시정지/건너뛰기 제공(이탈 허용). 카피 원칙: 라벨·조언·효과주장·죄책감 금지, 야간(DayClose)·통증(BodyRelease) 배려.

## 코딩 컨벤션 / 주의
- **포커스 버그 회피:** 입력(input/textarea)이 있는 단계용 컴포넌트를 부모 *본문 안에서* 정의해 `<Comp/>`로 쓰지 말 것 — 매 입력마다 리마운트되어 포커스가 풀린다. 모듈 스코프에 정의하거나, 단계 JSX를 인라인(`{field(...)}` 함수 호출)으로 둘 것.
- **"무게/비중" 측정은 사용자 점수로:** DecisionalBalance처럼 무언가를 저울질할 때 글자수·개수 같은 **프록시로 중요도를 추정하지 말 것.** 사용자가 중요도 점수를 매기게 하고 그 합을 무게로 쓴다. (앱이 결정을 대신하지 않음)
- **검증:** 변경 후 `npm run build` + Playwright로 각 모듈 intro→EndRating 도달 & 콘솔 에러 0 확인하는 흐름을 써 왔다.

## 추천 레이어 (`src/recommendation/`, 스캐폴드 — UI 미연결)
- `registry.js` — 27개 모듈 메타데이터(`MODULES`, `BY_ID`). 런처 id와 1:1. **임상 필드(safetyLevel·contra·targetStates·durationSec)는 DRAFT — SW 확정 필요.**
- `recommend.js` — 순수·결정적 코어: `safetyGate`(위기 L2+ → safety_connector), `isEligible`, `scoreModule`, `recommend(signal,{n,exclude})`. `extractStateSignal`(③ LLM)은 서비스 몫 스텁.
- `README.md` — 파이프라인 ①~⑤ + SW 미결.
- 파이프라인: 세션 종료 → ①safetyGate → ②trigger(서비스) → ③stateSignal(LLM/Flash, 서비스) → ④recommend(결정적) → ⑤1~2개 제시.

## 다음 단계 (미구현)
1. **SW 확정** — 27개 safetyLevel·contra·targetStates, `compass` 위기 게이트 조건, durationSec 실측.
2. **③ 상태신호 추출 + ② 트리거** — 룰랭 서비스 런타임(대화·LLM)에서 `extractStateSignal` 구현, `recommend()` 호출로 연결.
3. **제시 UI** — 종료 후 카드 1~2개(부드럽게). 모듈 코드는 안 건드림.
