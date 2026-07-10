import { useState } from 'react'
import { getCareLog, clearCareLog } from '../lib/careLog'
import { SECTIONS, sectionOf } from '../content/sections'

// 카테고리(런처 섹션)별 색 — 태그별 파스텔은 22종이 서로 뭉개져 구분이 안 됐다.
// careLog 항목의 id로 섹션을 찾으므로 과거 기록도 그대로 색이 입혀진다.
const FALLBACK = { base: '#d9cba8', edge: '#a8a294' } // 섹션을 못 찾는 옛/기타 항목
const gem = (id) => (sectionOf(id) || { color: FALLBACK }).color

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
  const usedKeys = new Set(shown.map((e) => sectionOf(e.id)?.key).filter(Boolean))

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
            const c = gem(e.id)
            return (
              <button
                key={idx}
                onClick={() => setSel(sel && sel._i === idx ? null : { ...e, _i: idx })}
                aria-label={`${e.title} · ${relTime(e.at)}`}
                className={`rounded-full transition ${isLast ? 'animate-drop-stack' : ''}`}
                style={{
                  width: 15, height: 15,
                  background: `radial-gradient(circle at 34% 30%, #ffffff 0%, ${c.base} 45%, ${c.edge} 100%)`,
                  boxShadow: sel && sel._i === idx
                    ? `0 0 0 2px #fff, 0 0 0 3.5px ${c.edge}`
                    : '0 1px 3px rgba(120,100,70,0.25)',
                }}
              />
            )
          })}
        </div>

        {/* 색 범례 — 지금 보이는 자국의 카테고리만 */}
        {usedKeys.size > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1">
            {SECTIONS.filter((s) => usedKeys.has(s.key)).map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-[10.5px] text-r-gray-soft">
                <span
                  className="rounded-full inline-block"
                  style={{
                    width: 8, height: 8,
                    background: `radial-gradient(circle at 34% 30%, #ffffff 0%, ${s.color.base} 45%, ${s.color.edge} 100%)`,
                  }}
                />
                {s.title}
              </span>
            ))}
          </div>
        )}

        {sel ? (
          <p className="mt-3 text-[12.5px] text-navy/80">
            <span style={{ fontWeight: 600 }}>{sel.title}</span>
            <span className="text-r-gray-soft"> · {relTime(sel.at)}</span>
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-r-gray-soft">여기 머문 시간이 하나씩 쌓입니다. 눌러 보면 무엇이었는지 보여요.</p>
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
