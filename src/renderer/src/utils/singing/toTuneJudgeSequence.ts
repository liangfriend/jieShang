import type { MusicScore } from '@deciphony/renderer'
import type { Sequence } from '@deciphony/tune-judge'
import { getDrPlaySequence } from '@deciphony/extensions/dr-play'
import { buildFlattenStaffRows } from '@deciphony/extensions/dr-time-offset'
import { SCORE_TIME_OFFSET_PROP } from '@renderer/constant/scoreTimeOffset'
import { PLAY_SOURCE, type PlaySource } from '@renderer/constant/playSource'

/** 秒 → Unit256（与 tune-judge 一致：四分=64） */
export function secondsToUnit256(seconds: number, bpm: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) return 0
  const b = Number.isFinite(bpm) && bpm > 0 ? bpm : 120
  return (seconds * 64 * b) / 60
}

function toScoreJudgeSequence(score: MusicScore): Sequence {
  return getDrPlaySequence(score)
    .filter((it) => it.midi > 0)
    .map((it) => ({
      midi: it.midi,
      playTime: it.playTime,
      duration: it.real_duration ?? it.duration,
      data: { note_id: it.note_id }
    }))
}

type TimedSlot = {
  timeSec: number
  isRest: boolean
  chronaxieDuration: number
  notes: Array<{ note_id: string; midi: number }>
}

/**
 * 范唱/伴奏：用 measureNoteSlot.data 上的绝对秒，
 * 音符时长 = 到下一个音符或休止符的间隔；末音用时值（Unit256）。
 */
function toTimePropJudgeSequence(
  score: MusicScore,
  timeProp: string,
  bpm: number
): Sequence {
  const drSeq = getDrPlaySequence(score)
  const midiById = new Map<string, number>()
  const durationById = new Map<string, number>()
  for (const it of drSeq) {
    if (it.midi > 0) midiById.set(it.note_id, it.midi)
    durationById.set(it.note_id, it.real_duration ?? it.duration)
  }

  const rows = buildFlattenStaffRows(score, timeProp)
  const timed: TimedSlot[] = []
  for (const row of rows) {
    for (const slot of row.slots) {
      const notes: TimedSlot['notes'] = []
      if (!slot.isRest) {
        for (const id of slot.highlightIds) {
          const midi = midiById.get(id)
          if (midi == null || midi <= 0) continue
          notes.push({ note_id: id, midi })
        }
        if (!notes.length) continue
      }
      const leadId = slot.highlightIds[0]
      timed.push({
        timeSec: slot.time,
        isRest: slot.isRest,
        chronaxieDuration: leadId ? (durationById.get(leadId) ?? 64) : 64,
        notes
      })
    }
  }

  timed.sort((a, b) => a.timeSec - b.timeSec)

  const seq: Sequence = []
  for (let i = 0; i < timed.length; i++) {
    const cur = timed[i]!
    if (cur.isRest || !cur.notes.length) continue
    const next = timed[i + 1]
    const playTime = secondsToUnit256(cur.timeSec, bpm)
    let duration: number
    if (next) {
      duration = Math.max(1, secondsToUnit256(next.timeSec - cur.timeSec, bpm))
    } else {
      duration = Math.max(1, cur.chronaxieDuration)
    }
    for (const n of cur.notes) {
      seq.push({
        midi: n.midi,
        playTime,
        duration,
        data: { note_id: n.note_id }
      })
    }
  }
  return seq
}

export function timePropForSingingSource(source: PlaySource): string | null {
  if (source === PLAY_SOURCE.vocal) return SCORE_TIME_OFFSET_PROP.vocalPerformance
  if (source === PLAY_SOURCE.accompaniment) return SCORE_TIME_OFFSET_PROP.accompaniment
  return null
}

/** 按音源生成 tune-judge Sequence */
export function toTuneJudgeSequence(
  score: MusicScore,
  playSource: PlaySource,
  bpm = score.bpm ?? 120
): Sequence {
  const prop = timePropForSingingSource(playSource)
  if (!prop) return toScoreJudgeSequence(score)
  return toTimePropJudgeSequence(score, prop, bpm)
}

export function sequenceEndUnit256(seq: Sequence): number {
  return seq.reduce((m, n) => Math.max(m, n.playTime + n.duration), 0)
}
