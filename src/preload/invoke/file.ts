import { ipcRenderer } from 'electron'

export const fileInvoke = {
  upload: (buffer, originalName, type, displayName) =>
    ipcRenderer.invoke('file:upload', buffer, originalName, type, displayName),
  delete: (url: string) => ipcRenderer.invoke('file:delete', url),
  importSj: () => ipcRenderer.invoke('file:importSj'),
  exportSj: (content: string, defaultName?: string) =>
    ipcRenderer.invoke('file:exportSj', content, defaultName),
  importMusicXml: () => ipcRenderer.invoke('file:importMusicXml'),
  exportMusicXml: (content: string, defaultName?: string) =>
    ipcRenderer.invoke('file:exportMusicXml', content, defaultName)
}
