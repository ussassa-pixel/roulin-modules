import { useState, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'

// 화에 이름 붙이기 — '화가 날 때' 코너.
// 화 아래엔 대개 다른 마음이 있다(억울·서운·두려움·무시당함·지침…).
// 그 마음에 이름을 붙이면 조금 누그러진다(감정 라벨링). 조언·해결 강요 없음.
const HEAT_BG = { background: 'radial-gradient(ellipse at 50% 36%, #2f1620 0%, #1d1018 72%, #130b11 100%)' }

const FEELINGS = [
  { key: 'unfair', label: '억울해요' },
  { key: 'hurt', label: '서운해요' },
  { key: 'ignored', label: '무시당한 것 같아요' },
  { key: 'scared', label: '사실 두려워요' },
  { key: 'tired', label: '지쳤어요' },
  { key: 'wronged', label: '부당해요' },
  { key: 'lonely', label: '혼자인 것 같아요' },
  { key: 'helpless', label: '어쩔 수 없어 답답해요' },
]

// 선택에 따른 부드러운 되비침(해결책 아님)
const REFLECT = {
  unfair: '억울함이 있었네요. 그럴 만했어요.',
  hurt: '서운했군요. 그만큼 기대했던 마음이 있었던 거예요.',
  ignored: '무시당한 느낌은 아프죠. 당신은 그럴 존재가 아니에요.',
  scared: '화 아래에 두려움이 있었네요. 알아채 준 것만으로 충분해요.',
  tired: '많이 지쳐 있었군요. 화가 날 만도 했어요.',
  wronged: '부당하다고 느꼈네요. 그 감각은 틀리지 않아요.',
  lonely: '혼자인 것 같았군요. 지금 이 마음은 알아줄 가치가 있어요.',
  helpless: '어쩔 수 없어 답답했네요. 그 무력함까지 그럴 만했어요.',
}

export default function NameAnger({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [picked, setPicked] = useState([])
  const [note, setNote] = useState('')
  const taRef = useRef(null)

  const toggle = (key) => setPicked((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key])

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={HEAT_BG}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-white mb-3" style={{ fontWeight: 600 }}>화에 이름 붙이기</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-6" />
            <p className="text-[14px] text-white/75 font-light mb-2 leading-relaxed">
              화 아래엔 대개 다른 마음이 숨어 있어요.<br />이름을 붙여 주면 조금 누그러져요.
            </p>
            <p className="text-[12px] text-white/45 mb-10">고치려는 게 아니라, 알아봐 주려는 거예요.</p>
            <button onClick={() => setPhase('pick')}
              className="w-full py-4 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white/25 transition" style={{ fontWeight: 600 }}>
              들여다보기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'pick') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={HEAT_BG}>
          <div className="max-w-md w-full animate-fade-up">
            <p className="text-white/85 text-[17px] text-center font-light mb-1">화 밑에 어떤 마음이 있나요?</p>
            <p className="text-white/40 text-[12px] text-center mb-7">맞는 걸 눌러 보세요 · 여러 개 괜찮아요</p>
            <div className="flex flex-wrap justify-center gap-2.5 mb-9">
              {FEELINGS.map((f) => {
                const on = picked.includes(f.key)
                return (
                  <button key={f.key} onClick={() => toggle(f.key)}
                    className="px-4 py-2.5 rounded-full border transition text-[14px]"
                    style={on
                      ? { background: 'rgba(224,140,90,0.22)', borderColor: 'rgba(224,140,90,0.7)', color: '#fff', boxShadow: '0 0 14px 1px rgba(224,140,90,0.3)' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.75)' }}>
                    {f.label}
                  </button>
                )
              })}
            </div>
            <button disabled={picked.length === 0} onClick={() => setPhase('note')}
              className="w-full py-4 rounded-full transition"
              style={picked.length ? { background: '#fff', color: '#112338', fontWeight: 600 } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}>
              {picked.length ? '다음' : '하나 골라 주세요'}
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'note') {
    return (
      <ModuleFrame onExit={onExit} dark>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={HEAT_BG}>
          <div className="max-w-md w-full animate-fade-up">
            <p className="text-white/85 text-[17px] text-center font-light mb-1">무엇이 그렇게 만들었을까요?</p>
            <p className="text-white/40 text-[12px] text-center mb-6">한 줄이면 돼요 · 건너뛰어도 괜찮아요</p>
            <textarea
              ref={taRef} value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="예: 내 말을 끝까지 안 들어줘서…"
              className="w-full rounded-2xl border border-white/15 bg-white/[0.06] text-white placeholder-white/30 p-4 text-[15px] leading-relaxed focus:outline-none focus:border-white/35 transition mb-6"
            />
            <button onClick={() => setPhase('done')}
              className="w-full py-4 rounded-full bg-white text-navy hover:bg-white/90 transition" style={{ fontWeight: 600 }}>
              마음 들여다보기
            </button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  // done — 선택한 마음들을 부드럽게 되비춤
  return (
    <ModuleFrame onExit={onExit} dark>
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, #1c2740 0%, #111a2c 76%, #0a1120 100%)' }}>
        <div className="max-w-md w-full text-center animate-fade-up">
          <p className="text-amber/80 text-[12px] tracking-wide mb-5">화 아래에 있던 마음</p>
          <div className="space-y-2.5 mb-9">
            {picked.map((k) => (
              <p key={k} className="text-white/85 text-[16px] font-light leading-relaxed">{REFLECT[k]}</p>
            ))}
          </div>
          {note.trim() && (
            <p className="text-white/45 text-[13px] font-light mb-9 leading-relaxed">
              “{note.trim()}”<br /><span className="text-white/35">— 그런 일이 있었으면, 화날 만했어요.</span>
            </p>
          )}
          <p className="text-white/60 text-[14px] font-light mb-11 leading-relaxed">
            이름을 붙여 준 것만으로 화는 조금 작아져요.<br />지금 이 마음, 알아봐 줘서 고마워요.
          </p>
          <button onClick={() => { setPicked([]); setNote(''); setPhase('pick') }} className="w-full py-4 bg-white/12 text-white/85 border border-white/20 rounded-full hover:bg-white/20 transition mb-3">다시 들여다보기</button>
          <button onClick={onExit} className="w-full py-4 bg-white text-navy rounded-full hover:bg-white/90 transition" style={{ fontWeight: 600 }}>닫기</button>
        </div>
      </div>
    </ModuleFrame>
  )
}
