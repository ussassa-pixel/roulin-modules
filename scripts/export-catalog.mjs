// 백엔드(octos-be)용 모듈 카탈로그 스냅샷 생성 — 단일 소스는 registry.js.
// 룰랭 서비스가 대화 종료 후 LLM으로 모듈 1개를 고를 때 allowlist·안전 검증에 쓴다.
// 실행: node scripts/export-catalog.mjs  → care-module-catalog.json (레포 루트, 커밋)
// registry가 바뀌면 재실행해서 octos-be의 사본(apps/roulin_agent/care_module_catalog.json)도 갱신할 것.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { MODULES } from '../src/recommendation/registry.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const catalog = MODULES.map((m) => ({
  id: m.id,
  name: m.displayName,
  type: m.type,
  need: m.need,
  target_states: m.targetStates,
  safety_level: m.safetyLevel, // 'general' | 'caution' | 'crisis-bridge'
  duration_sec: m.durationSec,
}))

const out = path.join(ROOT, 'care-module-catalog.json')
writeFileSync(out, JSON.stringify({ generated_from: 'src/recommendation/registry.js', modules: catalog }, null, 2) + '\n')
console.log(`${catalog.length}개 모듈 → ${out}`)
