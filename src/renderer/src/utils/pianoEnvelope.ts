import type { ReleaseNoteOptions, TriggerNoteOptions } from '@renderer/store/play.store'
import {
  PIANO_SMOOTH_ATTACK_SEC,
  PIANO_SMOOTH_DECAY_SEC,
  PIANO_SMOOTH_PEAK_VOLUME,
  PIANO_SMOOTH_RELEASE_SEC
} from '@renderer/constant/piano'

/** 按住到抬键：ADSR 起音，抬键时再 release */
export function pianoHoldTriggerOptions(
  extra?: Pick<TriggerNoteOptions, 'id' | 'volume'>
): TriggerNoteOptions {
  return {
    holdUntilRelease: true,
    attack: PIANO_SMOOTH_ATTACK_SEC,
    decay: PIANO_SMOOTH_DECAY_SEC,
    peakVolume: PIANO_SMOOTH_PEAK_VOLUME,
    ...extra
  }
}

/** 定长播放：A/D + duration 结束后 R */
export function pianoOneShotTriggerOptions(
  duration: number,
  extra?: Pick<TriggerNoteOptions, 'id' | 'volume'>
): TriggerNoteOptions {
  return {
    duration,
    attack: PIANO_SMOOTH_ATTACK_SEC,
    decay: PIANO_SMOOTH_DECAY_SEC,
    peakVolume: PIANO_SMOOTH_PEAK_VOLUME,
    release: PIANO_SMOOTH_RELEASE_SEC,
    ...extra
  }
}

export function pianoReleaseOptions(): ReleaseNoteOptions {
  return { release: PIANO_SMOOTH_RELEASE_SEC }
}
