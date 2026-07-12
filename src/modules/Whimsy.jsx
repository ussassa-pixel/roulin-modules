import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import pool from '../content/whimsyQuestions.json'

// 오늘의 엉뚱 질문 — '그냥 재밌는 것' 코너.
// 정답 없는 공상 한 스푼. 카드를 넘기며 잠깐 딴 세상으로. 답은 저장하지 않는다.
// 성찰을 강요하지 않음 — 그냥 상상하는 재미. EndRating 없음.
const FUN_BG = { background: 'radial-gradient(ellipse at 50% 30%, #123a3c 0%, #0c2628 68%, #071618 100%)' }
const Q = pool.questions

export default function Whimsy({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [cur, setCur] = useState('')
  const [flip, setFlip] = useState(false)
  const seenRef = useRef([])

  const pick = () => {
    let idxs = Q.map((_, i) => i).filter((i) => !seenRef.current.includes(i))
    if (idxs.length === 0) { seenRef.current = []; idxs = Q.map((_, i) => i) }
    const idx = idxs[Math.floor(Math.random() * idxs.length)]
    seenRef.current.push(idx)
    return Q[idx]
  }

  const next = () => {
    // 카드 넘김 느낌 — 짧게 페이드
    setFlip(true)
    setTimeout(() => { setCur(pick()); setFlip(false) }, 180)
  }

  const begin = () => { setCur(pick()); setPhase('play') }

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>오늘의 엉뚱 질문</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <div className="text-[46px] mb-7 leading-none">💭</div>
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              정답 없는 질문 하나로<br />잠깐 딴 세상에 다녀와요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">소리 내 답해도, 그냥 상상만 해도 좋아요.</p>
            <button onClick={begin}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              질문 열기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={FUN_BG}>
        <div className="max-w-md w-full text-center">
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] px-6 py-12 mb-9 min-h-[190px] flex flex-col items-center justify-center transition-opacity duration-200"
            style={{ opacity: flip ? 0 : 1 }}>
            <p className="text-amber/70 text-[11px] tracking-widest mb-4">만약에…</p>
            <p className="text-white text-[21px] font-serif leading-relaxed" style={{ fontWeight: 500 }}>{cur}</p>
          </div>
          <button onClick={next} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">다른 질문</button>
          <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
        </div>
      </div>
    </ModuleFrame>
  )
}
