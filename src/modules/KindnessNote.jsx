import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'

// 오늘의 다정 배달 (부록 kindness_note) — 능동 자기다정(자기자비, Neff 계열).
// 기존과의 구분(카피로 지킬 것): 위로 뽑기 = 앱이 주는 위로(수동 수신),
// 자기 다독임 = 위로받는 심상. 이건 "내가 나에게 쓰는" 능동 발신.
// 카피 가드: 성격 규정("넌 원래 잘해") 지양 — 오늘의 행위·상황에 대한 다정으로.
// 도움 문구는 예시일 뿐(삽입 강요 X). 저장은 선택, 기본 off. EndRating 없음.
const HINTS = ['오늘 애썼어', '그럴 수도 있지', '이만하면 잘하고 있어']

const SAVE_KEY = 'roulin_kindness_notes' // 선택 저장: [{text, at}] 최근 50개
const SAVE_MAX = 50

function getNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'

export default function KindnessNote({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro → write → deliver | archive
  const [text, setText] = useState('')
  const [keep, setKeep] = useState(false) // 저장 토글 — 기본 off
  const savedCount = getNotes().length

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const deliver = () => {
    if (!text.trim()) return
    if (keep) {
      try {
        const notes = getNotes()
        notes.push({ text: text.trim(), at: Date.now() })
        localStorage.setItem(SAVE_KEY, JSON.stringify(notes.slice(-SAVE_MAX)))
      } catch { /* noop */ }
    }
    setPhase('deliver')
  }

  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>오늘의 다정 배달</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          오늘 나에게,<br />다정한 말 한마디 건네볼까요?
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">남한테 하듯, 나한테도.</p>
        <button onClick={() => setPhase('write')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          한마디 써볼게요
        </button>
        {savedCount > 0 && (
          <button onClick={() => setPhase('archive')} className="mt-4 text-[12px] text-r-gray-soft hover:text-r-gray tracking-wide transition">
            그동안 나에게 건넨 말들 ({savedCount})
          </button>
        )}
      </div>
    )

  if (phase === 'write')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[22px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>
          오늘의 나에게,<br />뭐라고 해줄래요?
        </p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />
        <input
          className={inputCls}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="예: 오늘 그 순간, 잘 버텼어"
          autoFocus
        />
        {/* 막힐 때 예시 — 강요 아님 */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 mb-2">
          {HINTS.map((h) => (
            <button
              key={h}
              onClick={() => setText(h)}
              className="px-4 py-2 rounded-full bg-white border border-line text-r-gray text-[12px] hover:border-[#DCD5C4] hover:text-navy transition"
            >
              {h}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-r-gray-soft mb-6">막히면 눌러도 돼요. 예시일 뿐이에요.</p>

        <label className="flex items-center justify-center gap-2 mb-5 cursor-pointer select-none">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="accent-[#E0A33E]" />
          <span className="text-[12px] text-r-gray">이 문장 모아두기 (이 기기에만)</span>
        </label>

        <button
          onClick={deliver}
          disabled={!text.trim()}
          className={`w-full py-4 rounded-full transition ${text.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          나에게 보내기
        </button>
      </div>
    )

  if (phase === 'deliver')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="eyebrow mb-8">나에게 도착한 말</p>

        {/* 쪽지 도착 — 위에서 살랑 내려오는 카드 */}
        <div className="mb-10" style={{ perspective: '900px' }}>
          <div
            className="relative mx-auto w-72 rounded-3xl overflow-hidden px-8 py-10"
            style={{
              animation: 'noteArrive 0.8s cubic-bezier(0.2, 0.75, 0.3, 1) both',
              background: 'linear-gradient(168deg, #FFFFFF 0%, #FCF9F0 55%, #F6EFDE 100%)',
              boxShadow: '0 26px 52px rgba(17,35,56,0.16), 0 5px 14px rgba(17,35,56,0.08)',
            }}
          >
            <span className="absolute inset-[8px] rounded-[20px] border border-amber/35 pointer-events-none" />
            {/* 봉투 뚜껑 느낌의 상단 라인 */}
            <svg viewBox="0 0 48 24" className="w-9 h-5 mx-auto mb-4" aria-hidden="true">
              <path d="M4 4 L24 18 L44 4" fill="none" stroke="#E0A33E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-serif text-[19px] text-navy leading-relaxed" style={{ fontWeight: 600 }}>{text}</p>
            <span className="mt-6 mx-auto block w-8 h-px bg-amber/50" />
          </div>
          <style>{`@keyframes noteArrive {
            0%   { transform: translateY(-46px) rotate(-3deg); opacity: 0; }
            65%  { transform: translateY(6px) rotate(0.5deg); opacity: 1; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }`}</style>
        </div>

        <p className="text-[14px] text-navy font-light mb-10">나에게 잘 전해졌어요.</p>
        <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">
          품고 갈게요
        </button>
      </div>
    )

  if (phase === 'archive') {
    const notes = getNotes().slice().reverse()
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center font-serif text-[22px] text-navy mb-3" style={{ fontWeight: 600 }}>그동안 나에게 건넨 말들</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-8" />
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 mb-8">
          {notes.map((n, i) => (
            <div key={i} className="roulin-card px-5 py-4 text-left">
              <p className="text-ink text-[14px] leading-relaxed mb-1">{n.text}</p>
              <p className="text-r-gray-soft text-[11px]">{new Date(n.at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('intro')} className="w-full py-4 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">
          돌아가기
        </button>
      </div>
    )
  }

  return null
}
