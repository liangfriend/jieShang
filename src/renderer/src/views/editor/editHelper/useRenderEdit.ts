import { MusicScoreTypeEnum } from '@deciphony/renderer'
import type { MusicScore } from '@deciphony/renderer'
import type { Ref } from 'vue'
import { ref } from 'vue'
import {
  useNumberNotationRenderEdit,
  type MusicScoreComponentExpose as NumberMusicScoreComponentExpose
} from './numberNotation/useRenderEdit'
import {
  useStandardStaffRenderEdit,
  type MusicScoreComponentExpose as StaffMusicScoreComponentExpose
} from './standardStaff/useRenderEdit'
import {
  useTabRenderEdit,
  type MusicScoreComponentExpose as TabMusicScoreComponentExpose
} from './tab/useRenderEdit'
import {
  useDrumRenderEdit,
  type MusicScoreComponentExpose as DrumMusicScoreComponentExpose
} from './drumNotation/useRenderEdit'
import { DEFAULT_ADD_TAB_STATE } from './tab/renderEditTabAddState'
import { DEFAULT_ADD_DRUM_STATE, type AddDrumState } from './drumNotation/renderEditDrumAddState'
import { useScoreEditContextMenu } from './useScoreEditContextMenu'
import { isTabNotationType } from '@renderer/utils/isTabNotation'

export type MusicScoreComponentExpose =
  | StaffMusicScoreComponentExpose
  | NumberMusicScoreComponentExpose
  | TabMusicScoreComponentExpose
  | DrumMusicScoreComponentExpose

function unusedTabState() {
  return ref({ ...DEFAULT_ADD_TAB_STATE })
}

function unusedDrumState() {
  return ref<AddDrumState>({ ...DEFAULT_ADD_DRUM_STATE })
}

/** 按曲谱类型分发到五线谱、简谱、吉他/尤克里里或鼓谱编辑控制器，并挂载右键菜单 */
export function useRenderEdit(
  scoreData: Ref<MusicScore>,
  options?: { musicScoreRef?: Ref<MusicScoreComponentExpose | null> }
) {
  const type = scoreData.value.type

  const api = isTabNotationType(type)
    ? Object.assign(useTabRenderEdit(scoreData, options), { addDrumState: unusedDrumState() })
    : type === MusicScoreTypeEnum.DrumNotation
      ? Object.assign(useDrumRenderEdit(scoreData, options), {
          addTabState: unusedTabState(),
          stringCount: 0
        })
      : type === MusicScoreTypeEnum.NumberNotation
        ? Object.assign(useNumberNotationRenderEdit(scoreData, options), {
            addTabState: unusedTabState(),
            addDrumState: unusedDrumState()
          })
        : Object.assign(useStandardStaffRenderEdit(scoreData, options), {
            addTabState: unusedTabState(),
            addDrumState: unusedDrumState()
          })

  const withStates =
    'addTabState' in api
      ? api
      : Object.assign(api, { addTabState: unusedTabState() })

  const contextMenu = useScoreEditContextMenu(scoreData, {
    selectedItem: withStates.selectedItem,
    clearSelection: withStates.clearSelection
  })

  return {
    ...withStates,
    ...contextMenu
  }
}
