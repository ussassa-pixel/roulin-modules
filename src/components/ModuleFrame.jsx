import { useSpeech } from '../context/SpeechContext'

export default function ModuleFrame({ children, onExit, dark = false }) {
  const { isMuted, toggleMute, voice, setVoice } = useSpeech()

  const btnClass = dark
    ? 'text-white/40 hover:text-white/70'
    : 'text-[#A8A294] hover:text-navy'
  const activeClass = dark ? 'text-white/90' : 'text-navy'
  const idleClass = dark ? 'text-white/30 hover:text-white/60' : 'text-[#A8A294] hover:text-navy'
  const dotClass = dark ? 'text-white/20' : 'text-[#D8D2C4]'

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <button
          onClick={toggleMute}
          className={`text-[11px] tracking-wider font-light transition ${btnClass}`}
        >
          {isMuted ? '소리 켜기' : '소리 끄기'}
        </button>
        {!isMuted && (
          <span className="flex items-center gap-1 text-[11px] tracking-wider font-light select-none">
            <button
              onClick={() => setVoice('female')}
              className={`transition ${voice === 'female' ? activeClass : idleClass}`}
              style={voice === 'female' ? { fontWeight: 600 } : undefined}
              aria-pressed={voice === 'female'}
            >
              여
            </button>
            <span className={dotClass}>·</span>
            <button
              onClick={() => setVoice('male')}
              className={`transition ${voice === 'male' ? activeClass : idleClass}`}
              style={voice === 'male' ? { fontWeight: 600 } : undefined}
              aria-pressed={voice === 'male'}
            >
              남
            </button>
          </span>
        )}
      </div>
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
