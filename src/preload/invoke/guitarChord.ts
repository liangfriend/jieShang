import { ipcRenderer } from 'electron'
import type { tabChord } from '@deciphony/renderer'

export type GuitarChordPayload = {
  data: tabChord
}

export const guitarChordInvoke = {
  create: (payload: GuitarChordPayload) => ipcRenderer.invoke('guitarChord:create', payload),
  delete: (id: number | string) => ipcRenderer.invoke('guitarChord:delete', id),
  update: (id: number | string, payload: GuitarChordPayload) =>
    ipcRenderer.invoke('guitarChord:update', id, payload),
  get: (id: number | string) => ipcRenderer.invoke('guitarChord:get', id),
  list: () => ipcRenderer.invoke('guitarChord:list'),
  searchByName: (name: string) => ipcRenderer.invoke('guitarChord:searchByName', name)
}
