import { useState } from 'react'
import { SpeechProvider } from './context/SpeechContext'
import RecommendationSheet from './components/RecommendationSheet'
import CareTrail from './components/CareTrail'
import DailyActionCard from './components/DailyActionCard'
import TimeSlotBanner from './components/TimeSlotBanner'
import CheckIn from './components/CheckIn'
import { logCare } from './lib/careLog'
import PresentMoment from './modules/PresentMoment'
import StopCard from './modules/StopCard'
import DrinkingMeditation from './modules/DrinkingMeditation'
import ButterflyHug from './modules/ButterflyHug'
import ThreeGoodThings from './modules/ThreeGoodThings'
import BreathingCircle from './modules/BreathingCircle'
import FingerBreathing from './modules/FingerBreathing'
import WorryDump from './modules/WorryDump'
import Grounding54321 from './modules/Grounding54321'
import BalloonBreathing from './modules/BalloonBreathing'
import LeafFloating from './modules/LeafFloating'
import MoodThermometer from './modules/MoodThermometer'
import BubbleWrap from './modules/BubbleWrap'
import SoundGarden from './modules/SoundGarden'
import SandGarden from './modules/SandGarden'
import SelfCompassion from './modules/SelfCompassion'
import ImplementationIntention from './modules/ImplementationIntention'
import Woop from './modules/Woop'
import SmallestStep from './modules/SmallestStep'
import WorryTree from './modules/WorryTree'
import BrainDump from './modules/BrainDump'
import DecisionalBalance from './modules/DecisionalBalance'
import RelationLens from './modules/RelationLens'
import SavoringMoment from './modules/SavoringMoment'
import ValueCompass from './modules/ValueCompass'
import DayClose from './modules/DayClose'
import BodyRelease from './modules/BodyRelease'
import MindVault from './modules/MindVault'
import ComfortDraw from './modules/ComfortDraw'
import FortuneCookie from './modules/FortuneCookie'
import LuckyCapsule from './modules/LuckyCapsule'
import MusicPick from './modules/MusicPick'
import BodyWake from './modules/BodyWake'
import MorningSong from './modules/MorningSong'
import KindnessNote from './modules/KindnessNote'
import SuccessStamp from './modules/SuccessStamp'
import OneMinuteReset from './modules/OneMinuteReset'

// roulin.ai 모드카드와 같은 결: [번호] · 제목 · 설명("…할 때. …합니다.") · 작은 태그 pill
const MODULES = [
  { id: 'mood',       title: '지금 마음 온도',   tag: '살피기',   desc: '지금 어떤 상태인지 흐릿할 때. 맞히려 애쓰지 않고 가볍게 살펴봅니다.' },
  { id: 'breathing',  title: '호흡 원',          tag: '호흡',     desc: '마음이 빠르게 달릴 때. 원에 맞춰 천천히 들숨과 날숨을 고릅니다.' },
  { id: 'balloon',    title: '풍선 호흡',        tag: '호흡',     desc: '손에 잡히는 게 필요할 때. 화면을 누르고 떼며 호흡을 따라갑니다.' },
  { id: 'finger',     title: '손가락 호흡',      tag: '호흡',     desc: '눈 둘 곳이 필요할 때. 손가락을 따라가며 호흡을 고릅니다.' },
  { id: 'present',    title: '현재 순간',        tag: '현재',     desc: '생각이 과거나 미래로 흩어질 때. 지금 여기로 1~2분 돌아옵니다.' },
  { id: 'grounding',  title: '5-4-3-2-1',        tag: '그라운딩', desc: '머릿속이 붕 떠 있을 때. 감각을 하나씩 짚으며 지금에 머뭅니다.' },
  { id: 'compassion', title: '자기 다독임',      tag: '다독임',   desc: '스스로에게 모질어질 때. 나에게 건네는 따뜻한 한마디를 찾습니다.' },
  { id: 'sound',      title: '소리 정원',        tag: '감각',     desc: '아무 말도 하고 싶지 않을 때. 탭하며 나만의 소리를 만들어 봅니다.' },
  { id: 'sand',       title: '모래 정원',        tag: '감각',     desc: '손을 움직이고 싶을 때. 손끝으로 모래 위에 천천히 그려 봅니다.' },
  { id: 'bubble',     title: '뽁뽁이',           tag: '감각',     desc: '안절부절못할 때. 톡톡 터뜨리며 손과 긴장을 함께 풉니다.' },
  { id: 'leaf',       title: '생각 흘려보내기',  tag: '내려놓기', desc: '같은 생각이 맴돌 때. 떠오르는 생각을 잎새에 띄워 보냅니다.' },
  { id: 'drinking',   title: '한 잔의 시간',     tag: '현재',     desc: '잠깐 멈추고 싶을 때. 마시는 동안 그 순간에만 머뭅니다.' },
  { id: 'butterfly',  title: '나비 포옹',        tag: '안정',     desc: '마음이 떨리고 가라앉지 않을 때. 가슴을 토닥이며 진정시킵니다.' },
  { id: 'worry',      title: '걱정 비우기',      tag: '내려놓기', desc: '머릿속이 가득 차 잠들기 어려울 때. 적어서 잠시 내려놓습니다.' },
  { id: 'goodthings', title: '오늘의 세 가지',   tag: '돌아보기', desc: '하루가 버겁게만 느껴질 때. 좋았던 순간 세 가지를 떠올립니다.' },
  { id: 'stop',       title: 'STOP',             tag: '멈춤',     desc: '충동이 올라올 때. 행동하기 전 30초, 잠깐 멈춰 섭니다.' },

  // ── 생각 정리 · 행동 영역 (신규) ──
  { id: 'braindump',  title: '머릿속 비우기',    tag: '비우기',   desc: '생각이 가득 차 무거울 때. 다 꺼내서 다섯 갈래로 정리합니다.' },
  { id: 'worrytree',  title: '걱정 나무',        tag: '정리',     desc: '걱정이 뒤엉킬 때. 바꿀 수 있는 것과 아닌 것으로 나눕니다.' },
  { id: 'balance',    title: '결정 저울',        tag: '결정',     desc: '할지 말지 마음이 양쪽일 때. 네 칸에 적어 저울에 올립니다.' },
  { id: 'woop',       title: 'WOOP',             tag: '계획',     desc: '소망과 걸림돌을 함께 볼 때. 네 걸음으로 마음을 정리합니다.' },
  { id: 'intention',  title: '실행 의도',        tag: '실행',     desc: '결심은 섰는데 자꾸 미뤄질 때. 언제·어디서 할지 정해 둡니다.' },
  { id: 'smalleststep', title: '가장 작은 한 걸음', tag: '한 걸음', desc: '막막해서 시작이 안 될 때. 2분짜리 첫 동작 하나만 정합니다.' },

  // ── 범주 공백 채우기 (신규) ──
  { id: 'relationlens', title: '관계 렌즈',      tag: '관계',   desc: '어떤 관계가 마음에 걸릴 때. 그 사람 자리에 잠깐 서 봅니다.' },
  { id: 'savoring',     title: '좋은 순간 머무르기', tag: '음미', desc: '오늘 괜찮았던 순간이 있을 때. 그 감각에 잠깐 더 머뭅니다.' },
  { id: 'compass',      title: '나의 나침반',    tag: '가치',   desc: '뭐가 중요했는지 흐려질 때. 지금 소중한 것 하나를 짚습니다.' },
  { id: 'dayclose',     title: '하루 닫기',      tag: '마무리', desc: '하루가 닫히지 않은 밤에. 매듭짓고 내일로 넘겨 닫습니다.' },
  { id: 'bodyrelease',  title: '몸 풀어주기',    tag: '이완',   desc: '몸이 뻣뻣하게 긴장될 때. 부위별로 2분간 풀어줍니다.' },
  { id: 'vault',        title: '마음 금고',      tag: '보관',   desc: '버릴 순 없는데 지금 감당이 안 될 때. 잠시 담아두고 나중에 꺼냅니다.' },

  // ── 리추얼 (v4 ⑥ — 근거를 주장하지 않는 순수 의례) ──
  { id: 'comfortdraw',  title: '위로 뽑기',      tag: '리추얼', desc: '이유 없이 한마디가 필요할 때. 오늘의 카드 한 장을 뒤집어 봅니다.' },
  { id: 'fortune',      title: '포춘 쿠키',      tag: '리추얼', desc: '하루를 시작할 때. 쿠키 하나를 골라 오늘 몫의 좋은 한 줄을 꺼냅니다.' },
  { id: 'capsule',      title: '행운 캡슐',      tag: '리추얼', desc: '작은 기운이 필요할 때. 손잡이를 돌려 오늘의 징표를 뽑습니다.' },

  // ── 기분 상승 (v4.1 부록 — uplift 2종) ──
  { id: 'music',        title: '노래 한 곡',     tag: '전환',   desc: '기분을 살짝 바꾸고 싶을 때. 지금 마음에서 출발하는 한 곡을 골라드립니다.' },
  { id: 'bodywake',     title: '몸 깨우기',      tag: '활력',   desc: '몸이 처지고 늘어질 때. 90초, 세 동작으로 살짝 깨웁니다.' },

  // ── 가벼워짐·아침 계열 (부록 4종) ──
  { id: 'morningsong',  title: '오늘을 여는 한 곡', tag: '아침', desc: '하루를 시작할 때. 아침에 어울리는 한 곡으로 시동을 겁니다.' },
  { id: 'kindness',     title: '오늘의 다정 배달', tag: '다정', desc: '나에게 한마디 건네고 싶을 때. 내가 쓴 다정이 나에게 배달됩니다.' },
  { id: 'stamp',        title: '작은 성공 도장',  tag: '자축', desc: '방금 뭔가 해냈을 때. 그 자리에서 도장 하나, 쾅 찍습니다.' },
  { id: 'reset',        title: '1분 리셋',        tag: '리셋', desc: '잠깐 끊고 가고 싶을 때. 딱 1분짜리 하나를 뽑아 해봅니다.' },
]

export default function App() {
  const [activeModule, setActiveModule] = useState(null)
  const [pendingRec, setPendingRec] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false) // 경로 C "지금 어때요?"

  const exit = () => {
    if (activeModule) {
      const m = MODULES.find((x) => x.id === activeModule)
      if (m) logCare({ id: m.id, title: m.title, tag: m.tag }) // 머문 자국 남기기
    }
    setPendingRec(activeModule)
    setActiveModule(null)
  }

  return (
    <SpeechProvider>
      {activeModule === 'present'    && <PresentMoment onExit={exit} />}
      {activeModule === 'stop'       && <StopCard onExit={exit} />}
      {activeModule === 'drinking'   && <DrinkingMeditation onExit={exit} />}
      {activeModule === 'butterfly'  && <ButterflyHug onExit={exit} />}
      {activeModule === 'goodthings' && <ThreeGoodThings onExit={exit} />}
      {activeModule === 'breathing'  && <BreathingCircle onExit={exit} />}
      {activeModule === 'finger'     && <FingerBreathing onExit={exit} />}
      {activeModule === 'worry'      && <WorryDump onExit={exit} />}
      {activeModule === 'grounding'  && <Grounding54321 onExit={exit} />}
      {activeModule === 'balloon'    && <BalloonBreathing onExit={exit} />}
      {activeModule === 'leaf'       && <LeafFloating onExit={exit} />}
      {activeModule === 'mood'       && <MoodThermometer onExit={exit} />}
      {activeModule === 'bubble'     && <BubbleWrap onExit={exit} />}
      {activeModule === 'sound'      && <SoundGarden onExit={exit} />}
      {activeModule === 'sand'       && <SandGarden onExit={exit} />}
      {activeModule === 'compassion' && <SelfCompassion onExit={exit} />}
      {activeModule === 'braindump'  && <BrainDump onExit={exit} />}
      {activeModule === 'worrytree'  && <WorryTree onExit={exit} />}
      {activeModule === 'balance'    && <DecisionalBalance onExit={exit} />}
      {activeModule === 'woop'       && <Woop onExit={exit} />}
      {activeModule === 'intention'  && <ImplementationIntention onExit={exit} />}
      {activeModule === 'smalleststep' && <SmallestStep onExit={exit} />}
      {activeModule === 'relationlens' && <RelationLens onExit={exit} />}
      {activeModule === 'savoring'     && <SavoringMoment onExit={exit} />}
      {activeModule === 'compass'      && <ValueCompass onExit={exit} />}
      {activeModule === 'dayclose'     && <DayClose onExit={exit} />}
      {activeModule === 'bodyrelease'  && <BodyRelease onExit={exit} />}
      {activeModule === 'vault'        && <MindVault onExit={exit} />}
      {activeModule === 'comfortdraw'  && <ComfortDraw onExit={exit} />}
      {activeModule === 'fortune'      && <FortuneCookie onExit={exit} />}
      {activeModule === 'capsule'      && <LuckyCapsule onExit={exit} />}
      {activeModule === 'music'        && <MusicPick onExit={exit} />}
      {activeModule === 'bodywake'     && <BodyWake onExit={exit} />}
      {activeModule === 'morningsong'  && <MorningSong onExit={exit} />}
      {activeModule === 'kindness'     && <KindnessNote onExit={exit} />}
      {activeModule === 'stamp'        && <SuccessStamp onExit={exit} />}
      {activeModule === 'reset'        && <OneMinuteReset onExit={exit} />}

      {/* 어느 모듈 화면에서든 홈(런처)으로 */}
      {activeModule !== null && (
        <button
          onClick={exit}
          aria-label="홈으로"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#E0DCCD] text-navy/75 text-[12px] shadow-sm hover:bg-white transition"
        >
          <HomeIcon /> 홈
        </button>
      )}

      {/* 경로 C — "지금 어때요?" (recommender 스펙 §3, 규칙 기반) */}
      {activeModule === null && checkinOpen && (
        <CheckIn
          modules={MODULES}
          onPick={(id) => { setCheckinOpen(false); setActiveModule(id) }}
          onClose={() => setCheckinOpen(false)}
        />
      )}

      {activeModule === null && !checkinOpen && pendingRec !== null && (
        <RecommendationSheet
          completedModuleId={pendingRec}
          allModules={MODULES}
          onPick={(id) => { setPendingRec(null); setActiveModule(id) }}
          onShowAll={() => setPendingRec(null)}
        />
      )}
      {activeModule === null && !checkinOpen && pendingRec === null && (
        <Launcher onPick={setActiveModule} onCheckIn={() => setCheckinOpen(true)} />
      )}
    </SpeechProvider>
  )
}

function Launcher({ onPick, onCheckIn }) {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── 상단 바: roulin 로고 결 ── */}
      <header className="sticky top-0 z-10 bg-cream/85 backdrop-blur border-b border-line">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber" />
          <span className="text-[22px] text-navy tracking-tight" style={{ fontWeight: 600 }}>roulin</span>
          <span className="w-px h-4 bg-line mx-1" aria-hidden="true" />
          <span className="text-[15px] text-navy/80" style={{ fontWeight: 500 }}>마음 돌봄</span>
        </div>
      </header>

      {/* ── 히어로 ── */}
      <div className="max-w-md mx-auto px-6 pt-14 pb-10 text-center">
        <span className="tag-pill mb-6 inline-block">잠깐의 자기돌봄</span>
        <h1 className="text-navy leading-tight mb-5" style={{ fontWeight: 600, fontSize: '30px' }}>
          혼자 두기엔<br />벅찬 마음
        </h1>
        <p className="text-r-gray leading-relaxed" style={{ fontSize: '15px' }}>
          말로 다 꺼내기 어려운 순간에.<br />
          지금 마음에 가까운 돌봄을 골라보세요.
        </p>
        {/* 경로 C 진입 — 뭘 고를지 모르겠을 때 1~2개만 추려주는 문 */}
        <button
          onClick={onCheckIn}
          className="mt-7 px-9 py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition text-[15px]"
        >
          지금 어때요?
        </button>
        <p className="mt-2.5 text-[12px] text-r-gray-soft">고르기 어려우면, 지금 마음만 알려주세요.</p>
      </div>

      {/* ── 시간대 진입점(v4 ④) — 지금 시각이 슬롯 안일 때만, 질문형 1회 ── */}
      <TimeSlotBanner modules={MODULES} onPick={onPick} />

      {/* ── 오늘의 행동 하나(v4 ①) — 하루 1개, 7일 내 재노출 금지 ── */}
      <DailyActionCard />

      {/* ── 머문 자국(돌봄 기록) — 하나씩 쌓인다 ── */}
      <CareTrail />

      {/* ── 모듈 카드 (roulin 모드카드 결: 번호·제목·설명·태그) ── */}
      <div className="max-w-md mx-auto px-6 pb-8">
        <p className="eyebrow mb-4">무엇을 골라도 괜찮습니다</p>
        <div className="space-y-3">
          {MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="roulin-card w-full text-left px-6 py-5 block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tag-pill">{m.tag}</span>
              </div>
              <div className="text-navy mb-1.5" style={{ fontWeight: 600, fontSize: '18px' }}>{m.title}</div>
              <div className="text-r-gray leading-relaxed" style={{ fontSize: '13.5px' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-r-gray-soft pb-12" style={{ fontSize: '12px' }}>
        진단이나 치료를 대신하지 않습니다 · 잠깐 머무는 시간이에요
      </p>
    </div>
  )
}

// 홈 아이콘
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.5V20h12v-9.5" />
    </svg>
  )
}

// roulin 로고의 스파클(별)
function Star({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" />
    </svg>
  )
}
