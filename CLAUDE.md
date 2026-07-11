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

## 음성 (저장 음원 우선 — 2026-07-11 전환)
재생 우선순위: **① 사전 생성 정적 음원**(`public/voice/*.mp3` + `src/content/voiceManifest.json`,
0.4초 무음 리드인 포함 — 첫 어절 잘림 방지) → ② `/api/tts`(ElevenLabs 프록시 + Blob 영구 캐시)
→ ③ 브라우저 TTS. 모듈은 `useSpeech().speak(text)`만 호출하며, `speak`는 **발화가 끝날 때
resolve되는 Promise**를 반환한다(단계 전환을 음성에 맞출 때 사용 — StopCard 참조).

**문구를 추가/수정하면:**
1. `scripts/voice-lines.mjs` 갱신 (speak()에 전달되는 원문 그대로 — 누락 시 해당 문구만
   API 폴백으로 재생되고 콘솔 경고가 남는다)
2. `node scripts/generate-voice.mjs` — 변경분만 생성 (`--force`는 전량).
   `ELEVENLABS_API_KEY` 필요: Vercel엔 sensitive라 `env pull`로 안 내려온다.
   `.env.local`의 `ELEVENLABS_API_KEY=""`에 값을 직접 채운 뒤 실행할 것.
3. mp3 + manifest 커밋 → 배포

`api/tts.js` — 폴백용 Vercel 서버리스 함수(키는 서버 env에만). 검수·재생성 Admin: `?admin=tts`.
- `ELEVENLABS_API_KEY` — ElevenLabs API 키 (명상앱 서버에서 가져다 쓸 것)
- `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MALE_VOICE_ID` — 음성 ID (모듈 내레이션은 male 고정)

로컬 `npm run dev`: 정적 음원은 그대로 재생되고, manifest 미스만 브라우저 TTS로 폴백.

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

### 모듈 37개
호흡/감각/진정 (16): MoodThermometer, BreathingCircle, BalloonBreathing, FingerBreathing, PresentMoment, Grounding54321, SelfCompassion, SoundGarden, SandGarden, BubbleWrap, LeafFloating, DrinkingMeditation, ButterflyHug, WorryDump, ThreeGoodThings, StopCard
생각정리·행동 (6): BrainDump, WorryTree, DecisionalBalance, Woop, ImplementationIntention, SmallestStep
범주 공백 채우기 (5): RelationLens(관계·조망수용), SavoringMoment(음미·상향조절), ValueCompass(가치·ACT), DayClose(하루 닫기·야간 의례), BodyRelease(근이완, **연습형**: 산출물 없음, 타이머 가이드)
보관 (1): MindVault(마음 금고, id `vault`) — **localStorage로 실제 보관**(가역성 실물화). 재방문 시 금고 확인(열어보기/그대로 두기/새로 담기). safetyLevel caution. 카피 가드: 트라우마 어휘·"없애기" 금지, 가역성 문구 필수, [열어보기]와 [그대로 두기] 시각적 동등.
리추얼 (3): ComfortDraw(위로 뽑기, id `comfortdraw`, v4 ⑥) — 근거 미주장 순수 리추얼. 딥네이비+골드 프레임 카드 3장 중 택1, 3D 플립 공개. 다정 풀만(`src/content/comfortPool.json` DRAFT). **따끔 모드는 위기 L1+ 차단 게이트 배선 후에만** — 현재 미구현. / FortuneCookie(포춘 쿠키, id `fortune`) — 아침용 "오늘의 좋은 일" 한 줄(`src/content/fortuneCookies.json` DRAFT), 날짜 기반 결정적 선택이라 하루 동안 같은 조각. 가를 때 바삭 소리(Web Audio 합성). / LuckyCapsule(행운 캡슐, id `capsule`) — 뽑기 기계: 손잡이 돌리면 달그락→캡슐 낙하→열면 오늘의 징표(네잎클로버·별·깃털 등 8종 SVG)+한 줄(`src/content/luckyCharms.json` DRAFT). 소리 3종(드르륵·툭·뽁) 합성, isMuted 존중. **리추얼 3종은 EndRating 없음** — 기분 측정이 의례의 결을 깬다(사용자 피드백 2026-07-09).
기분 상승 (2, v4.1 부록): MusicPick(노래 한 곡, id `music`) — ISO 원리(지금 기분에서 출발) 기반 곡 추천. **저작권 4규칙 코드리뷰 항목**: 재생 X·가사 X·앨범아트 X·곡명/아티스트+검색 링크아웃(유튜브뮤직/멜론/스포티파이)만. 곡 풀 `src/content/musicPool.json`(54곡, note는 전부 자체 문장). 저장 없음(세션 내 중복만 방지). / BodyWake(몸 깨우기, id `bodywake`) — 연습형·활성(상향), 90초 3동작(30초씩), 일시정지/건너뛰기 상시, 안전 카피 "불편한 동작은 건너뛰어도 돼요" 고정. **라우터 구분: 긴장→bodyrelease / 처짐→bodywake / 기분 전환→music.** uplift 2종도 EndRating 없음(music은 링크 이탈 흐름, bodywake는 settle이 체크인 대신).
가벼워짐·아침 (4, 부록): MorningSong(오늘을 여는 한 곡, id `morningsong`) — music과 곡 풀·저작권 규칙 공유, 기분 선택 없이 바로 아침 시동 한 곡(`musicPool.json`의 `morning:true` 14곡, energy 5 제외). 야간 진입 시 카피 대체. / KindnessNote(오늘의 다정 배달, id `kindness`) — **능동 자기다정**(comfortdraw=수동 수신·compassion=심상과 구분): 내가 쓴 문장이 나에게 배달. 도움 문구 3개는 예시일 뿐(강요 X), 저장 토글 기본 off(localStorage). / SuccessStamp(작은 성공 도장, id `stamp`) — **즉시 자축**, 카피에 "하루" 금지·"방금/지금"만(dayclose=밤 정산과 구분). 쾅 도장 모션+툭 소리(isMuted 존중), 크기 비교 금지, 저장 토글 기본 off. / OneMinuteReset(1분 리셋, id `reset`) — 초미니 뽑기 컨테이너(`src/content/oneMinuteResets.json` 10개 DRAFT), 뽑기/목록 양쪽 진입, 60초 링 타이머(일시정지·건너뛰기 상시). **4종 모두 EndRating 없음.** 아침 슬롯(timeSlots.json day_start)에 morningsong·reset 우선 배치(스펙 §5).

### v4 즉시 착수분 (라우터/콘텐츠 — 런처에 배선됨)
- **① 오늘의 행동 하나**: `src/content/dailyActions.json`(36개 DRAFT, "귀찮지만 하고 나면 나은" 어른 톤 — 유치함 금지) + `src/recommendation/dailyAction.js`(1일 1개·timeband·7일 재노출 금지·위기 L1+ 비노출·weather 조건·preferDomains 우선) + 런처 `DailyActionCard`. **개인화 계약**: 서비스 통합 시 1순위는 LLM이 그날의 대화에서 맞춤 행동을 생성, 이 풀은 폴백(dailyAction.js 헤더 참조).
- **④ 시간대 진입점**: `src/content/timeSlots.json`(아침 "오늘을 시작하는 3분" 06~11시 / 퇴근길 17:30~20시 / 잠들기 전 22~01시, 코드 수정 없이 조정) + `src/recommendation/timeSlots.js`(자정 넘김 창, 당일 재노출 금지) + 런처 `TimeSlotBanner`. **"자기 전" 판정은 클라이언트 시계 휴리스틱** — 그래서 카피가 질문형·거절 가능. 실제 신호(사용 패턴·대화 맥락)는 서비스 몫.
- **②③(걱정 서랍·미래 편지)은 미구현** — 본체 DB+스케줄링 선결(v4 §6). ⑤ 오늘의 한 문장은 라인업 제외(2026-07-09).

> 명세(v2/v3)는 `reason/priorOutput/onSave/ModuleClose` 라우터 계약을 말하지만 **아직 미구현**. 현재 모든 모듈은 `{onExit}` + `EndRating`만 사용. 추천 레이어 구축 시 그 계약을 얹는다.
> 타이머 모듈(SavoringMoment.dwell, BodyRelease.guide)은 항상 일시정지/건너뛰기 제공(이탈 허용). 카피 원칙: 라벨·조언·효과주장·죄책감 금지, 야간(DayClose)·통증(BodyRelease) 배려.

## 코딩 컨벤션 / 주의
- **포커스 버그 회피:** 입력(input/textarea)이 있는 단계용 컴포넌트를 부모 *본문 안에서* 정의해 `<Comp/>`로 쓰지 말 것 — 매 입력마다 리마운트되어 포커스가 풀린다. 모듈 스코프에 정의하거나, 단계 JSX를 인라인(`{field(...)}` 함수 호출)으로 둘 것.
- **"무게/비중" 측정은 사용자 점수로:** DecisionalBalance처럼 무언가를 저울질할 때 글자수·개수 같은 **프록시로 중요도를 추정하지 말 것.** 사용자가 중요도 점수를 매기게 하고 그 합을 무게로 쓴다. (앱이 결정을 대신하지 않음)
- **검증:** 변경 후 `npm run build` + Playwright로 각 모듈 intro→EndRating 도달 & 콘솔 에러 0 확인하는 흐름을 써 왔다.

## 추천 레이어 (`src/recommendation/`) — 경로 C는 UI 연결됨
- `registry.js` — 36개 모듈 메타데이터(`MODULES`, `BY_ID`). 런처 id와 1:1. **임상 필드(safetyLevel·contra·targetStates·durationSec)는 DRAFT — SW 확정 필요.**
- `recommend.js` — 순수·결정적 코어: `safetyGate`(위기 L2+ → safety_connector), `isEligible`, `scoreModule`, `recommend(signal,{n,exclude})`. ④선택은 recommender 스펙 §2④: 최대 2개, 3+동점(모호)→1개, 2파전 동점은 다른 유형만 페어, 약한 매칭(3점 미만) 제외, 다른 유형(도구+연습) 우선. `extractStateSignal`(③ LLM)은 서비스 몫 스텁.
- `checkin.js` + `components/CheckIn.jsx` — **경로 C "지금 어때요?" (recommender 1단계, 런처 히어로 CTA 연결됨)**: 상태 칩 9개+[둘러볼래요](문구 DRAFT, **가벼운 상태 칩 포함** — 심심해요·몸이 찌뿌둥해요, 힘든 표현만 있으면 진입 문턱이 높아진다는 사용자 피드백 2026-07-10) → 같은 엔진 통과 → 1~2 카드+[지금은 괜찮아요] 동등 노출. 체크인 어느 화면에서든 상단 "홈" 플로팅 버튼으로 런처 복귀. 도구형 쿨다운 `computeCooldownExcludes`(careLog 기반, N=3일 DRAFT, 연습형 제외). [둘러볼래요]→카테고리 브라우즈(진정/정리/행동/기분전환/아침). **"많이 힘들다면" 안전 화면(109·1577-0199)은 추천 엔진과 완전 분리, 칩 화면에 상시 노출** — 위기 표현은 칩에 넣지 않는다. LLM 0.
- 파이프라인: [신호] → ①safetyGate → ②필터(금기·쿨다운·가용성) → ③스코어 → ④상위 1~2 → ⑤제시(+이유). 경로 A(대화, verbatim 인용)·B(시간대)는 같은 엔진에 신호만 다르게 — A는 서비스 통합 후.

## 다음 단계 (미구현)
1. **SW 확정** — 27개 safetyLevel·contra·targetStates, `compass` 위기 게이트 조건, durationSec 실측.
2. **③ 상태신호 추출 + ② 트리거** — 룰랭 서비스 런타임(대화·LLM)에서 `extractStateSignal` 구현, `recommend()` 호출로 연결.
3. **제시 UI** — 종료 후 카드 1~2개(부드럽게). 모듈 코드는 안 건드림.
