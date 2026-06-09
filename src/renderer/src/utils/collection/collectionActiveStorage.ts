import { ref } from 'vue'
import { CollectionTypeEnum } from '@renderer/types/collection'

const STORAGE_KEY = 'collection-active-selection'

const performSkinIdRef = ref<number | null>(null)
const scoreSkinIdRef = ref<number | null>(null)
const virtualPianoSkinIdRef = ref<number | null>(null)

export type ActiveCollectionRef = {
  id: number
  name: string
}

export type ActiveCollectionSelection = {
  [CollectionTypeEnum.ToneColor]?: ActiveCollectionRef
  [CollectionTypeEnum.ScoreSkin]?: ActiveCollectionRef
  [CollectionTypeEnum.VirtualPianoSkin]?: ActiveCollectionRef
  [CollectionTypeEnum.PerformSkin]?: ActiveCollectionRef
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

function syncPerformSkinIdRef(selection: ActiveCollectionSelection) {
  performSkinIdRef.value = selection[CollectionTypeEnum.PerformSkin]?.id ?? null
}

function syncScoreSkinIdRef(selection: ActiveCollectionSelection) {
  scoreSkinIdRef.value = selection[CollectionTypeEnum.ScoreSkin]?.id ?? null
}

function syncVirtualPianoSkinIdRef(selection: ActiveCollectionSelection) {
  virtualPianoSkinIdRef.value = selection[CollectionTypeEnum.VirtualPianoSkin]?.id ?? null
}

function syncReactiveRefs(selection: ActiveCollectionSelection) {
  syncPerformSkinIdRef(selection)
  syncScoreSkinIdRef(selection)
  syncVirtualPianoSkinIdRef(selection)
}

/** 启动时调用：读取 localStorage 并同步 reactive ref（不写默认值，缺项由 initDefaultCollectionSelection 从数据库补全） */
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

export function setActiveCollectionByType(type: CollectionTypeEnum, ref: ActiveCollectionRef) {
  const selection = loadActiveCollectionSelection()
  selection[type] = { id: ref.id, name: ref.name }
  saveActiveCollectionSelection(selection)
}

export function getActiveCollectionRef(type: CollectionTypeEnum): ActiveCollectionRef | undefined {
  return loadActiveCollectionSelection()[type]
}
