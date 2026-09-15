import { defineStore } from 'pinia'

/**
 * 作品/外部入口可把范唱、伴奏音频二进制按约定名称写入，
 * 演唱模式路由带 key 从此处读取（优先于曲谱 data 中的本地音频 id）。
 */
export type TempAudioPayload = {
  /** 可播放地址或 data URL；与 buffer 二选一 */
  url?: string
  /** 原始二进制 */
  buffer?: ArrayBuffer
  mimeType?: string
  name?: string
}

export const useTempAudioStore = defineStore('tempAudio', {
  state: () => ({
    tempAudioMap: new Map<string, TempAudioPayload>()
  }),
  actions: {
    setTempAudio(key: string, payload: TempAudioPayload) {
      this.tempAudioMap.set(key, payload)
    },
    getTempAudio(key: string): TempAudioPayload | undefined {
      return this.tempAudioMap.get(key)
    },
    hasTempAudio(key: string): boolean {
      return this.tempAudioMap.has(key)
    },
    deleteTempAudio(key: string) {
      this.tempAudioMap.delete(key)
    },
    clear() {
      this.tempAudioMap.clear()
    }
  }
})
