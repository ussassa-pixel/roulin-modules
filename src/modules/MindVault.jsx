import { useState, useId } from 'react'
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
  { key: 'safe', label: '금고', desc: '두껍고 단단하게 잠가서' },
  { key: 'box', label: '나무 상자', desc: '묵직하게 눌러 담아' },
  { key: 'drawer', label: '서랍', desc: '가지런히 넣어두기' },
  { key: 'jar', label: '유리병', desc: '맑게 담아두기' },
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
              className={`flex flex-col items-center gap-1.5 py-5 rounded-2xl border transition ${vaultImage === c.key ? 'bg-amber-soft/50 border-amber/40' : 'bg-white border-line hover:border-[#DCD5C4]'}`}
            >
              <VaultIcon type={c.key} size={52} />
              <span className="text-[14px] text-ink mt-1">{c.label}</span>
              <span className="text-[11px] text-r-gray-soft leading-tight">{c.desc}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setPhase('store')} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">이걸로 할게요</button>
      </div>
    )

  if (phase === 'store') {
    const putAway = () => {
      setClosing(true)
      setTimeout(() => setStored(true), 1450) // 다이얼이 돌아가 잠긴 뒤 전환
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
                <VaultIcon type={vaultImage} size={110} open={!closing} sealing={closing} />
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

// ── 보관함 아이콘 — 금속/목재 질감 + 두께로 실물처럼 ──
function VaultIcon({ type, size = 48, open = false, sealing = false }) {
  const uid = useId().replace(/:/g, '')
  const g = (n) => `${uid}-${n}`
  const common = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }

  if (type === 'safe') {
    const bolts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 - 90) * (Math.PI / 180)
      return [32 + 12.6 * Math.cos(a), 33 + 12.6 * Math.sin(a)]
    })
    const spokes = [0, 60, 120]
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={g('steel')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eef1f4" /><stop offset="45%" stopColor="#b7bec6" /><stop offset="100%" stopColor="#79818b" />
          </linearGradient>
          <linearGradient id={g('steel2')} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#c9d0d7" /><stop offset="100%" stopColor="#6a717b" />
          </linearGradient>
          <radialGradient id={g('door')} cx="40%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#e3e8ed" /><stop offset="58%" stopColor="#a9b1ba" /><stop offset="100%" stopColor="#727a84" />
          </radialGradient>
          <radialGradient id={g('bolt')} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#f4f6f8" /><stop offset="55%" stopColor="#aeb6bf" /><stop offset="100%" stopColor="#656d77" />
          </radialGradient>
        </defs>
        {/* 바닥 그림자(무게감) */}
        <ellipse cx="32" cy="58" rx="24" ry="3.4" fill="#5c636c" opacity="0.25" />
        {/* 힌지(좌측, 두꺼움) */}
        <rect x="3" y="19" width="6" height="9" rx="2" fill={`url(#${g('steel2')})`} stroke="#565d66" strokeWidth="1" />
        <rect x="3" y="37" width="6" height="9" rx="2" fill={`url(#${g('steel2')})`} stroke="#565d66" strokeWidth="1" />
        {/* 두꺼운 몸체(1중) */}
        <rect x="7" y="7" width="50" height="50" rx="7" fill={`url(#${g('steel')})`} stroke="#565d66" strokeWidth="1.5" />
        {/* 2중 벽 */}
        <rect x="11" y="11" width="42" height="42" rx="5.5" fill="none" stroke="#5c636c" strokeWidth="1.4" opacity="0.55" />
        {/* 3중 문틀(깊게 파인 리세스) */}
        <rect x="13.5" y="13.5" width="37" height="37" rx="4.5" fill={`url(#${g('steel2')})`} stroke="#565d66" strokeWidth="1.2" />
        <rect x="13.5" y="13.5" width="37" height="37" rx="4.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.28" />
        {/* 코너 리벳 */}
        {[[18, 18], [46, 18], [18, 48], [46, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.3" fill={`url(#${g('bolt')})`} />)}
        {/* 원형 문 */}
        <circle cx="32" cy="33" r="15.5" fill={`url(#${g('door')})`} stroke="#565d66" strokeWidth="1.5" />
        <circle cx="32" cy="33" r="15.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
        {/* 문 둘레 볼트 */}
        {bolts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill={`url(#${g('bolt')})`} />)}
        {/* 다이얼 휠(스포크 핸들) — 담을 때 돌아가며 잠김 */}
        <g className={sealing ? 'animate-dial-spin' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {spokes.map((deg) => (
            <line key={deg} x1={32 - 11 * Math.cos((deg * Math.PI) / 180)} y1={33 - 11 * Math.sin((deg * Math.PI) / 180)}
              x2={32 + 11 * Math.cos((deg * Math.PI) / 180)} y2={33 + 11 * Math.sin((deg * Math.PI) / 180)}
              stroke="#6a717b" strokeWidth="3.4" strokeLinecap="round" />
          ))}
          {spokes.flatMap((deg) => [1, -1].map((s, j) => (
            <circle key={deg + '' + j} cx={32 + s * 11 * Math.cos((deg * Math.PI) / 180)} cy={33 + s * 11 * Math.sin((deg * Math.PI) / 180)} r="2.1" fill={`url(#${g('bolt')})`} />
          )))}
          <circle cx="32" cy="33" r="5.4" fill={`url(#${g('steel')})`} stroke="#565d66" strokeWidth="1.2" />
          <circle cx="32" cy="33" r="1.8" fill="#565d66" />
        </g>
        {/* 손잡이 레버 */}
        <rect x="47" y="30.5" width="9" height="5" rx="2.5" fill={`url(#${g('steel2')})`} stroke="#565d66" strokeWidth="1" />
        {/* 상단 광택 */}
        <path d="M 12 12 Q 30 8, 50 12" stroke="#ffffff" strokeWidth="2" opacity="0.4" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  if (type === 'box')
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={g('wood')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c79a68" /><stop offset="100%" stopColor="#8a6239" />
          </linearGradient>
          <linearGradient id={g('lid')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d8ab77" /><stop offset="100%" stopColor="#b07f4d" />
          </linearGradient>
          <linearGradient id={g('band')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9aa1a9" /><stop offset="100%" stopColor="#5c636c" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="57" rx="23" ry="3" fill="#5c463020" />
        {/* 몸체 */}
        <rect x="10" y="26" width="44" height="28" rx="3" fill={`url(#${g('wood')})`} stroke="#6e4e2c" strokeWidth="1.5" />
        {/* 뚜껑(둥근 목재) */}
        <path d="M 10 28 Q 10 14, 32 14 Q 54 14, 54 28 Z" fill={`url(#${g('lid')})`} stroke="#6e4e2c" strokeWidth="1.5" />
        <path d="M 10 28 L 54 28" stroke="#6e4e2c" strokeWidth="1.4" opacity="0.6" />
        {/* 금속 밴드 2줄 */}
        <rect x="18" y="14" width="5" height="40" fill={`url(#${g('band')})`} opacity="0.9" />
        <rect x="41" y="14" width="5" height="40" fill={`url(#${g('band')})`} opacity="0.9" />
        {/* 자물쇠 */}
        {!open && <>
          <rect x="27" y="34" width="10" height="9" rx="2" fill={`url(#${g('band')})`} stroke="#4c525a" strokeWidth="1" />
          <circle cx="32" cy="37.5" r="1.5" fill="#2f343b" />
        </>}
        {/* 나뭇결 */}
        <path d="M 15 40 h 34 M 15 47 h 34" stroke="#6e4e2c" strokeWidth="1" opacity="0.3" />
      </svg>
    )

  if (type === 'drawer')
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={g('cab')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#caa06e" /><stop offset="100%" stopColor="#8e6640" />
          </linearGradient>
          <linearGradient id={g('front')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcb684" /><stop offset="100%" stopColor="#b0824f" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55" rx="21" ry="2.8" fill="#5c463020" />
        {/* 캐비닛(측면 두께) */}
        <rect x="10" y="12" width="44" height="40" rx="4" fill={`url(#${g('cab')})`} stroke="#6e4e2c" strokeWidth="1.5" />
        <rect x="10" y="12" width="44" height="40" rx="4" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.15" />
        {/* 윗칸(닫힘) */}
        <rect x="15" y="16" width="34" height="14" rx="2.5" fill={`url(#${g('front')})`} stroke="#7c5836" strokeWidth="1.2" />
        <rect x="27" y="21" width="10" height="3.2" rx="1.6" fill="#6a717b" />
        {/* 아랫칸(살짝 빠짐 = 깊이) */}
        <g style={{ transform: open ? 'translateY(5px)' : 'translateY(0)', transition: 'transform .5s' }}>
          <rect x="15" y="33" width="34" height="15" rx="2.5" fill={`url(#${g('front')})`} stroke="#7c5836" strokeWidth="1.4" />
          <rect x="24" y="38.5" width="16" height="4" rx="2" fill={`url(#${g('cab')})`} stroke="#5c636c" strokeWidth="1.2" />
        </g>
      </svg>
    )

  // jar — 두꺼운 유리 + 금속 뚜껑
  return (
    <svg {...common}>
      <defs>
        <linearGradient id={g('glass')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef5f7" stopOpacity="0.95" /><stop offset="55%" stopColor="#cfe0e4" stopOpacity="0.85" /><stop offset="100%" stopColor="#a9c2c8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={g('cap')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9c0c8" /><stop offset="100%" stopColor="#727a84" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="57" rx="17" ry="2.6" fill="#5c636c" opacity="0.18" />
      {/* 유리 몸체(두꺼운 림) */}
      <path d="M 19 24 Q 19 21, 23 21 L 41 21 Q 45 21, 45 24 L 45 49 Q 45 55, 38 55 L 26 55 Q 19 55, 19 49 Z" fill={`url(#${g('glass')})`} stroke="#8fa6ac" strokeWidth="2" />
      <path d="M 19 24 Q 19 21, 23 21 L 41 21 Q 45 21, 45 24" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
      {/* 금속 나사 뚜껑(두께) */}
      <rect x="20" y="11" width="24" height="11" rx="3" fill={`url(#${g('cap')})`} stroke="#565d66" strokeWidth="1.3" />
      <path d="M 22 14 h 20 M 22 18 h 20" stroke="#565d66" strokeWidth="0.9" opacity="0.5" />
      {/* 반사 하이라이트 */}
      <path d="M 24 28 Q 22 38, 25 48" stroke="#ffffff" strokeWidth="2.4" opacity="0.55" strokeLinecap="round" fill="none" />
    </svg>
  )
}
