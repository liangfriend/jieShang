import type { MusicScore } from 'deciphony-renderer'
import type { PlaySequence } from 'deciphony-player'
import { getDrPlaySequence } from '@renderer/dr-extensions/dr-play'
import { PIANO_TONE_COLOR_NAME } from '@renderer/store/play.store'

/** DR 播放序列 → NPlayer 播放序列 */
export function toPlaySequence(musicScoreData: MusicScore): PlaySequence {
  const drSeq = getDrPlaySequence(musicScoreData)

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
