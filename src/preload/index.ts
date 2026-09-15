import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { scoreInvoke } from './invoke/score'
import { workInvoke } from './invoke/work'
import { collectionInvoke } from './invoke/collection'
import { fileInvoke } from './invoke/file'
import { windowInvoke } from './invoke/window'
import { groupInvoke } from './invoke/group'
import { achievementInvoke } from './invoke/achievement'
import { noteSliceHighScoreInvoke } from './invoke/noteSliceHighScore'
import { audioInvoke } from './invoke/audio'
import { imageInvoke } from './invoke/image'
import { videoInvoke } from './invoke/video'
import { guitarChordInvoke } from './invoke/guitarChord'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      file: fileInvoke,
      score: scoreInvoke,
      work: workInvoke,
      audio: audioInvoke,
      image: imageInvoke,
      video: videoInvoke,
      guitarChord: guitarChordInvoke,
      collection: collectionInvoke,
      achievement: achievementInvoke,
      noteSliceHighScore: noteSliceHighScoreInvoke,
      window: windowInvoke,
      group: groupInvoke
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
