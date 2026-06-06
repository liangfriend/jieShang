/** NPlayer 音量范围（线性增益 0~1） */
export const PLAY_VOLUME_MIN = 0
export const PLAY_VOLUME_MAX = 1
export const PLAY_DEFAULT_VOLUME = 1

/** NPlayer BPM 可调范围 */
export const PLAY_BPM_MIN = 40
export const PLAY_BPM_MAX = 240
export const PLAY_DEFAULT_BPM = 120

/** 曲谱有 bpm 时优先使用，否则回落到 PLAY_DEFAULT_BPM */
export function resolvePlayBpm(scoreBpm?: number): number {
  if (typeof scoreBpm === 'number' && Number.isFinite(scoreBpm) && scoreBpm > 0) {
    return Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, scoreBpm))
  }
  return PLAY_DEFAULT_BPM
}
