import { useState, useRef, useEffect } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 딴생각 주차장 — '집중이 안 될 때' 코너.
// 집중 중 튀어나오는 잡념을 한 칸씩 '주차'해 작업기억을 비운다(인지부하 오프로딩).
// 저장해 두고, 나중에 '진짜 할 일 / 안 해도 됨'으로 정리 → 대부분 별거 아니었다는 통찰.
// '진짜 할 일' 하나는 3·2·1 시작으로 넘길 수 있다.
const PK_KEY = 'roulin_parking'
const HANDOFF_KEY = 'roulin_focus_task'
const CAR_COLORS = ['#7dbef0', '#f5a97f', '#87d3a6', '#c3a6ef', '#f0a3c0', '#f2cf6b']
const colorAt = (i) => CAR_COLORS[i % CAR_COLORS.length]

const loadParked = () => {
  try { const a = JSON.parse(localStorage.getItem(PK_KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
const saveParked = (arr) => { try { localStorage.setItem(PK_KEY, JSON.stringify(arr.slice(-100))) } catch { /* noop */ } }

export default function ParkingLot({ onExit }) {
  const [parked, setParked] = useState(loadParked) // {text, at}
  const [phase, setPhase] = useState('intro')
  const [text, setText] = useState('')

  // 정리(review) 상태
  const [reviewIdx, setReviewIdx] = useState(0)
  const [leaving, setLeaving] = useState(null) // 'keep' | 'drop'
  const [todos, setTodos] = useState([])
  const reviewTotalRef = useRef(0)

  // ── 소리 (Web Audio 합성, 음소거 존중) ──
  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const acRef = useRef(null)
  const audio = () => {
    if (!acRef.current) { const C = window.AudioContext || window.webkitAudioContext; if (C) acRef.current = new C() }
    const c = acRef.current
    if (c && c.state === 'suspended') c.resume()
    return c
  }
  const note = (freq, start, dur, vol, type = 'sine', slideTo) => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const o = c.createOscillator(); const g = c.createGain()
    o.type = type; o.frequency.setValueAtTime(freq, t + start)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + start + dur)
    g.gain.setValueAtTime(0, t + start)
    g.gain.linearRampToValueAtTime(vol, t + start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur)
    o.connect(g); g.connect(c.destination); o.start(t + start); o.stop(t + start + dur + 0.02)
  }
  // 딴생각 주차 — 작고 부드러운 '도롱'(경쾌·큰 느낌 제거)
  const parkSound = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const o = c.createOscillator(); const g = c.createGain(); const f = c.createBiquadFilter()
    o.type = 'sine'
    o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(555, t + 0.18)
    f.type = 'lowpass'; f.frequency.value = 1500
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.06, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    o.connect(f); f.connect(g); g.connect(c.destination)
    o.start(t); o.stop(t + 0.3)
  }
  // 진짜 할 일 — 부릉 시동 걸고 출발하는 차(노이즈 기반: 크랭크→레브업→출발)
  const carStart = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const dur = 1.05
    const len = Math.floor(c.sampleRate * dur)
    const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.03 * w) / 1.03; d[i] = last * 2.4 }
    const s = c.createBufferSource(); s.buffer = buf
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.0
    bp.frequency.setValueAtTime(300, t)                     // 크랭크(낮게)
    bp.frequency.linearRampToValueAtTime(1300, t + 0.5)     // 부릉! 레브 업
    bp.frequency.exponentialRampToValueAtTime(520, t + dur) // 출발하며 멀어짐
    const trem = c.createGain(); trem.gain.setValueAtTime(0.55, t) // 크랭크 chug → 부드러워짐
    const lfo = c.createOscillator(); lfo.type = 'sine'
    lfo.frequency.setValueAtTime(22, t); lfo.frequency.linearRampToValueAtTime(7, t + dur)
    const ld = c.createGain(); ld.gain.setValueAtTime(0.4, t); ld.gain.linearRampToValueAtTime(0.12, t + dur)
    lfo.connect(ld); ld.connect(trem.gain)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.12)      // 크랭크
    g.gain.setValueAtTime(0.09, t + 0.32)
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.52)      // 부릉! 캐치
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)    // 출발
    s.connect(bp); bp.connect(trem); trem.connect(g); g.connect(c.destination)
    const sub = c.createOscillator(); sub.type = 'sine' // 레브 저역(부릉 몸통)
    sub.frequency.setValueAtTime(58, t); sub.frequency.linearRampToValueAtTime(112, t + 0.52); sub.frequency.exponentialRampToValueAtTime(80, t + dur)
    const sg = c.createGain(); sg.gain.setValueAtTime(0.0001, t)
    sg.gain.exponentialRampToValueAtTime(0.1, t + 0.5); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    sub.connect(sg); sg.connect(c.destination)
    s.start(t); lfo.start(t); lfo.stop(t + dur); sub.start(t); sub.stop(t + dur)
  }
  // 안 해도 됐네 — 노이즈 기반 '차가 멀어지는' 소리(톤 없음).
  // 엔진/도로 노이즈 + 트레몰로(브르르릉 퍼터) + 멀어질수록 어둡고 작아짐.
  const carAway = () => {
    if (mutedRef.current) return
    const c = audio(); if (!c) return
    const t = c.currentTime
    const dur = 0.85
    const len = Math.floor(c.sampleRate * dur)
    const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.03 * w) / 1.03; d[i] = last * 2.4 } // 브라운 노이즈
    const s = c.createBufferSource(); s.buffer = buf
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9
    bp.frequency.setValueAtTime(650, t)                       // 가까울 땐 밝게
    bp.frequency.exponentialRampToValueAtTime(180, t + dur)   // 멀어지며 어두워짐
    // 트레몰로(엔진 putter): gain을 빠르게 흔들어 '브르르릉'
    const trem = c.createGain(); trem.gain.setValueAtTime(0.7, t)
    const lfo = c.createOscillator(); lfo.type = 'sine'
    lfo.frequency.setValueAtTime(17, t); lfo.frequency.linearRampToValueAtTime(9, t + dur)
    const ld = c.createGain(); ld.gain.setValueAtTime(0.32, t)
    lfo.connect(ld); ld.connect(trem.gain)
    const g = c.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.1)        // 부릉 밟기
    g.gain.setValueAtTime(0.14, t + 0.28)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)      // 멀어지며 사라짐
    s.connect(bp); bp.connect(trem); trem.connect(g); g.connect(c.destination)
    // 약한 저역 바디(부릉의 몸통, 톤이 도드라지지 않게 작게)
    const sub = c.createOscillator(); sub.type = 'sine'
    sub.frequency.setValueAtTime(72, t); sub.frequency.exponentialRampToValueAtTime(46, t + dur)
    const sg = c.createGain(); sg.gain.setValueAtTime(0.0001, t)
    sg.gain.exponentialRampToValueAtTime(0.07, t + 0.1); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    sub.connect(sg); sg.connect(c.destination)
    s.start(t); lfo.start(t); lfo.stop(t + dur); sub.start(t); sub.stop(t + dur)
  }
  useEffect(() => () => { try { acRef.current && acRef.current.close() } catch { /* noop */ } }, [])

  const park = () => {
    if (!text.trim()) return
    const next = [...parked, { text: text.trim(), at: Date.now() }]
    setParked(next); saveParked(next)
    setText(''); parkSound()
  }

  const startReview = () => {
    reviewTotalRef.current = parked.length
    setReviewIdx(0); setTodos([]); setLeaving(null); setPhase('review')
  }

  const sortCurrent = (keep) => {
    if (leaving) return
    const item = parked[reviewIdx]
    setLeaving(keep ? 'keep' : 'drop')
    if (keep) { setTodos((t) => [...t, item.text]); carStart() } else { carAway() }
    setTimeout(() => {
      setLeaving(null)
      const next = reviewIdx + 1
      if (next >= parked.length) {
        setParked([]); saveParked([]) // 정리 끝 → 주차장 비움
        setPhase('summary')
      } else setReviewIdx(next)
    }, 470)
  }

  const focusOn = (todoText) => {
    try { localStorage.setItem(HANDOFF_KEY, todoText) } catch { /* noop */ }
    onExit() // 홈으로 → 3·2·1 시작을 열면 이 할 일이 준비돼 있음
  }

  // ── intro ──
  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>딴생각 주차장</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
              집중하려는데 자꾸 딴 게 떠오르죠.<br />
              튀어나오는 생각을 여기 잠깐 주차해 둬요.
            </p>
            <p className="text-[12px] text-r-gray-soft mb-12">나중에 꺼내 '진짜 할 일'만 골라낼 수 있어요.</p>
            <button onClick={() => setPhase('running')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              주차하기
            </button>
            {parked.length > 0 && (
              <button
                onClick={startReview}
                className="w-full py-4 mt-3 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition"
              >
                지난 주차장 정리하기 ({parked.length}대)
              </button>
            )}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // ── running (주차) ──
  if (phase === 'running') {
    return (
      <ModuleFrame onExit={onExit}>
        <style>{`@keyframes pk-drivein{0%{transform:translateX(120px);opacity:0}70%{transform:translateX(-5px);opacity:1}100%{transform:translateX(0)}}.pk-drivein{animation:pk-drivein .45s cubic-bezier(.2,.7,.3,1) both}`}</style>
        <div className="min-h-screen bg-cream flex flex-col items-center p-6 pt-16">
          <div className="max-w-md w-full">
            <p className="text-center text-navy text-lg font-light mb-1">지금 떠오른 딴생각은?</p>
            <p className="text-center text-r-gray-soft text-xs mb-6">한 줄이면 돼요. 적고 주차하면 머리에서 비워져요.</p>

            <div className="flex gap-2 mb-8">
              <input
                value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') park() }}
                placeholder="예: 내일 회의 자료 확인해야 하는데" autoFocus
                className="flex-1 rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition text-[14px]"
              />
              <button onClick={park} disabled={!text.trim()}
                className={`px-5 rounded-2xl transition text-[14px] whitespace-nowrap ${text.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}>
                주차
              </button>
            </div>

            {parked.length > 0 ? (
              <>
                <p className="text-r-gray-soft text-[11px] mb-3 tracking-wide">주차된 생각 {parked.length}개</p>
                <div className="grid grid-cols-2 gap-2.5 mb-8">
                  {parked.map((e, i) => (
                    <div key={i} className={`relative rounded-xl border border-dashed border-line bg-white/70 px-3 pt-2.5 pb-2 ${i === parked.length - 1 ? 'pk-drivein' : ''}`}>
                      <Car color={colorAt(i)} />
                      <p className="mt-1 text-[11.5px] text-r-gray leading-snug line-clamp-2">{e.text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={startReview} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
                  이제 정리하기
                </button>
                <button onClick={onExit} className="w-full py-3 mt-2 text-r-gray-soft text-[13px] hover:text-r-gray transition">
                  나중에 · 그냥 닫기
                </button>
              </>
            ) : (
              <div className="text-center text-r-gray-soft text-[12px] mt-10 leading-relaxed">
                떠오르는 대로 하나씩 주차해 보세요.<br />여기 두면, 지금은 안 붙잡아도 돼요.
              </div>
            )}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // ── review (나중에 분류) ──
  if (phase === 'review') {
    const cur = parked[reviewIdx]
    if (!cur) return null
    const leaveStyle = {
      transition: 'transform .46s cubic-bezier(.4,0,.7,0), opacity .46s ease',
      transform: leaving === 'keep' ? 'translateY(-180px) scale(.7)' : leaving === 'drop' ? 'translateX(280px) rotate(10deg)' : 'none',
      opacity: leaving ? 0 : 1,
    }
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <p className="text-r-gray-soft text-[12px] mb-8 tracking-wide">
              {reviewIdx + 1} / {reviewTotalRef.current}  ·  이건 진짜 할 일일까요?
            </p>

            <div className="flex flex-col items-center mb-12" style={{ minHeight: 150 }}>
              <div style={leaveStyle}>
                <div className="scale-[2.1] mb-6"><Car color={colorAt(reviewIdx)} /></div>
                <p className="font-serif text-[20px] text-navy leading-snug px-4" style={{ fontWeight: 600 }}>{cur.text}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => sortCurrent(false)}
                className="flex-1 py-4 rounded-full bg-white text-r-gray border border-line hover:border-[#DCD5C4] transition text-[14px]"
              >
                안 해도 됐네
              </button>
              <button
                onClick={() => sortCurrent(true)}
                className="flex-1 py-4 rounded-full bg-navy text-white hover:bg-[#0c1a2b] transition text-[14px]"
              >
                진짜 할 일
              </button>
            </div>
            <p className="text-r-gray-soft text-[11px] mt-6">골라낸 할 일: {todos.length}개</p>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // ── summary (통찰 + 3·2·1로 넘기기) ──
  if (phase === 'summary') {
    const total = reviewTotalRef.current
    const m = todos.length
    const insight =
      m === 0 ? '다 지금 안 해도 될 것들이었네요. 가볍게 가요.'
      : m === total ? '다 진짜 할 일이네요. 하나만 골라 시작해봐요.'
      : '나머지는 흘려보냈어요. 생각보다 급한 건 얼마 없죠.'
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[24px] text-navy mb-2 leading-snug" style={{ fontWeight: 600 }}>
              적어둔 {total}개 중,<br />진짜 할 일은 {m}개였어요
            </p>
            <p className="text-r-gray text-sm font-light mb-8 leading-relaxed">{insight}</p>

            {m > 0 && (
              <div className="text-left mb-8">
                <p className="text-r-gray-soft text-[11px] mb-2 tracking-wide">이 중 하나로 바로 집중해볼까요?</p>
                <div className="space-y-2">
                  {todos.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => focusOn(t)}
                      className="w-full flex items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-3 hover:border-[#DCD5C4] transition text-left"
                    >
                      <span className="text-[13.5px] text-ink line-clamp-1">{t}</span>
                      <span className="text-[11px] text-amber whitespace-nowrap">3·2·1로 시작 →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
              닫기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 작은 자동차 실루엣
function Car({ color = '#7dbef0' }) {
  return (
    <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 18 L6 11 Q8 7 13 7 L30 7 Q35 7 38 11 L43 15 Q44 16 44 18 L44 19 Q44 20 43 20 L3 20 Q2 20 2 19 Z" fill={color} />
      <path d="M11 8 L28 8 Q31 8 33 11 L18 11 Q13 11 11 8 Z" fill="#ffffff" opacity="0.55" />
      <circle cx="13" cy="20" r="4" fill="#3a3733" />
      <circle cx="13" cy="20" r="1.6" fill="#cfd6e2" />
      <circle cx="34" cy="20" r="4" fill="#3a3733" />
      <circle cx="34" cy="20" r="1.6" fill="#cfd6e2" />
    </svg>
  )
}
