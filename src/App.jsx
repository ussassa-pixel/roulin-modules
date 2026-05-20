import { useState } from 'react'
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

export default function App() {
  const [activeModule, setActiveModule] = useState(null)

  if (activeModule === 'present') return <PresentMoment onExit={() => setActiveModule(null)} />
  if (activeModule === 'stop') return <StopCard onExit={() => setActiveModule(null)} />
  if (activeModule === 'drinking') return <DrinkingMeditation onExit={() => setActiveModule(null)} />
  if (activeModule === 'butterfly') return <ButterflyHug onExit={() => setActiveModule(null)} />
  if (activeModule === 'goodthings') return <ThreeGoodThings onExit={() => setActiveModule(null)} />
  if (activeModule === 'breathing') return <BreathingCircle onExit={() => setActiveModule(null)} />
  if (activeModule === 'finger') return <FingerBreathing onExit={() => setActiveModule(null)} />
  if (activeModule === 'worry') return <WorryDump onExit={() => setActiveModule(null)} />
  if (activeModule === 'grounding') return <Grounding54321 onExit={() => setActiveModule(null)} />
  if (activeModule === 'balloon') return <BalloonBreathing onExit={() => setActiveModule(null)} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-50 to-amber-50">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-light text-stone-700 mb-2 text-center">
          룰랭
        </h1>
        <p className="text-sm text-stone-500 text-center mb-12">
          잠깐 함께해요
        </p>

        <div className="space-y-3">
          <ModuleButton
            title="호흡 원"
            desc="원에 맞춰 천천히 들숨 날숨"
            onClick={() => setActiveModule('breathing')}
          />
          <ModuleButton
            title="풍선 호흡"
            desc="화면을 누르고 떼며 호흡 조절"
            onClick={() => setActiveModule('balloon')}
          />
          <ModuleButton
            title="손가락 호흡"
            desc="손가락 따라가며 호흡하기"
            onClick={() => setActiveModule('finger')}
          />
          <ModuleButton
            title="현재 순간"
            desc="지금 여기로 돌아오는 1~2분"
            onClick={() => setActiveModule('present')}
          />
          <ModuleButton
            title="5-4-3-2-1"
            desc="감각으로 지금에 머무는 그라운딩"
            onClick={() => setActiveModule('grounding')}
          />
          <ModuleButton
            title="한 잔의 시간"
            desc="마시는 동안 머무는 2분"
            onClick={() => setActiveModule('drinking')}
          />
          <ModuleButton
            title="나비 포옹"
            desc="가슴을 토닥이며 가라앉히기"
            onClick={() => setActiveModule('butterfly')}
          />
          <ModuleButton
            title="걱정 비우기"
            desc="자기 전, 머릿속 정리하고 내려놓기"
            onClick={() => setActiveModule('worry')}
          />
          <ModuleButton
            title="오늘의 세 가지"
            desc="좋았던 순간 세 가지 적기"
            onClick={() => setActiveModule('goodthings')}
          />
          <ModuleButton
            title="STOP"
            desc="충동과 행동 사이, 30초 멈춤"
            onClick={() => setActiveModule('stop')}
          />
        </div>
      </div>
    </div>
  )
}

function ModuleButton({ title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-5 bg-white/70 backdrop-blur rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition text-left"
    >
      <div className="text-lg text-stone-800 mb-1">{title}</div>
      <div className="text-sm text-stone-500">{desc}</div>
    </button>
  )
}
