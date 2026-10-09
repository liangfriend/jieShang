/**
 * 复谱表整列小节增删：同一复谱表内每个单谱表在相同列位置同步增删，
 * 保证各声部小节数量一致。底层仍调用 dr-edit 的单谱表 API。
 */
import type { Measure, MusicScore, SingleStaff } from '@deciphony/renderer'
import { addMeasure, deleteMeasure, insertMeasure } from '@deciphony/extensions/dr-edit'
import { locateMeasure, locateSingleStaff } from '@deciphony/extensions/dr-edit/score-builder'

/** 在选中小节前/后，给复谱表每一行单谱表插入空小节；返回当前声部新小节 */
export function insertMeasureColumn(
  musicScore: MusicScore,
  singleStaff: SingleStaff,
  anchor: Measure,
  position: 'before' | 'after'
): Measure {
  const located = locateMeasure(musicScore, anchor)
  const measureIndex = located?.measureIndex ?? singleStaff.measures.indexOf(anchor)
  if (measureIndex < 0) throw new Error('小节不属于该单谱表')

  const at = position === 'before' ? measureIndex : measureIndex + 1
  const notationType = musicScore.type
  const staves = located?.grandStaff.staves?.length ? located.grandStaff.staves : [singleStaff]

  let primary: Measure | undefined
  for (const staff of staves) {
    const inserted =
      at < staff.measures.length
        ? insertMeasure(staff, staff.measures[at]!, 'before', { notationType })
        : addMeasure(staff, { notationType })
    if (staff === singleStaff) primary = inserted
  }
  if (!primary) throw new Error('未能在当前单谱表插入小节')
  return primary
}

/** 在复谱表每个单谱表末尾追加一个空小节；返回当前声部新小节 */
export function addMeasureColumn(musicScore: MusicScore, singleStaff: SingleStaff): Measure {
  const located = locateSingleStaff(musicScore, singleStaff)
  const staves = located?.grandStaff.staves?.length ? located.grandStaff.staves : [singleStaff]
  const notationType = musicScore.type

  let primary: Measure | undefined
  for (const staff of staves) {
    const inserted = addMeasure(staff, { notationType })
    if (staff === singleStaff) primary = inserted
  }
  if (!primary) throw new Error('未能在当前单谱表追加小节')
  return primary
}

/**
 * 删除复谱表同一列的小节。
 * purgeMeasure：删前清理曲谱级附属符号（连音线、volta 等）。
 * 任一参与删除的单谱表只剩 1 小节时拒绝。
 */
export function deleteMeasureColumn(
  musicScore: MusicScore,
  measure: Measure,
  purgeMeasure: (measure: Measure) => void
): boolean {
  const located = locateMeasure(musicScore, measure)
  if (!located) return false

  const { grandStaff, measureIndex } = located
  const targets = grandStaff.staves
    .map((staff) => ({ staff, measure: staff.measures[measureIndex] }))
    .filter((row): row is { staff: SingleStaff; measure: Measure } => row.measure != null)

  if (!targets.length) return false
  if (targets.some((row) => row.staff.measures.length <= 1)) return false

  for (const row of targets) {
    purgeMeasure(row.measure)
    deleteMeasure(row.staff, row.measure)
  }
  return true
}
