import { ref } from 'vue'
import {
  STORABLE_COLLECTION_TYPES,
  type StorableCollectionType
} from '@renderer/constant/collection'
import { CollectionTypeEnum } from '@renderer/types/collection'

const STORAGE_KEY = 'collection-active-selection'

const performSkinIdRef = ref<number | null>(null)
const scoreSkinIdRef = ref<number | null>(null)
const virtualPianoSkinIdRef = ref<number | null>(null)

/** localStorage 仅存各类型当前使用藏品 id（不含音色） */
export type ActiveCollectionSelection = Partial<Record<StorableCollectionType, number>>

function readRaw(): ActiveCollectionSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null

    const selection: ActiveCollectionSelection = {}
    for (const type of STORABLE_COLLECTION_TYPES) {
      const value = parsed[type]
      if (typeof value === 'number' && Number.isFinite(value)) {
        selection[type] = value
        continue
      }
      // 兼容旧版 { id, name } 结构
      if (value && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'number') {
        selection[type] = (value as { id: number }).id
      }
    }
    return selection
  } catch {
    return null
  }
}

function writeRaw(selection: ActiveCollectionSelection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
}

function syncPerformSkinIdRef(selection: ActiveCollectionSelection) {
  performSkinIdRef.value = selection[CollectionTypeEnum.PerformSkin] ?? null
}

function syncScoreSkinIdRef(selection: ActiveCollectionSelection) {
  scoreSkinIdRef.value = selection[CollectionTypeEnum.ScoreSkin] ?? null
}

function syncVirtualPianoSkinIdRef(selection: ActiveCollectionSelection) {
  virtualPianoSkinIdRef.value = selection[CollectionTypeEnum.VirtualPianoSkin] ?? null
}

function syncReactiveRefs(selection: ActiveCollectionSelection) {
  syncPerformSkinIdRef(selection)
  syncScoreSkinIdRef(selection)
  syncVirtualPianoSkinIdRef(selection)
}

/** 启动时调用：读取 localStorage 并同步 reactive ref */
export function initCollectionActiveStorage(): ActiveCollectionSelection {
  const existing = readRaw()
  if (existing) {
    syncReactiveRefs(existing)
    return existing
  }
  syncReactiveRefs({})
  return {}
}

export function useActivePerformSkinId() {
  return performSkinIdRef
}

export function useActiveScoreSkinId() {
  return scoreSkinIdRef
}

export function useActiveVirtualPianoSkinId() {
  return virtualPianoSkinIdRef
}

export function loadActiveCollectionSelection(): ActiveCollectionSelection {
  return readRaw() ?? {}
}

export function saveActiveCollectionSelection(selection: ActiveCollectionSelection) {
  writeRaw(selection)
  syncReactiveRefs(selection)
}

export function setActiveCollectionId(type: StorableCollectionType, id: number) {
  const selection = loadActiveCollectionSelection()
  selection[type] = id
  saveActiveCollectionSelection(selection)
}

export function getActiveCollectionId(type: StorableCollectionType): number | undefined {
  return loadActiveCollectionSelection()[type]
}
