import type { MusicScore } from 'deciphony-renderer'
import type { PlaySequence } from 'deciphony-player'
import { getDrPlaySequence } from '@renderer/dr-extensions/dr-play'
import { PIANO_TONE_COLOR_NAME } from '@renderer/store/play.store'
import { buildNoteStaveIndexMap } from '@renderer/utils/practice/staffNotes'

export type ToPlaySequenceOptions = {
  /** 跳过的单谱表行号（关闭的声部） */
  passSingleStaffIndex?: number[]
}

/** DR 播放序列 → NPlayer 播放序列 */
export function toPlaySequence(
  musicScoreData: MusicScore,
  options: ToPlaySequenceOptions = {}
): PlaySequence {
  let drSeq = getDrPlaySequence(musicScoreData)
  const passSet = new Set(options.passSingleStaffIndex ?? [])
  if (passSet.size > 0) {
    const staveMap = buildNoteStaveIndexMap(musicScoreData)
    drSeq = drSeq.filter((it) => {
      const st = staveMap.get(it.note_id)
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
    return {
      id: it.note_id,
      midi: it.real_duration === 0 ? 0 : it.midi,
      duration: it.real_duration ? it.real_duration : it.duration,
      playTime: it.playTime,
      toneColor: PIANO_TONE_COLOR_NAME,
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
