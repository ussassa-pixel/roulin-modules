import { useState } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import EndRating from '../components/EndRating'

// 마음 금고 — 보관(containment). 버릴 순 없지만 지금 들고 있기 힘든 것을 '나중에 꺼낼 수 있게' 잠시 담아둠.
// 핵심은 가역성: localStorage로 실제 보관 → 재방문 시 열어보기/더 두기/놓아주기가 실물로 작동.
// 카피 가드: 트라우마 어휘 금지, "없애기" 금지, "언제든 다시 꺼낼 수 있어요"(가역성) 포함, "여기까지만 해도 돼요" 포함.
const KEY = 'roulin_mind_vault'
const loadVault = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const saveVault = (arr) => { try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch { /* ignore */ } }

const inputCls =
  'w-full rounded-2xl border border-line bg-white px-5 py-4 text-ink outline-none focus:border-[#DCD5C4] placeholder-[#A8A294] transition'
const taCls = inputCls + ' resize-none leading-relaxed'

const CONTAINERS = [
  { key: 'safe', label: '금고' },
  { key: 'box', label: '나무 상자' },
  { key: 'drawer', label: '서랍' },
  { key: 'jar', label: '유리병' },
]

export default function MindVault({ onExit }) {
  const [items, setItems] = useState(loadVault)
  const [phase, setPhase] = useState(items.length ? 'check' : 'intro')

  // 담기 입력
  const [label, setLabel] = useState('')
  const [contentOn, setContentOn] = useState(false)
  const [content, setContent] = useState('')
  const [vaultImage, setVaultImage] = useState('safe')
  const [reopenHint, setReopenHint] = useState('')
  // 담는 의례
  const [closing, setClosing] = useState(false)
  const [stored, setStored] = useState(false)
  // 열어보기
  const [openItem, setOpenItem] = useState(null)
  const [releasedMsg, setReleasedMsg] = useState('')

  const page = (inner) => (
    <ModuleFrame onExit={onExit}>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">{inner}</div>
    </ModuleFrame>
  )

  const startNew = () => {
    setLabel(''); setContentOn(false); setContent(''); setVaultImage('safe'); setReopenHint('')
    setClosing(false); setStored(false); setPhase('intro')
  }

  // ── 재방문: 금고 확인 ──
  if (phase === 'check')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-1">금고에 담아둔 게 있어요</p>
        <p className="text-center text-r-gray-soft text-xs mb-7">열어봐도, 그대로 둬도 괜찮아요</p>
        <div className="space-y-3 mb-6 max-h-[52vh] overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl bg-white border border-line p-4">
              <div className="flex items-center gap-3 mb-3">
                <VaultIcon type={it.vaultImage} size={34} />
                <div className="min-w-0">
                  <p className="text-ink text-[15px] truncate">{it.label}</p>
                  {it.reopenHint && <p className="text-r-gray-soft text-[11px] truncate">언제쯤 · {it.reopenHint}</p>}
                </div>
              </div>
              {/* 어느 쪽도 유도하지 않도록 두 버튼을 동등하게 */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setOpenItem(it); setPhase('open') }} className="py-2.5 rounded-full bg-white text-ink border border-line text-[13px] hover:border-[#DCD5C4] transition">열어보기</button>
                <button onClick={onExit} className="py-2.5 rounded-full bg-white text-ink border border-line text-[13px] hover:border-[#DCD5C4] transition">그대로 두기</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={startNew} className="w-full py-3.5 text-[13px] text-r-gray hover:text-navy transition">새로 담기</button>
      </div>
    )

  // ── 열어보기 ──
  if (phase === 'open' && openItem) {
    const release = () => {
      const next = items.filter((x) => x.id !== openItem.id)
      setItems(next); saveVault(next)
      setReleasedMsg('놓아주었어요. 조금은 가벼워지기를.')
      setPhase('after')
    }
    const keep = () => { setReleasedMsg('다시 잘 담아두었어요.'); setPhase('after') }
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="flex justify-center mb-5"><VaultIcon type={openItem.vaultImage} size={72} open /></div>
        <div className="rounded-2xl bg-amber-soft/40 border border-amber/25 p-6 mb-6 text-left">
          <p className="text-navy font-serif text-[17px] leading-relaxed" style={{ fontWeight: 600 }}>{openItem.label}</p>
          {openItem.content && <p className="text-r-gray text-[14px] mt-2 leading-relaxed whitespace-pre-line">{openItem.content}</p>}
        </div>
        <p className="text-navy text-[15px] font-light mb-6">지금 보니, 어때요?</p>
        <div className="space-y-3">
          <button onClick={keep} className="w-full py-3.5 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">다시 담아둘게요</button>
          <button onClick={release} className="w-full py-3.5 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">이제 놓아줄게요</button>
        </div>
      </div>
    )
  }

  if (phase === 'after')
    return page(
      <div className="max-w-md w-full text-center animate-fade-in">
        <p className="font-serif text-[20px] text-navy mb-3 leading-relaxed" style={{ fontWeight: 600 }}>{releasedMsg}</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-12" />
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">닫기</button>
      </div>
    )

  // ── 새로 담기 ──
  if (phase === 'intro')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>마음 금고</p>
        <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
        <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
          버릴 수는 없는데, 지금 계속<br />들고 있기엔 무거운 마음이 있나요?<br />잠시 보관해둘 수 있어요.
        </p>
        <p className="text-[12px] text-r-gray-soft mb-12">없애는 게 아니에요. 언제든 다시 꺼낼 수 있어요.</p>
        <button onClick={() => setPhase('what')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">시작하기</button>
      </div>
    )

  if (phase === 'what')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">무엇을 담아둘까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-7">이름표만 붙여도 돼요. 자세히 적지 않아도 괜찮아요.</p>
        <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 그 일" autoFocus />
        {/* 내용 저장은 선택(기본 off) */}
        <button
          onClick={() => setContentOn((v) => !v)}
          className="flex items-center gap-2 mt-4 mb-1 text-[13px] text-r-gray hover:text-navy transition"
        >
          <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center ${contentOn ? 'bg-amber border-amber' : 'border-line bg-white'}`}>
            {contentOn && <span className="text-white text-[10px] leading-none">✓</span>}
          </span>
          내용도 함께 적어둘래요
        </button>
        {contentOn && (
          <textarea className={`${taCls} mt-2`} rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="적어두고 싶은 만큼만" />
        )}
        <button
          onClick={() => label.trim() && setPhase('vault')}
          disabled={!label.trim()}
          className={`w-full py-4 rounded-full transition mt-5 ${label.trim() ? 'bg-navy text-white hover:bg-[#0c1a2b]' : 'bg-line text-r-gray-soft cursor-not-allowed'}`}
        >
          다음
        </button>
        <p className="text-center text-[12px] text-r-gray-soft mt-4">여기까지만 해도 돼요.</p>
      </div>
    )

  if (phase === 'vault')
    return page(
      <div className="max-w-md w-full animate-fade-in">
        <p className="text-center text-navy text-lg font-light mb-2">어디에 담아둘까요?</p>
        <p className="text-center text-r-gray-soft text-xs mb-7">마음에 드는 곳으로</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CONTAINERS.map((c) => (
            <button
              key={c.key}
              onClick={() => setVaultImage(c.key)}
              className={`flex flex-col items-center gap-2 py-6 rounded-2xl border transition ${vaultImage === c.key ? 'bg-amber-soft/50 border-amber/40' : 'bg-white border-line hover:border-[#DCD5C4]'}`}
            >
              <VaultIcon type={c.key} size={44} />
              <span className="text-[13px] text-ink">{c.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setPhase('store')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">이걸로 할게요</button>
      </div>
    )

  if (phase === 'store') {
    const putAway = () => {
      setClosing(true)
      setTimeout(() => setStored(true), 850)
    }
    const finish = () => {
      const item = {
        id: String(Date.now()),
        label: label.trim(),
        content: contentOn && content.trim() ? content.trim() : null,
        vaultImage,
        storedAt: new Date().toISOString(),
        reopenHint: reopenHint.trim() || null,
      }
      const next = [item, ...items]
      setItems(next); saveVault(next)
      setPhase('done')
    }

    if (!stored)
      return page(
        <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
          {/* 담기는 카드 → 보관함으로 들어가 닫힘 */}
          <div className="relative flex flex-col items-center" style={{ height: 260, width: '100%' }}>
            <div
              className="rounded-2xl bg-white border border-line px-6 py-4 shadow-sm text-center"
              style={{
                transform: closing ? 'translateY(150px) scale(0.28)' : 'translateY(0) scale(1)',
                opacity: closing ? 0 : 1,
                transition: 'transform .8s cubic-bezier(.5,0,.4,1), opacity .8s ease-in',
              }}
            >
              <p className="text-navy font-serif text-[16px]" style={{ fontWeight: 600 }}>{label}</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 0 }}>
              <div style={{ transform: closing ? 'scale(1.06)' : 'scale(1)', transition: 'transform .3s ease .6s' }}>
                <VaultIcon type={vaultImage} size={110} open={!closing} />
              </div>
            </div>
          </div>
          {!closing && <button onClick={putAway} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-6">담아두기</button>}
        </div>
      )

    // 담긴 뒤: 문구 + 선택 reopenHint
    return page(
      <div className="max-w-md w-full flex flex-col items-center text-center animate-fade-in">
        <div className="mb-6"><VaultIcon type={vaultImage} size={104} /></div>
        <p className="font-serif text-[20px] text-navy mb-2 leading-relaxed" style={{ fontWeight: 600 }}>잘 담겼어요.</p>
        <p className="text-[13px] text-r-gray mb-8">필요할 때 언제든 꺼낼 수 있어요.</p>
        <input className={`${inputCls} text-center`} value={reopenHint} onChange={(e) => setReopenHint(e.target.value)} placeholder="언제쯤 다시 꺼내볼까요? (선택)" />
        <button onClick={finish} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mt-5">마무리</button>
        <button onClick={finish} className="w-full py-3 text-[13px] text-r-gray-soft hover:text-navy mt-1">건너뛰기</button>
      </div>
    )
  }

  if (phase === 'done')
    return page(
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="flex justify-center mb-5"><VaultIcon type={vaultImage} size={64} /></div>
        <div className="rounded-2xl bg-amber-soft/40 border border-amber/25 p-5 mb-8 text-left">
          <p className="text-navy font-serif text-[16px]" style={{ fontWeight: 600 }}>{label}</p>
          {reopenHint.trim() && <p className="text-[12px] text-amber mt-1.5">언제쯤 · <span className="text-ink">{reopenHint}</span></p>}
        </div>
        <p className="text-[14px] text-navy font-light mb-1">오늘은 여기까지.</p>
        <p className="text-[13px] text-r-gray mb-10">담아둔 건 사라지지 않아요.</p>
        <button onClick={() => setPhase('rating')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">닫기</button>
      </div>
    )

  if (phase === 'rating')
    return (
      <ModuleFrame onExit={onExit}>
        <EndRating onComplete={() => onExit()} />
      </ModuleFrame>
    )

  return null
}

// ── 보관함 아이콘 (금고/상자/서랍/병) ──
const S = '#33415a'
function VaultIcon({ type, size = 48, open = false }) {
  const common = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  const amber = '#E0A33E'
  if (type === 'safe')
    return (
      <svg {...common}>
        <rect x="10" y="12" width="44" height="40" rx="6" fill="#fff" stroke={S} strokeWidth="3" />
        <rect x="16" y="18" width="26" height="28" rx="4" fill="none" stroke={S} strokeWidth="2" opacity="0.5" />
        <circle cx="29" cy="32" r="8" fill="none" stroke={S} strokeWidth="2.5" />
        <circle cx="29" cy="32" r="2" fill={amber} />
        <path d="M 29 24 v -3 M 29 40 v 3 M 21 32 h -3 M 37 32 h 3" stroke={S} strokeWidth="2" strokeLinecap="round" />
        <rect x="46" y="28" width="4" height="8" rx="2" fill={S} />
      </svg>
    )
  if (type === 'box')
    return (
      <svg {...common}>
        <path d="M 12 26 L 32 18 L 52 26 L 52 48 L 32 54 L 12 48 Z" fill="#fff" stroke={S} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 12 26 L 32 34 L 52 26" fill="none" stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 32 34 L 32 54" stroke={S} strokeWidth="2" opacity="0.5" />
        {!open && <rect x="28" y="30" width="8" height="6" rx="2" fill={amber} />}
      </svg>
    )
  if (type === 'drawer')
    return (
      <svg {...common}>
        <rect x="12" y="14" width="40" height="36" rx="5" fill="#fff" stroke={S} strokeWidth="3" />
        <rect x="17" y="19" width="30" height="12" rx="3" fill="none" stroke={S} strokeWidth="2" opacity="0.45" />
        <rect x="17" y="34" width="30" height="12" rx="3" fill="#fff" stroke={S} strokeWidth="2.5"
          style={{ transform: open ? 'translateY(4px)' : 'translateY(0)', transition: 'transform .5s' }} />
        <circle cx="32" cy="40" r="2.2" fill={amber} />
      </svg>
    )
  // jar
  return (
    <svg {...common}>
      <rect x="22" y="12" width="20" height="7" rx="2.5" fill="#fff" stroke={S} strokeWidth="3" />
      <path d="M 20 22 Q 20 20, 24 20 L 40 20 Q 44 20, 44 22 L 44 48 Q 44 54, 38 54 L 26 54 Q 20 54, 20 48 Z" fill="#fff" stroke={S} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 24 34 q 8 -3 16 0" fill="none" stroke={amber} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
