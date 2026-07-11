# 저장 음원 기반 음성 시스템 (2026-07-11, 설계 승인됨)

## 문제

- 배포판(dev.roulin.ai)은 ElevenLabs를 매 재생마다 서버리스 API로 경유 → 콜드스타트·302·생성 지연으로 첫 어절이 잘리거나 단계 전환과 충돌.
- 브라우저 오디오 출력이 유휴 후 깨어나며 첫 200~400ms를 감쇠 → "앞 단어가 작게·급하게".
- 음성 사용처 전수 조사 결과 **모든 speak() 문구가 정적**(48개, 남성 음성): StopCard 6,
  BalloonBreathing 3, ButterflyHug 1, DrinkingMeditation 7, PresentMoment 7, SelfCompassion 5,
  ThreeGoodThings 5, SavoringMoment 4, BodyRelease 9, EndRating 1.

## 결정 (사용자 승인)

**레포 정적 파일 + API 폴백.** 전 문구를 사전 생성해 `public/voice/*.mp3`로 커밋하고,
클라이언트는 정적 파일을 직접 재생한다. manifest에 없는 문구만 기존 `/api/tts`(Blob 캐시)로
폴백, 최후엔 브라우저 TTS. 런타임 ElevenLabs 의존 제거.

## 구성

1. **문구 목록** `scripts/voice-lines.mjs` — 48개 라인의 단일 소스(모듈별 주석).
   모듈 문구를 바꾸면 이 목록도 갱신해야 한다(누락 시 API 폴백으로 동작 + 콘솔 경고).
2. **생성 스크립트** `scripts/generate-voice.mjs` — ElevenLabs로 생성(남성 voice,
   `_tts-core.js`와 동일 설정: multilingual_v2, stability 0.5, similarity 0.75).
   - **각 음원 앞 0.4초 무음 리드인**(`<break time="0.4s" />`)을 굽는다 → 출력 웨이크업
     감쇠가 무음에서 소모되고 첫 어절은 온전히 나온다.
   - 산출: `public/voice/<sha256-16>.mp3` + `src/content/voiceManifest.json`
     (`"male|<원문>" → {file, sec}`; sec는 128kbps CBR 기준 bytes/16000 추정).
   - 멱등: 이미 있는 해시는 스킵(`--force`로 전량 재생성). 실행엔 `ELEVENLABS_API_KEY`
     필요(`vercel env pull`로 확보).
3. **클라이언트** `src/lib/tts.js` — 재생 우선순위: manifest 정적 파일 → `/api/tts` → 브라우저 TTS.
   기존의 재생-종료 Promise·prefetch·유휴 워밍업은 유지. **모듈 코드는 무변경.**
4. **페이싱 점검** — 생성된 실측 길이(manifest.sec)를 각 모듈 단계 타이머와 대조,
   여유(리드인 0.4s 포함)가 부족한 모듈만 STOP식 "음성 종료+최소 체류"로 수정.
   전 모듈 일괄 개편은 하지 않는다(호흡 사이클 등 애니메이션 타이밍 보존).

## 운영 워크플로

문구 변경 → `scripts/voice-lines.mjs` 갱신 → `node scripts/generate-voice.mjs` →
mp3+manifest 커밋 → `vercel --prod`. TtsAdmin·Blob 캐시는 폴백 경로용으로 유지.
