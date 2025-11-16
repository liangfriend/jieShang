import { ipcRenderer } from 'electron'

export const gameInvoke = {
  create: (payload) => ipcRenderer.invoke('game:create', payload),
  delete: (id) => ipcRenderer.invoke('game:delete', id),
  update: (id, payload) => ipcRenderer.invoke('game:update', id, payload),
  query: (filters) => ipcRenderer.invoke('game:query', filters),
  list: () => ipcRenderer.invoke('game:list')
}
