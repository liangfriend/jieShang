import { MusicScoreTypeEnum } from 'deciphony-renderer'
import type { MusicScore } from 'deciphony-renderer'
import type { Ref } from 'vue'
import {
  useNumberNotationRenderEdit,
  type MusicScoreComponentExpose as NumberMusicScoreComponentExpose
} from './numberNotation/useRenderEdit'
import {
  useStandardStaffRenderEdit,
  type MusicScoreComponentExpose as StaffMusicScoreComponentExpose
} from './standardStaff/useRenderEdit'

export type MusicScoreComponentExpose =
  | StaffMusicScoreComponentExpose
  | NumberMusicScoreComponentExpose

/** 按曲谱类型分发到五线谱或简谱编辑控制器 */
export function useRenderEdit(
  scoreData: Ref<MusicScore>,
  options?: { musicScoreRef?: Ref<MusicScoreComponentExpose | null> }
) {
  if (scoreData.value.type === MusicScoreTypeEnum.NumberNotation) {
    return useNumberNotationRenderEdit(scoreData, options)
  }
  return useStandardStaffRenderEdit(scoreData, options)
}
