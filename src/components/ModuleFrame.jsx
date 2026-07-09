import { useSpeech } from '../context/SpeechContext'

export default function ModuleFrame({ children, onExit, dark = false }) {
  const { isMuted, toggleMute } = useSpeech()

  const btnClass = dark
    ? 'text-white/40 hover:text-white/70'
    : 'text-[#A8A294] hover:text-navy'

  return (
    <div className="min-h-screen relative">
      <button
        onClick={toggleMute}
        className={`absolute top-6 left-6 z-10 text-[11px] tracking-wider font-light transition ${btnClass}`}
      >
        {isMuted ? '소리 켜기' : '소리 끄기'}
      </button>
      <button
        onClick={onExit}
        className={`absolute top-6 right-6 z-10 text-[11px] tracking-wider font-light transition ${btnClass}`}
      >
        나가기
      </button>
      {children}
    </div>
  )
}
