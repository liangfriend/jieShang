import {
  GUITAR_DEFAULT_SHORTCUT_NAMES,
  GUITAR_SHORTCUT_STORAGE_KEY
} from '@renderer/constant/guitar'

/** 数字键 1~9 → 和弦 id（null=未绑定） */
export type GuitarShortcutMap = Record<string, number | null>

export function emptyGuitarShortcuts(): GuitarShortcutMap {
  const map: GuitarShortcutMap = {}
  for (let i = 1; i <= 9; i++) map[String(i)] = null
  return map
}

export function loadGuitarShortcuts(): GuitarShortcutMap {
  const base = emptyGuitarShortcuts()
  try {
    const raw = localStorage.getItem(GUITAR_SHORTCUT_STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Record<string, unknown>
    for (let i = 1; i <= 9; i++) {
      const key = String(i)
      const v = parsed[key]
      base[key] = typeof v === 'number' && Number.isFinite(v) ? v : null
    }
  } catch {
    /* ignore */
  }
  return base
}

/** 仅在从未保存过快捷键时，按内置九和弦顺序绑定 1~9 */
export function ensureDefaultGuitarShortcuts(
  chords: Array<{ id: number; name: string }>
): GuitarShortcutMap {
  if (localStorage.getItem(GUITAR_SHORTCUT_STORAGE_KEY)) {
    return loadGuitarShortcuts()
  }
  const map = emptyGuitarShortcuts()
  GUITAR_DEFAULT_SHORTCUT_NAMES.forEach((name, i) => {
    const row = chords.find((c) => c.name === name)
    if (row) map[String(i + 1)] = row.id
  })
  saveGuitarShortcuts(map)
  return map
}

export function saveGuitarShortcuts(map: GuitarShortcutMap): void {
  localStorage.setItem(GUITAR_SHORTCUT_STORAGE_KEY, JSON.stringify(map))
}
