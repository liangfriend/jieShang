import { ref } from 'vue'
import { CollectionTypeEnum } from '@renderer/types/collection'
import {
  DEFAULT_PERFORM_SKIN_NAME,
  normalizePerformSkinName
} from '@renderer/components/performSkin/registry'

const STORAGE_KEY = 'collection-active-selection'

const performSkinNameRef = ref(DEFAULT_PERFORM_SKIN_NAME)
const virtualPianoSkinIdRef = ref<number | null>(null)

export type ActiveCollectionRef = {
  id?: number
  name?: string
}

export type ActiveCollectionSelection = {
  [CollectionTypeEnum.ToneColor]?: ActiveCollectionRef
  [CollectionTypeEnum.ScoreSkin]?: ActiveCollectionRef
  [CollectionTypeEnum.VirtualPianoSkin]?: ActiveCollectionRef
  [CollectionTypeEnum.PerformSkin]?: ActiveCollectionRef
}

const DEFAULT_SELECTION: ActiveCollectionSelection = {
  [CollectionTypeEnum.PerformSkin]: { name: DEFAULT_PERFORM_SKIN_NAME }
}

function readRaw(): ActiveCollectionSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveCollectionSelection
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function writeRaw(selection: ActiveCollectionSelection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
}

function syncPerformSkinNameRef(selection: ActiveCollectionSelection) {
  performSkinNameRef.value = normalizePerformSkinName(
    selection[CollectionTypeEnum.PerformSkin]?.name
  )
}

function syncVirtualPianoSkinIdRef(selection: ActiveCollectionSelection) {
  virtualPianoSkinIdRef.value = selection[CollectionTypeEnum.VirtualPianoSkin]?.id ?? null
}

/** 启动时调用：无缓存则写入默认值 */
export function initCollectionActiveStorage(): ActiveCollectionSelection {
  const existing = readRaw()
  if (existing) {
    const performName = existing[CollectionTypeEnum.PerformSkin]?.name
    if (performName) {
      existing[CollectionTypeEnum.PerformSkin] = {
        ...existing[CollectionTypeEnum.PerformSkin],
        name: normalizePerformSkinName(performName)
      }
      writeRaw(existing)
    }
    syncPerformSkinNameRef(existing)
    syncVirtualPianoSkinIdRef(existing)
    return existing
  }
  writeRaw(DEFAULT_SELECTION)
  syncPerformSkinNameRef(DEFAULT_SELECTION)
  syncVirtualPianoSkinIdRef(DEFAULT_SELECTION)
  return { ...DEFAULT_SELECTION }
}

export function useActivePerformSkinName() {
  return performSkinNameRef
}

export function useActiveVirtualPianoSkinId() {
  return virtualPianoSkinIdRef
}

export function loadActiveCollectionSelection(): ActiveCollectionSelection {
  return readRaw() ?? { ...DEFAULT_SELECTION }
}

export function saveActiveCollectionSelection(selection: ActiveCollectionSelection) {
  writeRaw(selection)
}

export function getActivePerformSkinName(): string {
  return performSkinNameRef.value
}

export function setActivePerformSkin(ref: ActiveCollectionRef) {
  const selection = loadActiveCollectionSelection()
  const name = normalizePerformSkinName(ref.name)
  selection[CollectionTypeEnum.PerformSkin] = { ...ref, name }
  saveActiveCollectionSelection(selection)
  performSkinNameRef.value = name
}

export function setActiveCollectionByType(type: CollectionTypeEnum, ref: ActiveCollectionRef) {
  const selection = loadActiveCollectionSelection()
  if (type === CollectionTypeEnum.PerformSkin) {
    const name = normalizePerformSkinName(ref.name)
    selection[type] = { ...ref, name }
    performSkinNameRef.value = name
  } else {
    selection[type] = ref
    if (type === CollectionTypeEnum.VirtualPianoSkin) {
      virtualPianoSkinIdRef.value = ref.id ?? null
    }
  }
  saveActiveCollectionSelection(selection)
}
