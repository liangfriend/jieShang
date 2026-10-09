import { ipcRenderer } from 'electron'

/** data 为鼓机 JSON（pattern + bpm / volume / swing），结构见渲染进程 types/drumMachine */
export type DrumMachinePayload = {
  name?: string
  data?: unknown
}

export const drumMachineInvoke = {
  create: (payload: DrumMachinePayload) => ipcRenderer.invoke('drumMachine:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('drumMachine:delete', id),
  update: (id: number | string, payload: DrumMachinePayload) =>
    ipcRenderer.invoke('drumMachine:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('drumMachine:get', id),
  list: (keyword?: string) => ipcRenderer.invoke('drumMachine:list', keyword)
}
