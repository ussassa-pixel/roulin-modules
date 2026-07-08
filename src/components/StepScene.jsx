// 텍스트 폼 단계의 단조로움을 줄이는 공통 헤더:
//   진행 점 · 단계 상징 아이콘(은은한 글로우) · 라벨 · 질문 · 힌트
// children 에 입력/버튼을 그대로 넣으면 됨(포커스 유지 위해 인라인 렌더).
export default function StepScene({ total, index, accent = '#E0A33E', icon, label, question, hint, children }) {
  return (
    <div className="max-w-md w-full animate-fade-in">
      {/* 진행 점 */}
      <div className="flex justify-center items-center gap-1.5 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all"
            style={{
              height: 6,
              width: i === index ? 22 : 6,
              background: i < index ? accent : i === index ? accent : '#E7E2D5',
              opacity: i < index ? 0.45 : 1,
            }}
          />
        ))}
      </div>

      {/* 아이콘 + 글로우 */}
      <div className="relative flex justify-center mb-3" style={{ height: 64 }}>
        <div className="absolute rounded-full blur-2xl" style={{ width: 82, height: 82, background: accent, opacity: 0.15 }} />
        <div className="relative z-10 animate-fade-up"><StepIcon name={icon} accent={accent} /></div>
      </div>
      {label && <p className="text-center text-[13px] mb-4" style={{ color: accent, fontWeight: 500 }}>{label}</p>}

      <p className="text-center text-navy text-lg font-light mb-2 leading-relaxed whitespace-pre-line">{question}</p>
      {hint && <p className="text-center text-r-gray-soft text-xs mb-7">{hint}</p>}
      {children}
    </div>
  )
}

// ── 단계 상징 아이콘 세트 (라인 아트, 단계 색으로) ──
export function StepIcon({ name, accent = '#33415a', size = 56 }) {
  const c = { width: size, height: size, viewBox: '0 0 56 56', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  const P = { stroke: accent, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  switch (name) {
    case 'person':
      return <svg {...c}><circle cx="28" cy="20" r="8" {...P} /><path d="M 14 44 Q 14 30, 28 30 Q 42 30, 42 44" {...P} /></svg>
    case 'people': // 두 사람(관계)
      return <svg {...c}><circle cx="21" cy="21" r="7" {...P} /><circle cx="37" cy="24" r="6" {...P} /><path d="M 10 44 Q 10 32, 21 32 Q 29 32, 31 39" {...P} /><path d="M 31 44 Q 32 34, 37 34 Q 46 34, 46 44" {...P} opacity="0.6" /></svg>
    case 'eye': // 조망(그 사람 자리)
      return <svg {...c}><path d="M 8 28 Q 28 12, 48 28 Q 28 44, 8 28 Z" {...P} /><circle cx="28" cy="28" r="7" {...P} /><circle cx="28" cy="28" r="2.4" fill={accent} /></svg>
    case 'heart':
      return <svg {...c}><path d="M 28 44 C 12 32, 12 18, 22 18 C 27 18, 28 24, 28 24 C 28 24, 29 18, 34 18 C 44 18, 44 32, 28 44 Z" {...P} /></svg>
    case 'scene': // 상황(한 장면)
      return <svg {...c}><rect x="10" y="14" width="36" height="28" rx="4" {...P} /><circle cx="20" cy="24" r="3.5" {...P} /><path d="M 12 40 L 24 30 L 34 38 L 40 33 L 46 39" {...P} /></svg>
    case 'target': // 원하는 것
      return <svg {...c}><circle cx="28" cy="28" r="17" {...P} /><circle cx="28" cy="28" r="9" {...P} /><circle cx="28" cy="28" r="2.6" fill={accent} /></svg>
    case 'action': // 행동
      return <svg {...c}><circle cx="28" cy="28" r="17" {...P} /><path d="M 20 28 l 5 6 l 11 -12" {...P} /></svg>
    case 'clock':
      return <svg {...c}><circle cx="28" cy="28" r="17" {...P} /><path d="M 28 19 L 28 28 L 35 32" {...P} /></svg>
    case 'pin':
      return <svg {...c}><path d="M 28 46 C 18 34, 15 28, 15 22 A 13 13 0 0 1 41 22 C 41 28, 38 34, 28 46 Z" {...P} /><circle cx="28" cy="22" r="4.5" {...P} /></svg>
    case 'link': // if-then 연결
      return <svg {...c}><rect x="10" y="22" width="20" height="12" rx="6" {...P} /><rect x="26" y="22" width="20" height="12" rx="6" {...P} /></svg>
    case 'mountain': // 막막함
      return <svg {...c}><path d="M 8 42 L 22 20 L 30 32 L 36 24 L 48 42 Z" {...P} /><path d="M 19 25 l 3 -2 l 3 3" {...P} opacity="0.5" /></svg>
    case 'sprout': // 아주 작은 시작
      return <svg {...c}><path d="M 28 44 L 28 26" {...P} /><path d="M 28 30 Q 18 30, 16 20 Q 26 20, 28 30" {...P} /><path d="M 28 27 Q 38 27, 40 18 Q 30 18, 28 27" {...P} /></svg>
    case 'foot': // 한 걸음
      return <svg {...c}><ellipse cx="26" cy="32" rx="10" ry="14" {...P} /><circle cx="38" cy="20" r="3.5" {...P} /><circle cx="42" cy="27" r="2.6" {...P} /></svg>
    case 'star':
      return <svg {...c}><path d="M 28 12 L 33 23 L 45 24 L 36 32 L 39 44 L 28 37 L 17 44 L 20 32 L 11 24 L 23 23 Z" {...P} /></svg>
    case 'tomorrow': // 내일로(해 뜨는 지평선 + 화살표)
      return <svg {...c}><path d="M 10 38 L 46 38" {...P} /><path d="M 18 38 A 10 10 0 0 1 38 38" {...P} /><path d="M 28 12 L 28 24 M 24 20 l 4 4 l 4 -4" {...P} /></svg>
    case 'moon':
      return <svg {...c}><path d="M 38 30 A 14 14 0 1 1 24 16 A 11 11 0 0 0 38 30 Z" {...P} /></svg>
    case 'root': // 이유(뿌리)
      return <svg {...c}><path d="M 28 14 L 28 30" {...P} /><path d="M 28 30 Q 20 34, 16 44 M 28 30 Q 36 34, 40 44 M 28 30 L 28 44" {...P} opacity="0.85" /><circle cx="28" cy="14" r="4" {...P} /></svg>
    default:
      return <svg {...c}><circle cx="28" cy="28" r="16" {...P} /></svg>
  }
}
