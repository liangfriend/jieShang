import { ipcRenderer } from 'electron'

export const fileInvoke = {
  upload: (buffer, originalName, type, displayName) =>
    ipcRenderer.invoke('file:upload', buffer, originalName, type, displayName),
  delete: (id) => ipcRenderer.invoke('file:delete', id),
  query: (query) => ipcRenderer.invoke('file:query', query)
}
