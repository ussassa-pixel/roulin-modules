import { useState } from 'react'
import { getCareLog, clearCareLog } from '../lib/careLog'

// 태그별 부드러운 색 — 컬렉션이 단조롭지 않게
const TAG_COLOR = {
  '살피기': '#fbbf24', '호흡': '#7dd3fc', '현재': '#fcd34d', '그라운딩': '#93c5fd',
  '다독임': '#fda4af', '감각': '#86efac', '내려놓기': '#a5b4fc', '안정': '#c4b5fd',
  '돌아보기': '#f9a8d4', '멈춤': '#fca5a5', '비우기': '#93c5fd', '정리': '#a7f3d0',
  '결정': '#fdba74', '계획': '#c4b5fd', '실행': '#fca5a5', '한 걸음': '#6ee7b7',
  '관계': '#f0abfc', '음미': '#fcd34d', '가치': '#7dd3fc', '마무리': '#a5b4fc',
  '이완': '#86efac', '보관': '#e0a33e',
}
const gemColor = (tag) => TAG_COLOR[tag] || '#E0A33E'

function relTime(at) {
  const diff = Date.now() - at
  const day = 86400000
  const d0 = new Date(at); d0.setHours(0, 0, 0, 0)
  const t0 = new Date(); t0.setHours(0, 0, 0, 0)
  const days = Math.round((t0 - d0) / day)
  if (diff < 60000) return '방금'
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}달 전`
}

export default function CareTrail() {
  const [log, setLog] = useState(getCareLog)
  const [sel, setSel] = useState(null)

  if (!log.length) return null

  // 너무 길어지지 않게 최근 60개만 보여준다(전체 수는 따로 안내)
  const shown = log.slice(-60)
  const last = log.length - 1

  return (
    <div className="max-w-md mx-auto px-6 pb-2">
      <div className="rounded-2xl bg-white/55 border border-line px-5 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-r-gray text-[13px]">머문 자국</p>
          <p className="text-r-gray-soft text-[11px]">{log.length}번</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {shown.map((e, i) => {
            const idx = log.length - shown.length + i
            const isLast = idx === last
            return (
              <button
                key={idx}
                onClick={() => setSel(sel && sel._i === idx ? null : { ...e, _i: idx })}
                aria-label={`${e.title} · ${relTime(e.at)}`}
                className={`rounded-full transition ${isLast ? 'animate-drop-stack' : ''}`}
                style={{
                  width: 15, height: 15,
                  background: `radial-gradient(circle at 34% 30%, #ffffff 0%, ${gemColor(e.tag)} 60%, ${gemColor(e.tag)} 100%)`,
                  boxShadow: sel && sel._i === idx
                    ? `0 0 0 2px #fff, 0 0 0 3.5px ${gemColor(e.tag)}`
                    : '0 1px 3px rgba(120,100,70,0.25)',
                  opacity: 0.92,
                }}
              />
            )
          })}
        </div>

        {sel ? (
          <p className="mt-4 text-[12.5px] text-navy/80">
            <span style={{ fontWeight: 600 }}>{sel.title}</span>
            <span className="text-r-gray-soft"> · {relTime(sel.at)}</span>
          </p>
        ) : (
          <p className="mt-4 text-[11px] text-r-gray-soft">여기 머문 시간이 하나씩 쌓입니다. 눌러 보면 무엇이었는지 보여요.</p>
        )}

        <button
          onClick={() => { clearCareLog(); setLog([]); setSel(null) }}
          className="mt-3 text-[11px] text-r-gray-soft hover:text-r-gray transition tracking-wide"
        >
          기록 지우기
        </button>
      </div>
    </div>
  )
}
