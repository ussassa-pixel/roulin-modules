// 모듈 메타데이터 레지스트리
// safetyLevel: 'general' | 'caution' | 'crisis-bridge'
//   general      — 대부분의 상태에서 안전
//   caution      — 역효과 가능성 있는 상황 있음 (아래 contraindications 참고)
//   crisis-bridge— 충동·위기 상황용 안정화 모듈; 추천 시 caution 모듈 제외
// NOTE: contraindications·safetyLevel 최종 확정은 임상 판단(SW) 필요
export const MODULE_META = {
  mood: {
    targetStates: ['confusion', 'overwhelm', 'numbness'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: false,
  },
  breathing: {
    targetStates: ['anxiety', 'stress', 'panic', 'tension'],
    safetyLevel: 'general',
    durationSec: 180,
    hasEndRating: true,
  },
  balloon: {
    targetStates: ['anxiety', 'stress', 'panic'],
    safetyLevel: 'general',
    durationSec: 180,
    hasEndRating: true,
  },
  finger: {
    targetStates: ['anxiety', 'stress', 'panic'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: true,
  },
  present: {
    targetStates: ['anxiety', 'rumination', 'dissociation'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: true,
  },
  grounding: {
    targetStates: ['dissociation', 'panic', 'overwhelm', 'anxiety'],
    safetyLevel: 'general',
    durationSec: 300,
    hasEndRating: true,
  },
  compassion: {
    targetStates: ['self-criticism', 'sadness', 'shame'],
    safetyLevel: 'general',
    durationSec: 240,
    hasEndRating: false,
  },
  sound: {
    targetStates: ['stress', 'overwhelm', 'numbness', 'restlessness'],
    safetyLevel: 'general',
    durationSec: 180,
    hasEndRating: false,
  },
  sand: {
    targetStates: ['stress', 'tension', 'overwhelm', 'restlessness'],
    safetyLevel: 'general',
    durationSec: 180,
    hasEndRating: false,
  },
  bubble: {
    targetStates: ['tension', 'restlessness', 'frustration', 'anger'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: false,
  },
  leaf: {
    targetStates: ['rumination', 'intrusive-thoughts', 'anxiety'],
    safetyLevel: 'general',
    durationSec: 180,
    hasEndRating: false,
  },
  drinking: {
    targetStates: ['stress', 'overwhelm', 'numbness'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: true,
  },
  butterfly: {
    targetStates: ['anxiety', 'distress', 'sadness', 'panic'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: true,
    contraindications: ['acute-trauma-reprocessing'],
  },
  worry: {
    targetStates: ['rumination', 'overwhelm', 'anxiety', 'intrusive-thoughts'],
    safetyLevel: 'caution',
    durationSec: 300,
    hasEndRating: false,
    contraindications: ['crisis', 'acute-grief'],
  },
  goodthings: {
    targetStates: ['sadness', 'burnout', 'negativity-bias'],
    safetyLevel: 'caution',
    durationSec: 240,
    hasEndRating: false,
    contraindications: ['crisis', 'acute-grief'],
  },
  stop: {
    targetStates: ['impulse', 'anger', 'urge', 'distress'],
    safetyLevel: 'crisis-bridge',
    durationSec: 60,
    hasEndRating: false,
  },
  braindump: {
    targetStates: ['overwhelm', 'rumination', 'mental-clutter'],
    safetyLevel: 'general',
    durationSec: 600,
    hasEndRating: true,
  },
  worrytree: {
    targetStates: ['anxiety', 'rumination', 'mental-clutter', 'overwhelm'],
    safetyLevel: 'general',
    durationSec: 480,
    hasEndRating: true,
  },
  balance: {
    targetStates: ['indecision', 'ambivalence', 'mental-clutter'],
    safetyLevel: 'general',
    durationSec: 600,
    hasEndRating: true,
  },
  woop: {
    targetStates: ['indecision', 'motivation', 'procrastination'],
    safetyLevel: 'general',
    durationSec: 600,
    hasEndRating: true,
  },
  intention: {
    targetStates: ['procrastination', 'avoidance'],
    safetyLevel: 'general',
    durationSec: 300,
    hasEndRating: true,
  },
  smalleststep: {
    targetStates: ['overwhelm', 'procrastination', 'paralysis', 'avoidance'],
    safetyLevel: 'general',
    durationSec: 300,
    hasEndRating: true,
  },
  comfortdraw: {
    targetStates: ['sadness', 'loneliness', 'burnout'],
    safetyLevel: 'general',
    durationSec: 60,
    hasEndRating: false,
  },
  fortune: {
    targetStates: ['morning-start', 'low-mood', 'flatness'],
    safetyLevel: 'general',
    durationSec: 45,
    hasEndRating: false,
  },
  capsule: {
    targetStates: ['low-mood', 'flatness', 'burnout'],
    safetyLevel: 'general',
    durationSec: 60,
    hasEndRating: false,
  },
  music: {
    targetStates: ['low-mood', 'flatness', 'restlessness'],
    safetyLevel: 'general',
    durationSec: 120,
    hasEndRating: false,
  },
  bodywake: {
    targetStates: ['lethargy', 'low-mood', 'numbness'],
    safetyLevel: 'general',
    durationSec: 100,
    hasEndRating: false,
  },
}

// 완료한 모듈을 바탕으로 1~2개 추천 반환
// allModules: App.jsx의 MODULES 배열 (id, title, tag, desc 포함)
export function getRecommendations(completedId, allModules) {
  const completed = MODULE_META[completedId]
  if (!completed) return allModules.filter(m => m.id !== completedId).slice(0, 2)

  const isCrisis = completed.safetyLevel === 'crisis-bridge'

  const scored = allModules
    .filter(m => m.id !== completedId)
    .filter(m => {
      const meta = MODULE_META[m.id]
      if (!meta) return false
      // 안전 게이트: crisis-bridge 컨텍스트에서 caution 모듈 제외
      if (isCrisis && meta.safetyLevel !== 'general') return false
      return true
    })
    .map(m => {
      const meta = MODULE_META[m.id]
      const overlap = meta.targetStates.filter(s => completed.targetStates.includes(s)).length
      return { ...m, _overlap: overlap }
    })
    .sort((a, b) => b._overlap - a._overlap)

  // 태그 다양성을 살려 최대 2개 선택
  const selected = []
  const usedTags = new Set()
  for (const m of scored) {
    if (selected.length >= 2) break
    if (!usedTags.has(m.tag)) {
      selected.push(m)
      usedTags.add(m.tag)
    }
  }
  // 다양성 조건 미달 시 점수 상위로 보충
  for (const m of scored) {
    if (selected.length >= 2) break
    if (!selected.find(s => s.id === m.id)) selected.push(m)
  }

  return selected.slice(0, 2)
}
