import { defineStore } from 'pinia'
import type { MusicScore } from 'deciphony-renderer'

export const useDataStore = defineStore('data', {
  state: () => ({
    tempScoreMap: new Map<string, MusicScore>()
  }),
  actions: {
    setTempScore(id: string, score: MusicScore) {
      this.tempScoreMap.set(id, score)
    },
    getTempScore(id: string): MusicScore | undefined {
      return this.tempScoreMap.get(id)
    },
    deleteTempScore(id: string) {
      this.tempScoreMap.delete(id)
    }
  }
})
