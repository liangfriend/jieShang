import { ipcRenderer } from 'electron'

export const omrInvoke = {
  recognize: (image: Uint8Array) => ipcRenderer.invoke('omr:recognize', image)
}
