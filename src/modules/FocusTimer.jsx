import { useState, useEffect, useRef } from 'react'
import ModuleFrame from '../components/ModuleFrame'
import { useSpeech } from '../context/SpeechContext'

// 몰입 타이머 '자라는 것' — '집중이 안 될 때' 코너.
// 시간을 정해(타임박싱) 집중하는 동안 씨앗→줄기→잎→꽃이 자란다.
// 끝나면 벨 + 정원에 한 송이. '이어하기'로 옆에 또 한 송이가 피어 꽃밭이 풍성해진다.
// 못 끝내도 벌칙·죄책감 없음. 벨은 명상앱 transition-bell 재사용.
const GARDEN_KEY = 'roulin_garden'
const DURATIONS = [3, 5, 10, 25]
const mix = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t))
const MORNING = [231, 238, 244]
const WARM = [251, 232, 208]
const clamp = (v) => Math.max(0, Math.min(1, v))

const FLOWER_COLORS = ['#f4a3c0', '#f6a35b', '#f7cf5b', '#b79df8', '#f47a7a', '#8ec9f2', '#ff9ec4', '#9ad98a', '#f7f2ea']
const CENTERS = ['#f6bd4e', '#fff0bf', '#e8905a', '#d98a3a']
const pick = (a) => a[Math.floor(Math.random() * a.length)]
function randSpec() {
  const pointed = Math.random() < 0.45
  return {
    color: pick(FLOWER_COLORS),
    center: pick(CENTERS),
    petals: pick([5, 6, 8]),
    petalRx: pointed ? 7 + Math.random() * 2 : 10 + Math.random() * 3,
    petalRy: pointed ? 18 + Math.random() * 5 : 13 + Math.random() * 3,
    size: 1.05 + Math.random() * 0.5,   // 전체적으로 크게
    stemH: 92 + Math.random() * 30,
    leaf: Math.random() < 0.85,
  }
}
const INTRO_SPEC = { color: '#f4a3c0', center: '#f6bd4e', petals: 6, petalRx: 11, petalRy: 15, size: 1.2, stemH: 100, leaf: true }

const loadGarden = () => {
  try { const a = JSON.parse(localStorage.getItem(GARDEN_KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}

export default function FocusTimer({ onExit }) {
  const [phase, setPhase] = useState('intro')
  const [remaining, setRemaining] = useState(0)
  const [paused, setPaused] = useState(false)
  const [gardenCount, setGardenCount] = useState(() => loadGarden().length)
  const [bed, setBed] = useState([])         // 이번 자리에서 완성된 꽃들
  const [curSpec, setCurSpec] = useState(null) // 지금 자라는 꽃
  const curSpecRef = useRef(null)
  const totalRef = useRef(0)
  const endAtRef = useRef(0)
  const lastMinRef = useRef(5)

  const { isMuted } = useSpeech()
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted
  const bellRef = useRef(null)
  const bell = () => {
    if (mutedRef.current) return
    try {
      if (!bellRef.current) bellRef.current = new Audio(import.meta.env.BASE_URL + 'transition-bell.mp3')
      bellRef.current.currentTime = 0; bellRef.current.volume = 0.7
      bellRef.current.play().catch(() => {})
    } catch { /* noop */ }
  }

  const startTimer = (min) => {
    totalRef.current = min * 60
    lastMinRef.current = min
    endAtRef.current = Date.now() + min * 60 * 1000
    const spec = randSpec(); curSpecRef.current = spec; setCurSpec(spec)
    setRemaining(min * 60); setPaused(false); setPhase('running')
  }

  useEffect(() => {
    if (phase !== 'running' || paused) return
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      setRemaining(rem)
      if (rem <= 0) { clearInterval(iv); finish() }
    }, 250)
    return () => clearInterval(iv)
  }, [phase, paused]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePause = () => {
    if (paused) { endAtRef.current = Date.now() + remaining * 1000; setPaused(false) }
    else setPaused(true)
  }

  const finish = () => {
    try {
      const arr = loadGarden(); arr.push({ at: Date.now(), min: Math.round(totalRef.current / 60) })
      localStorage.setItem(GARDEN_KEY, JSON.stringify(arr.slice(-500)))
      setGardenCount(arr.length)
    } catch { /* noop */ }
    setBed((b) => [...b, curSpecRef.current]) // 완성된 꽃을 밭에 심고
    setCurSpec(null)
    bell()
    setPhase('done')
  }

  const grow = totalRef.current ? 1 - remaining / totalRef.current : 0
  const mm = String(Math.floor(remaining / 60))
  const ss = String(remaining % 60).padStart(2, '0')
  const top = mix(MORNING, WARM, grow)
  const bg = { background: `radial-gradient(ellipse at 50% 26%, rgb(${top}) 0%, #F5F3EB 68%)`, transition: 'background 1s linear' }

  // 화면별 꽃 목록
  const runningFlowers = [...bed.map((s) => ({ spec: s, grow: 1 })), ...(curSpec ? [{ spec: curSpec, grow }] : [])]
  const doneFlowers = bed.map((s) => ({ spec: s, grow: 1 }))

  if (phase === 'intro') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <p className="font-serif text-[28px] text-navy mb-3" style={{ fontWeight: 600 }}>자라는 것</p>
            <div className="w-8 h-px bg-amber/60 mx-auto mb-4" />
            <p className="text-[14px] text-r-gray font-light mb-2 leading-relaxed">
              시간을 정해 그동안만 집중해요.<br />
              집중하는 사이 한 송이가 자랍니다.
            </p>
            <p className="text-[12px] text-r-gray-soft mb-8">못 끝내도 괜찮아요. 언제든 멈출 수 있어요.</p>

            <div className="flex justify-center mb-8"><Garden flowers={[{ spec: INTRO_SPEC, grow: 0.85 }]} /></div>

            <div className="grid grid-cols-4 gap-2.5">
              {DURATIONS.map((m) => (
                <button key={m} onClick={() => startTimer(m)}
                  className="py-4 rounded-2xl bg-white text-navy border border-line hover:border-[#DCD5C4] transition" style={{ fontWeight: 600 }}>
                  {m}분
                </button>
              ))}
            </div>
            {gardenCount > 0 && <p className="text-[12px] text-r-gray-soft mt-8">지금까지 {gardenCount}송이 피웠어요 🌷</p>}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'running') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={bg}>
          <div className="flex justify-center mb-4"><Garden flowers={runningFlowers} /></div>
          <p className="font-serif text-navy tabular-nums mb-1" style={{ fontWeight: 600, fontSize: 44, letterSpacing: '0.02em' }}>{mm}:{ss}</p>
          <p className="text-[12px] text-r-gray-soft mb-10">
            {paused ? '잠시 멈춤' : '지금은 이 하나에만'}{bed.length > 0 ? `  ·  ${bed.length + 1}번째 꽃` : ''}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={togglePause} className="px-6 py-3 rounded-full bg-white/80 border border-line text-ink text-[14px] hover:border-[#DCD5C4] transition">
              {paused ? '이어서' : '잠깐 멈춤'}
            </button>
            <button onClick={() => setPhase('early')} className="px-6 py-3 rounded-full text-r-gray-soft text-[14px] hover:text-r-gray transition">끝내기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'done') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 28%, #FBE8D0 0%, #F5F3EB 70%)' }}>
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-4"><Garden flowers={doneFlowers} /></div>
            <p className="font-serif text-[23px] text-navy mb-2" style={{ fontWeight: 600 }}>
              {bed.length === 1 ? `${lastMinRef.current}분, 한 송이 폈어요` : `꽃밭에 ${bed.length}송이 폈어요`}
            </p>
            <p className="text-r-gray text-sm font-light mb-8 leading-relaxed">
              집중한 만큼 자랐어요.<br />이어서 옆에 한 송이 더 피워도 좋아요.
            </p>
            <button onClick={() => startTimer(lastMinRef.current)} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition mb-3">
              이어하기 ({lastMinRef.current}분)
            </button>
            <button onClick={onExit} className="w-full py-4 bg-white text-ink border border-line rounded-full hover:border-[#DCD5C4] transition">닫기</button>
            {gardenCount > 0 && <p className="text-[12px] text-r-gray-soft mt-6">정원에 모인 꽃 {gardenCount}송이 🌷</p>}
          </div>
        </div>
      </ModuleFrame>
    )
  }

  if (phase === 'early') {
    return (
      <ModuleFrame onExit={onExit}>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center animate-fade-up">
            <div className="flex justify-center mb-4"><Garden flowers={[...doneFlowers, ...(curSpec ? [{ spec: curSpec, grow: Math.max(0.25, grow) }] : [])]} /></div>
            <p className="font-serif text-[22px] text-navy mb-2 leading-snug" style={{ fontWeight: 600 }}>여기까지도 좋아요</p>
            <p className="text-r-gray text-sm font-light mb-12 leading-relaxed">
              잠깐이라도 머문 시간이에요.<br />다음에 이어서 키워도 돼요.
            </p>
            <button onClick={onExit} className="w-full py-4 bg-navy text-white rounded-full hover:bg-[#0c1a2b] transition">닫기</button>
          </div>
        </div>
      </ModuleFrame>
    )
  }

  return null
}

// 꽃밭 — 여러 송이를 흙 위에 나란히
function Garden({ flowers }) {
  const N = Math.max(1, flowers.length)
  const soilY = 196
  return (
    <svg width="300" height="230" viewBox="0 0 320 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="160" cy="208" rx="152" ry="16" fill="#c7a37c" />
      <ellipse cx="160" cy="203" rx="144" ry="13" fill="#a97e54" />
      {flowers.map((f, i) => (
        <PlantG key={i} idx={i} x={(320 * (i + 1)) / (N + 1)} soilY={soilY} spec={f.spec} grow={f.grow} />
      ))}
    </svg>
  )
}

function PlantG({ idx, x, soilY, spec, grow }) {
  const g = clamp(grow)
  const h = Math.min(1, g / 0.9) * spec.stemH * spec.size
  const topY = soilY - h
  const bloom = clamp((g - 0.6) / 0.4)
  const midX = x + 5 * Math.sin(g * 3)
  const seedA = g < 0.14 ? 1 - g / 0.14 : 0
  return (
    <g>
      {seedA > 0 && <ellipse cx={x} cy={soilY - 4} rx="6" ry="4" fill="#6f5030" opacity={seedA} />}
      {h > 3 && <path d={`M ${x} ${soilY} Q ${midX} ${(soilY + topY) / 2} ${x} ${topY}`} stroke="#5fae6a" strokeWidth={4 * spec.size} strokeLinecap="round" fill="none" />}
      {spec.leaf && h > 34 && <Leaf x={x} y={soilY - h * 0.5} dir={idx % 2 ? 1 : -1} s={0.9 * spec.size * clamp((g - 0.3) / 0.2)} />}
      {h > 3 && <g transform={`translate(${x} ${topY})`}><FlowerG spec={spec} bloom={bloom} /></g>}
    </g>
  )
}

function Leaf({ x, y, dir, s }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ transition: 'transform .4s ease' }}>
      <path d={`M0 0 Q ${dir * 22} -18 ${dir * 40} -4 Q ${dir * 22} 9 0 0 Z`} fill="#6fbf78" />
      <path d={`M0 0 Q ${dir * 18} -7 ${dir * 32} -3`} stroke="#4e9a5c" strokeWidth="1.2" fill="none" opacity="0.6" />
    </g>
  )
}

function FlowerG({ spec, bloom }) {
  const b = clamp(bloom)
  const angs = Array.from({ length: spec.petals }, (_, i) => (i * 360) / spec.petals)
  return (
    <g transform={`scale(${spec.size})`}>
      {b > 0 && angs.map((a) => (
        <ellipse key={a} cx="0" cy={-spec.petalRy * 0.78} rx={spec.petalRx} ry={spec.petalRy} fill={spec.color} opacity="0.95"
          transform={`rotate(${a}) scale(${b})`} style={{ transformOrigin: '0px 0px', transition: 'transform .5s ease' }} />
      ))}
      <circle r={b > 0 ? 6.5 : 5} fill={b > 0 ? spec.center : '#6fbf78'} style={{ transition: 'fill .4s ease' }} />
    </g>
  )
}
