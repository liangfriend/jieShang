/**
 * 按帧随机判定是否生成音符块。
 * @param avgIntervalSeconds 期望平均间隔（秒），如 2 表示约每 2s 一次
 * @param frameMs 当前帧时长（ms），默认 16
 */
export function shouldSpawnByInterval(avgIntervalSeconds: number, frameMs = 16): boolean {
  if (avgIntervalSeconds <= 0) return false
  return Math.random() < frameMs / (avgIntervalSeconds * 1000)
}
