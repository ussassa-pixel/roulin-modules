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

export default function App() {
  const [activeModule, setActiveModule] = useState(null)

  return (
    <SpeechProvider>
      {activeModule === 'present'    && <PresentMoment onExit={() => setActiveModule(null)} />}
      {activeModule === 'stop'       && <StopCard onExit={() => setActiveModule(null)} />}
      {activeModule === 'drinking'   && <DrinkingMeditation onExit={() => setActiveModule(null)} />}
      {activeModule === 'butterfly'  && <ButterflyHug onExit={() => setActiveModule(null)} />}
      {activeModule === 'goodthings' && <ThreeGoodThings onExit={() => setActiveModule(null)} />}
      {activeModule === 'breathing'  && <BreathingCircle onExit={() => setActiveModule(null)} />}
      {activeModule === 'finger'     && <FingerBreathing onExit={() => setActiveModule(null)} />}
      {activeModule === 'worry'      && <WorryDump onExit={() => setActiveModule(null)} />}
      {activeModule === 'grounding'  && <Grounding54321 onExit={() => setActiveModule(null)} />}

      {activeModule === null && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-md w-full">
            <h1 className="text-2xl font-light text-stone-700 mb-2 text-center">룰랭</h1>
            <p className="text-sm text-stone-500 text-center mb-12">잠깐 함께해요</p>

            <div className="space-y-3">
              <ModuleButton title="호흡 원"       desc="원에 맞춰 천천히 들숨 날숨"          onClick={() => setActiveModule('breathing')} />
              <ModuleButton title="손가락 호흡"   desc="손가락 따라가며 호흡하기"            onClick={() => setActiveModule('finger')} />
              <ModuleButton title="현재 순간"     desc="지금 여기로 돌아오는 1~2분"          onClick={() => setActiveModule('present')} />
              <ModuleButton title="5-4-3-2-1"    desc="감각으로 지금에 머무는 그라운딩"      onClick={() => setActiveModule('grounding')} />
              <ModuleButton title="한 잔의 시간"  desc="마시는 동안 머무는 2분"              onClick={() => setActiveModule('drinking')} />
              <ModuleButton title="나비 포옹"     desc="가슴을 토닥이며 가라앉히기"          onClick={() => setActiveModule('butterfly')} />
              <ModuleButton title="걱정 비우기"   desc="자기 전, 머릿속 정리하고 내려놓기"   onClick={() => setActiveModule('worry')} />
              <ModuleButton title="오늘의 세 가지" desc="좋았던 순간 세 가지 적기"           onClick={() => setActiveModule('goodthings')} />
              <ModuleButton title="STOP"          desc="충동과 행동 사이, 30초 멈춤"         onClick={() => setActiveModule('stop')} />
            </div>
          </div>
        </div>
      )}
    </SpeechProvider>
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
