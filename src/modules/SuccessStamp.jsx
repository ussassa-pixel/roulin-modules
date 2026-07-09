import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 작은 성공 도장 (부록 success_stamp) — 즉시 자축 리추얼. 근거 주장 없음(성취 측정 아님).
// day_close와의 구분(카피로 지킬 것): 그건 하루 마감 회고(밤, 정산),
// 이건 "방금/지금" 해낸 것을 그 자리에서 즉시 자축 — "하루"라는 말을 쓰지 않는다.
// 라벨·평가 금지: 크기 비교("이 정도면 큰 성공") 금지, 어떤 항목도 동등하게 도장.
// 저장은 선택(도장 누적), 기본 off. EndRating 없음.
const SAVE_KEY = 'roulin_success_stamps' // [{text, at}] 최근 60개
const SAVE_MAX = 60

function getStamps() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

// 도장 인장 — 이중 링 + 날짜
function Seal({ date, className }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-full border-[3px] border-amber ${className}`}
      style={{ boxShadow: 'inset 0 0 0 2px rgba(224,163,62,0.25)' }}
    >
      <span className="absolute inset-[6px] rounded-full border border-amber/50" aria-hidden="true" />
      <span className="font-serif text-amber leading-none" style={{ fontWeight: 700, fontSize: '1.35em' }}>해냄</span>
      <span className="text-amber/80 mt-1" style={{ fontSize: '0.55em', letterSpacing: '0.08em' }}>{date}</span>
    </div>
  )
}

export default function SuccessStamp({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → what → stamp
  const [text, setText] = useState('')
  const [keep, setKeep] = useState(false) // 저장 토글 — 기본 off
  const audioRef = useRef(null)
  const { isMuted } = useSpeech()

  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}.${today.getDate()}`
  const savedStamps = getStamps()

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  // 쾅 — 낮은 툭 + 짧은 탁 (코드 합성, 소리끄기 존중)
  const playThud = () => {
    if (isMuted) return
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    if (!audioRef.current) audioRef.current = new Ctx()
    const c = audioRef.current
    if (c.state === 'suspended') c.resume()
    const t = c.currentTime + 0.32 // 도장이 내려찍히는 타이밍에 맞춤
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(160, t)
    o.frequency.exponentialRampToValueAtTime(60, t + 0.14)
    g.gain.setValueAtTime(0.4, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
    o.connect(g); g.connect(c.destination)
    o.start(t); o.stop(t + 0.18)
    const len = Math.ceil(c.sampleRate * 0.05)
    const buf = c.createBuffer(1, len, c.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
    const src = c.createBufferSource()
    src.buffer = buf
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.8
    const g2 = c.createGain()
    g2.gain.setValueAtTime(0.22, t)
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    src.connect(bp); bp.connect(g2); g2.connect(c.destination)
    src.start(t)
  }

  const stamp = () => {
    if (!text.trim()) return
    if (keep) {
      try {
        const stamps = getStamps()
        stamps.push({ text: text.trim(), at: Date.now() })
        localStorage.setItem(SAVE_KEY, JSON.stringify(stamps.slice(-SAVE_MAX)))
      } catch { /* noop */ }
    }
    playThud()
    setPhase('stamp')
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>작은 성공 도장</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-12 leading-relaxed">
          방금, 뭔가 해내셨네요.<br />도장 하나 찍고 갈까요?
        </p>
        <button onClick={() => setPhase('what')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          찍으러 갈게요
        </button>
      </div>
    )

  if (phase === 'what')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>무엇을 해냈어요?</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-3" />
        <p className="text-[12px] text-r-gray-soft mb-8">아주 작아도 돼요. 설거지도, 답장 하나도.</p>
        <input
          className={inputCls}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 미루던 전화 한 통"
          autoFocus
        />
        <label className="flex items-center justify-center gap-2 mt-5 mb-5 cursor-pointer select-none">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="accent-[#E0A33E]" />
          <span className="text-[12px] text-r-gray">도장 모아두기 (이 기기에만)</span>
        </label>
        <button
          onClick={stamp}
          disabled={!text.trim()}
          className={`w-full py-4 rounded-full transition ${text.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          도장 찍기
        </button>
      </div>
    )

  if (phase === 'stamp') {
    const stamps = keep ? getStamps().slice().reverse() : []
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">지금, 해낸 것</p>

        {/* 해낸 일 카드 + 쾅 찍히는 도장 */}
        <div className="relative mx-auto w-72 rounded-3xl px-8 pt-10 pb-14 mb-10"
          style={{
            background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
            boxShadow: '0 26px 52px rgba(17,35,56,0.16), 0 5px 14px rgba(17,35,56,0.08)',
          }}
        >
          <span className="absolute inset-[8px] rounded-[20px] border border-amber/30 pointer-events-none" />
          <p className="font-serif text-[19px] text-navy leading-relaxed mb-2" style={{ fontWeight: 600 }}>{text}</p>
          <div className="absolute -bottom-6 right-5" style={{ animation: 'stampIn 0.45s cubic-bezier(0.34, 1.3, 0.5, 1) both' }}>
            <Seal date={dateLabel} className="w-24 h-24 text-[15px] bg-cream/90 backdrop-blur-[1px]" />
          </div>
          <style>{`@keyframes stampIn {
            0%   { transform: scale(2.6) rotate(-24deg); opacity: 0; }
            70%  { transform: scale(0.94) rotate(-9deg); opacity: 1; }
            100% { transform: scale(1) rotate(-9deg); opacity: 1; }
          }`}</style>
        </div>

        <p className="text-[14px] text-navy font-light mb-2">잘했어요. 이건 확실히 해낸 거예요.</p>

        {/* 저장 on이면 누적 도장 잠깐 보여주기 */}
        {stamps.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-5 mb-2 max-h-24 overflow-hidden" aria-label="그동안 찍은 도장들">
            {stamps.slice(0, 12).map((s, i) => (
              <span key={i} title={s.text} className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-amber/50 text-amber text-[9px]" style={{ fontWeight: 700, transform: `rotate(${(i % 3 - 1) * 8}deg)` }}>
                해냄
              </span>
            ))}
          </div>
        )}
        {stamps.length > 1 && <p className="text-[11px] text-r-gray-soft mb-6">모인 도장 {stamps.length}개</p>}

        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-6">
          닫을게요
        </button>
      </div>
    )
  }

  return null
}
