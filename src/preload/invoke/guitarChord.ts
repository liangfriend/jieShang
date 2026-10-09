import { ipcRenderer } from 'electron'
import type { tabChord } from '@deciphony/renderer'

export type GuitarChordHandPose = {
  thumbF: number[]
  indexF: number[]
  middleF: number[]
  ringF: number[]
  littleF: number[]
}

export type GuitarChordTabType = 'tab4' | 'tab5' | 'tab6'

export type GuitarChordPayload = {
  data: tabChord
  /** 按弦手型；null 表示清空 */
  hand_pose?: GuitarChordHandPose | null
  /** 创建时指定；更新时服务端忽略改类型 */
  tab_type?: GuitarChordTabType
}

export type GuitarChordListFilter = {
  keyword?: string
  tabType?: GuitarChordTabType | 'all' | null
}

export const guitarChordInvoke = {
  create: (payload: GuitarChordPayload) => ipcRenderer.invoke('guitarChord:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('guitarChord:delete', id),
  update: (id: number | string, payload: GuitarChordPayload) =>
    ipcRenderer.invoke('guitarChord:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('guitarChord:get', id),
  list: (filter?: GuitarChordListFilter) => ipcRenderer.invoke('guitarChord:list', filter),
  searchByName: (name: string, tabType?: GuitarChordTabType | 'all' | null) =>
    ipcRenderer.invoke('guitarChord:searchByName', name, tabType)
}
