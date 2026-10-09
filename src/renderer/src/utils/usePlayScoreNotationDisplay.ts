import type { MusicScore } from '@deciphony/renderer'
import { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { CUR_PLAY_SCORE_TEMP_ID, CUR_PLAY_SCORE_TRANS_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import {
  convertScoreNotationType,
  resolveScoreKeySignature,
  shiftScoreBySemitones,
  transposeScoreNotation
} from '@renderer/utils/scoreNotationTransfer'

function cloneScore(score: MusicScore): MusicScore {
  return JSON.parse(JSON.stringify(score)) as MusicScore
}

/**
 * 播放页曲谱类型展示：原谱始终在 curPlayScore，转换结果写入 curPlayScoreTrans。
 *
 * 转调 / 升降调作用在**当前展示谱**上（用户看到的调号与音高），再反向同步回原谱，
 * 避免「先简线切换再转调」时对原谱转调 + 按默认 C 重算导致画面无变化。
 */
export function usePlayScoreNotationDisplay(
  musicScoreData: Ref<MusicScore>,
  displayType: Ref<MusicScoreTypeEnum>
) {
  const dataStore = useDataStore()
  const originalType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)

  function initAfterLoad(loaded: MusicScore) {
    const original = cloneScore(loaded)
    dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, original)

    originalType.value = original.type
    displayType.value = original.type
    musicScoreData.value = cloneScore(original)
    dataStore.deleteTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID)
  }

  function applyDisplayType(targetType: MusicScoreTypeEnum) {
    const original = dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID)
    if (!original) return

    displayType.value = targetType

    if (targetType === originalType.value) {
      musicScoreData.value = cloneScore(original)
      dataStore.deleteTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID)
      return
    }

    const converted = convertScoreNotationType(original, targetType)
    dataStore.setTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID, converted)
    musicScoreData.value = cloneScore(converted)
  }

  /** 把展示谱的变更同步回原谱（同类型直接覆盖；跨类型则按目标调反向转换）。 */
  function syncOriginalFromDisplay(displayScore: MusicScore, keySignature: KeySignatureTypeEnum) {
    if (displayType.value === originalType.value) {
      dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, cloneScore(displayScore))
      dataStore.deleteTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID)
      musicScoreData.value = cloneScore(displayScore)
      return
    }

    const syncedOriginal = convertScoreNotationType(displayScore, originalType.value, {
      keySignature
    })
    dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, syncedOriginal)
    dataStore.setTempScore(CUR_PLAY_SCORE_TRANS_TEMP_ID, cloneScore(displayScore))
    musicScoreData.value = cloneScore(displayScore)
  }

  /** 转调：改当前展示谱，再同步原谱（切回原谱类型时仍保留转调）。 */
  function applyTranspose(options: {
    toKey: KeySignatureTypeEnum
    fromKey?: KeySignatureTypeEnum
  }) {
    if (!dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID)) return

    const fromKey = options.fromKey ?? resolveScoreKeySignature(musicScoreData.value)
    const transposedDisplay = transposeScoreNotation(musicScoreData.value, {
      fromKey,
      toKey: options.toKey
    })
    syncOriginalFromDisplay(transposedDisplay, options.toKey)
  }

  /** 升降调：改当前展示谱，再同步原谱。 */
  function applySemitoneShift(semitones: number) {
    if (!dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID)) return

    const shiftedDisplay = shiftScoreBySemitones(musicScoreData.value, semitones)
    const keySignature = resolveScoreKeySignature(shiftedDisplay)
    syncOriginalFromDisplay(shiftedDisplay, keySignature)
  }

  return {
    originalType,
    initAfterLoad,
    applyDisplayType,
    applyTranspose,
    applySemitoneShift
  }
}
