import type { MusicScore } from '@deciphony/renderer'
import { createGrandStaff } from '@deciphony/extensions/dr-edit/score-builder'
import {
  createJianpuMeasure,
  createJianpuMusicScore,
  createJianpuSingleStaff
} from './jianpuFactory'

/** 每次调用新建，避免模块缓存里残留旧小节头 */
export function buildEmptyJianpuScore(): MusicScore {
  const data = createJianpuMusicScore()
  const grandStaff1 = createGrandStaff({ withDefaultStaff: false, linkedStaff: true })
  const singleStaff = createJianpuSingleStaff()
  singleStaff.measures.push(createJianpuMeasure())
  grandStaff1.staves.push(singleStaff)
  data.grandStaffs.push(grandStaff1)
  return data
}

export default buildEmptyJianpuScore
