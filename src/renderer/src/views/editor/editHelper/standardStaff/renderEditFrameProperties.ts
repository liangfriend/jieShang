/** 属性栏横向偏移滑块范围（relativeX，0 为默认居中） */
export const RELATIVE_X_OFFSET_MIN = -40
export const RELATIVE_X_OFFSET_MAX = 40

export function setRelativeX(target: { relativeX?: number }, relativeX: number): void {
  target.relativeX = relativeX
}
