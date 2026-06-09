import { DEFAULT_PERFORM_SKIN_NAME } from '@renderer/components/performSkin/registry'
import { DEFAULT_SCORE_SKIN_NAME } from '@renderer/constant/scoreSkin'
import { DEFAULT_VIRTUAL_PIANO_SKIN_NAME } from '@renderer/resources/virtualPianoSkins'
import { CollectionTypeEnum, type CollectionDbType, type CollectionRecord } from '@renderer/types/collection'
import {
  loadActiveCollectionSelection,
  saveActiveCollectionSelection,
  type ActiveCollectionRef,
  type ActiveCollectionSelection
} from '@renderer/utils/collection/collectionActiveStorage'
import { parseCollectionList, resolveCollectionName } from '@renderer/utils/collection/collectionHelper'

type DefaultPicker = (records: CollectionRecord[]) => CollectionRecord | undefined

/** 各类型默认藏品选取规则；删除当前使用中的藏品时也应复用此规则回退 default */
const DEFAULT_COLLECTION_PICKERS: Partial<
  Record<CollectionTypeEnum, { dbType: CollectionDbType; pick: DefaultPicker }>
> = {
  [CollectionTypeEnum.PerformSkin]: {
    dbType: 'perform_skin',
    pick: (records) =>
      records.find((r) => r.content === DEFAULT_PERFORM_SKIN_NAME) ?? records[0]
  },
  [CollectionTypeEnum.ScoreSkin]: {
    dbType: 'score_skin',
    pick: (records) =>
      records.find((r) => r.name === DEFAULT_SCORE_SKIN_NAME) ?? records[0]
  },
  [CollectionTypeEnum.VirtualPianoSkin]: {
    dbType: 'piano_skin',
    pick: (records) =>
      records.find((r) => r.name === DEFAULT_VIRTUAL_PIANO_SKIN_NAME) ?? records[0]
  }
}

function isActiveRefComplete(ref: ActiveCollectionRef | undefined): ref is ActiveCollectionRef {
  return ref != null && typeof ref.id === 'number' && !!ref.name?.trim()
}

/** 首次启动或缺 id/name 时，从数据库补全 localStorage（各类型均存 id + name） */
export async function initDefaultCollectionSelection() {
  const selection: ActiveCollectionSelection = { ...loadActiveCollectionSelection() }
  let changed = false

  for (const [enumKey, config] of Object.entries(DEFAULT_COLLECTION_PICKERS)) {
    const enumType = enumKey as CollectionTypeEnum
    const active = selection[enumType]
    if (isActiveRefComplete(active)) continue

    const res = await window.api.collection.query({ type: config.dbType, owned: true })
    const records = parseCollectionList(res)
    const record = config.pick(records)
    if (!record) continue

    selection[enumType] = { id: record.id, name: resolveCollectionName(record) }
    changed = true
  }

  if (changed) {
    saveActiveCollectionSelection(selection)
  }
}
