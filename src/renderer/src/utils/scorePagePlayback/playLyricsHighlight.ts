import { shallowRef } from 'vue'
import { lyricKey } from '@deciphony/extensions/dr-lyrics'
import type { DR_playLyric } from '@deciphony/extensions/dr-play'

/**
 * 播放中染红的歌词字（lyricKey(slotId, verse)），各曲谱的 drLyrics 共用。
 * 同一时刻的字一起亮，一直亮到下一个字开始；停止 / 播完清空。
 */
export const activePlayLyrics = shallowRef<ReadonlySet<string>>(new Set())

let activeTime: number | null = null

/** 播到一个带词的音：新时刻替换上一批，同一时刻（和弦 / 多声部）追加 */
export function showPlayLyric(lyric: DR_playLyric, time: number) {
  const key = lyricKey(lyric.slotId, lyric.verse)
  if (time !== activeTime) {
    activeTime = time
    activePlayLyrics.value = new Set([key])
    return
  }
  if (activePlayLyrics.value.has(key)) return
  activePlayLyrics.value = new Set([...activePlayLyrics.value, key])
}

/** 整批替换（范唱 / 伴奏按音频时间算出的当前字） */
export function setPlayLyrics(keys: Iterable<string>) {
  activeTime = null
  activePlayLyrics.value = new Set(keys)
}

export function clearPlayLyrics() {
  activeTime = null
  if (activePlayLyrics.value.size) activePlayLyrics.value = new Set()
}
