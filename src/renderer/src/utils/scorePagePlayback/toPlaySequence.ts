import type { MusicScore } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import type { PlaySequence } from '@deciphony/player'
import { DEFAULT_DRUM_PLAY_MAP, getDrPlaySequence } from '@deciphony/extensions/dr-play'
import { defaultToneColorIdForScore, usePlayStore } from '@renderer/store/play.store'
import { toneColorKey } from '@renderer/utils/collection/toneColorUsage'
import { buildNoteStaveIndexMap } from '@renderer/utils/staffNotes'
import { isFixedToneColorScore } from '@renderer/utils/isTabNotation'
import type { PlayRange } from './usePlayRangeSelect'

export type ToPlaySequenceOptions = {
  /** 跳过的单谱表行号（关闭的声部） */
  passSingleStaffIndex?: number[]
  /** 选段：由 dr-play 按起止音符裁剪并把起点平移到 0 */
  range?: PlayRange | null
}

type DrPlaySequenceOptions = NonNullable<Parameters<typeof getDrPlaySequence>[1]>

/** 鼓谱触发后最短鸣响（与 deciphony-test drumTest 一致，单位与 DR duration 同） */
const DRUM_MIN_RING = 256

/** DR 播放序列 → NPlayer 播放序列 */
export function toPlaySequence(
  musicScoreData: MusicScore,
  options: ToPlaySequenceOptions = {}
): PlaySequence {
  const isDrum = musicScoreData.type === MusicScoreTypeEnum.DrumNotation
  const playStore = usePlayStore()
  const defaultToneColor = isFixedToneColorScore(musicScoreData)
    ? toneColorKey(defaultToneColorIdForScore(musicScoreData))
    : playStore.getActiveToneColorKey()
  // 乐器谱（含 TAB 泛音）固定用序列里的 staff toneColor；普通谱在「曲谱设定」时同样按谱表音色
  const useStaffToneColor =
    isFixedToneColorScore(musicScoreData) || playStore.isScoreToneColorMode
  // range 为 dr-play 新增选项，已发布的类型尚未包含
  let drSeq = getDrPlaySequence(musicScoreData, {
    ...(isDrum ? { drumMap: DEFAULT_DRUM_PLAY_MAP } : {}),
    defaultToneColor,
    ...(options.range ? { range: options.range } : {})
  } as DrPlaySequenceOptions)
  const passSet = new Set(options.passSingleStaffIndex ?? [])
  if (passSet.size > 0) {
    const staveMap = buildNoteStaveIndexMap(musicScoreData)
    drSeq = drSeq.filter((it) => {
      const baseId = it.note_id.includes(':') ? it.note_id.slice(0, it.note_id.indexOf(':')) : it.note_id
      const st = staveMap.get(baseId) ?? staveMap.get(it.note_id)
      if (st == null) return true
      return !passSet.has(st)
    })
  }

  let curPlayTime = -Infinity
  const playSeq = drSeq.map((it) => {
    let start = false
    if (curPlayTime !== it.playTime) {
      start = true
      curPlayTime = it.playTime
    }
    const rawDuration = it.real_duration ? it.real_duration : it.duration
    const duration =
      isDrum && it.midi > 0 ? Math.max(rawDuration, DRUM_MIN_RING) : rawDuration
    return {
      id: it.note_id,
      midi: it.real_duration === 0 ? 0 : it.midi,
      duration,
      playTime: it.playTime,
      toneColor: useStaffToneColor ? (it.toneColor ?? defaultToneColor) : defaultToneColor,
      ...(isDrum && it.volume != null ? { velocity: it.volume } : {}),
      data: {
        note_id: it.note_id,
        duration: it.duration,
        realDuration: it.real_duration,
        playTime: it.playTime,
        start
      },
      end: false
    }
  })
  if (playSeq.length > 0) {
    playSeq[playSeq.length - 1]!.end = true
  }
  return playSeq
}
