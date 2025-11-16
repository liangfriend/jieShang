import { VideoNodePlayer } from '@renderer/types'
import { ref } from 'vue'

function setup() {
  const videoNodePLayerMap = ref<Map<number, VideoNodePlayer>>(new Map())

  function addVideoNodePlayer(id: number, player: VideoNodePlayer) {
    videoNodePLayerMap.value.set(id, player)
  }

  function removeVideoNodePlayer(id: number) {
    videoNodePLayerMap.value.delete(id)
  }

  return {
    addVideoNodePlayer,
    removeVideoNodePlayer,
    videoNodePLayerMap
  }
}

const res = setup()

export function useVideoManager() {
  return res
}
