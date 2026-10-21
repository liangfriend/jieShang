import { ipcRenderer } from 'electron'

type ScoreType = 'music_score' | 'cl_sheet'

export const scoreInvoke = {
  create: (payload: { name: string; data?: string; type?: ScoreType }) =>
    ipcRenderer.invoke('score:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('score:delete', id),
  update: (id: number | string, payload: Partial<{ name: string; data: string }>) =>
    ipcRenderer.invoke('score:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('score:get', id),
  query: (filters: Partial<{ id: number | string; name: string; type: ScoreType }>) =>
    ipcRenderer.invoke('score:query', filters),
  list: (type?: ScoreType) => ipcRenderer.invoke('score:list', type),
  searchByName: (name: string, type?: ScoreType) =>
    ipcRenderer.invoke('score:searchByName', name, type)
}
