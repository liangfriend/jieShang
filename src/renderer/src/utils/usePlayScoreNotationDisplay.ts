import type { MusicScore } from 'deciphony-renderer'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { CUR_PLAY_SCORE_TEMP_ID, CUR_PLAY_SCORE_TRANS_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import { convertScoreNotationType } from '@renderer/utils/scoreNotationTransfer'

/**
 * 播放页曲谱类型展示：原谱始终在 curPlayScore，转换结果写入 curPlayScoreTrans。
 */
export function usePlayScoreNotationDisplay(
  musicScoreData: Ref<MusicScore>,
  displayType: Ref<MusicScoreTypeEnum>
) {
  const dataStore = useDataStore()
  const originalType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)

  function initAfterLoad(loaded: MusicScore) {
    const cachedOriginal = dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID)
    const original = cachedOriginal ?? loaded
    if (!cachedOriginal) {
      dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, JSON.parse(JSON.stringify(loaded)) as MusicScore)
    }

    originalType.value = original.type
    displayType.value = original.type
    musicScoreData.value = JSON.parse(JSON.stringify(original)) as MusicScore
    dataStore.deleteTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID)
  }

  function applyDisplayType(targetType: MusicScoreTypeEnum) {
    const original = dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID)
    if (!original) return

    displayType.value = targetType

    if (targetType === originalType.value) {
      musicScoreData.value = JSON.parse(JSON.stringify(original)) as MusicScore
      dataStore.deleteTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID)
      return
    }

    const converted = convertScoreNotationType(original, targetType)
    dataStore.setTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID, converted)
    musicScoreData.value = JSON.parse(JSON.stringify(converted)) as MusicScore
  }

  return {
    originalType,
    initAfterLoad,
    applyDisplayType
  }
}
