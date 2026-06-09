import { ipcRenderer } from 'electron'

export type CollectionType =
  | 'tone_color'
  | 'score_skin'
  | 'piano_skin'
  | 'perform_skin'

export type CollectionCreatePayload = {
  type: CollectionType
  name?: string
  content?: string
  description?: string | null
  is_built_in?: boolean
  owned?: boolean
  thumbnail?: string | null
}

export type CollectionUpdatePayload = Partial<{
  type: CollectionType
  name: string
  content: string
  description: string | null
  is_built_in: boolean
  owned: boolean
  thumbnail: string | null
}>

export type CollectionQueryFilters = Partial<{
  id: number | string
  type: CollectionType
  is_built_in: boolean
  owned: boolean
}>

export const collectionInvoke = {
  create: (payload: CollectionCreatePayload) => ipcRenderer.invoke('collection:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('collection:delete', id),
  update: (id: number | string, payload: CollectionUpdatePayload) =>
    ipcRenderer.invoke('collection:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('collection:get', id),
  query: (filters: CollectionQueryFilters) => ipcRenderer.invoke('collection:query', filters),
  list: () => ipcRenderer.invoke('collection:list'),
  listByType: (type: CollectionType) => ipcRenderer.invoke('collection:listByType', type)
}
