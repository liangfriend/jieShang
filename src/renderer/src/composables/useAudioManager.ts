import { ref } from 'vue'
import { AudioNodePlayer } from '@renderer/types'
import { NodeEnum } from '@renderer/enum'
import { useAudioNodePlayer } from '@renderer/composables/useAudioNodePlayer'
import { useNodeManager } from '@renderer/composables/useNodeManager'

const { editorNodeList, nodeMap, editorNodeMap, groupedNodes, clearNodeManager } = useNodeManager()

const audioNodePlayerMap = ref(new Map<number, AudioNodePlayer>())
// 初始化故事中所有音频节点
nodeMap.value.forEach((node) => {
  if (node.nodeType === NodeEnum.Audio) {
    const player = useAudioNodePlayer(node)
    audioNodePlayerMap.value.set(node.id, player)
  }
})

function play(nodeId: number, delay: number = 0) {
  const player = audioNodePlayerMap.value.get(nodeId)
  setTimeout(() => {
    player?.play()
  }, delay)
}

function stop(nodeId: number) {
  const player = audioNodePlayerMap.value.get(nodeId)
  player?.stop()
}

function destory(nodeId: number) {
  const player = audioNodePlayerMap.value.get(nodeId)
  // TODO 后续更新deciphony-player  destory方法
  player?.stop()
}

export function useAudioManager() {
  return { audioNodePlayerMap, play, stop, destory }
}
