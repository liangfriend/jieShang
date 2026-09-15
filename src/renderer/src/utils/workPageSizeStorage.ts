import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@deciphony/work'

/** 作品编辑：新页默认宽高 */
export const WORK_PAGE_SIZE_STORAGE_KEY = 'jieShang.work.newPageSize'

export type WorkPageSize = {
  width: number
  height: number
}

function normalizeSize(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(10000, Math.max(100, Math.round(n)))
}

export function loadWorkPageSize(): WorkPageSize {
  try {
    const raw = localStorage.getItem(WORK_PAGE_SIZE_STORAGE_KEY)
    if (!raw) {
      return { width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT }
    }
    const parsed = JSON.parse(raw) as Partial<WorkPageSize>
    return {
      width: normalizeSize(parsed.width, DEFAULT_PAGE_WIDTH),
      height: normalizeSize(parsed.height, DEFAULT_PAGE_HEIGHT)
    }
  } catch {
    return { width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT }
  }
}

export function saveWorkPageSize(size: WorkPageSize): void {
  const next: WorkPageSize = {
    width: normalizeSize(size.width, DEFAULT_PAGE_WIDTH),
    height: normalizeSize(size.height, DEFAULT_PAGE_HEIGHT)
  }
  localStorage.setItem(WORK_PAGE_SIZE_STORAGE_KEY, JSON.stringify(next))
}
