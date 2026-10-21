import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@deciphony/work'

export type StandardSizeGroup = 'paper' | 'screen'

export type StandardSize = {
  id: string
  name: string
  group: StandardSizeGroup
  orientation?: 'portrait' | 'landscape'
  width: number
  height: number
}

/** 纸张按 96 DPI 由毫米换算为页面像素（A4 = DEFAULT_PAGE_WIDTH × DEFAULT_PAGE_HEIGHT） */
const PAPER_SIZES: Array<{ name: string; width: number; height: number }> = [
  { name: 'A3', width: 1123, height: 1587 },
  { name: 'A4', width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT },
  { name: 'A5', width: 559, height: 794 },
  { name: 'B4', width: 945, height: 1334 },
  { name: 'B5', width: 665, height: 945 },
  { name: 'Letter', width: 816, height: 1056 }
]

export const STANDARD_SIZES: StandardSize[] = [
  ...PAPER_SIZES.flatMap(({ name, width, height }): StandardSize[] => [
    { id: `${name}-portrait`, name, group: 'paper', orientation: 'portrait', width, height },
    { id: `${name}-landscape`, name, group: 'paper', orientation: 'landscape', width: height, height: width }
  ]),
  { id: 'screen-16-9', name: '16:9', group: 'screen', width: 1280, height: 720 },
  { id: 'screen-4-3', name: '4:3', group: 'screen', width: 1024, height: 768 }
]

export const STANDARD_SIZE_GROUPS: StandardSizeGroup[] = ['paper', 'screen']

export function findStandardSizeId(width: number, height: number): string {
  return STANDARD_SIZES.find((s) => s.width === width && s.height === height)?.id ?? ''
}
