import { defineStore } from 'pinia'
import type { MusicScore } from '@deciphony/renderer'
import type { SJW } from '@deciphony/work'
import type { ScoreToWorkJob } from '@renderer/utils/work/scoreToWork'

export const useDataStore = defineStore('data', {
  state: () => ({
    tempScoreMap: new Map<string, MusicScore>(),
    /** 作品 JSON（与 SJWPDF 绑定的同一引用） */
    tempWorkMap: new Map<string, SJW>(),
    /** 含静态资源的 .sjw 快照，切页/重进时恢复 AssetMap */
    tempWorkBlobMap: new Map<string, Blob>(),
    /** 曲谱编辑页「导出为作品」：作品编辑页载入后取走并分页铺曲谱 */
    pendingScoreToWork: null as ScoreToWorkJob | null
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
    },

    setTempWork(id: string, work: SJW) {
      this.tempWorkMap.set(id, work)
    },
    getTempWork(id: string): SJW | undefined {
      return this.tempWorkMap.get(id)
    },
    deleteTempWork(id: string) {
      this.tempWorkMap.delete(id)
      this.tempWorkBlobMap.delete(id)
    },

    setTempWorkBlob(id: string, blob: Blob) {
      this.tempWorkBlobMap.set(id, blob)
    },
    getTempWorkBlob(id: string): Blob | undefined {
      return this.tempWorkBlobMap.get(id)
    },
    deleteTempWorkBlob(id: string) {
      this.tempWorkBlobMap.delete(id)
    },

    setPendingScoreToWork(job: ScoreToWorkJob) {
      this.pendingScoreToWork = job
    },
    takePendingScoreToWork(): ScoreToWorkJob | null {
      const job = this.pendingScoreToWork
      this.pendingScoreToWork = null
      return job
    }
  }
})
