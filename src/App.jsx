import { useState } from 'react'
import { SpeechProvider } from './context/SpeechContext'
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
]

export default function App() {
  const [activeModule, setActiveModule] = useState(null)
  const exit = () => setActiveModule(null)

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

      {activeModule === null && <Launcher onPick={setActiveModule} />}
    </SpeechProvider>
  )
}

function Launcher({ onPick }) {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── 상단 바: roulin 로고 결 ── */}
      <header className="sticky top-0 z-10 bg-cream/85 backdrop-blur border-b border-line">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber" />
          <span className="text-[22px] text-navy tracking-tight" style={{ fontWeight: 600 }}>roulin</span>
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
      </div>

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

// roulin 로고의 스파클(별)
function Star({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1c.7 6 4.3 9.6 10 10-5.7.4-9.3 4-10 10-.7-6-4.3-9.6-10-10C7.7 10.6 11.3 7 12 1Z" />
    </svg>
  )
}
