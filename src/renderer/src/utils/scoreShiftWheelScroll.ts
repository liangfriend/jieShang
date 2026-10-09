/**
 * 停止态下 Shift + 滚轮横向滚动曲谱区。
 * 有 deltaX（触控板）时优先用 deltaX，否则把纵向滚轮映射为左右。
 */
export function applyScoreShiftWheelScroll(
  container: HTMLElement | null | undefined,
  event: WheelEvent,
  enabled: boolean
): void {
  if (!enabled || !container || !event.shiftKey) return
  const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
  if (delta === 0) return
  event.preventDefault()
  container.scrollLeft += delta
}
