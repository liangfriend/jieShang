import { AudioPlayer } from 'deciphony-player'
import { AudioNode, AudioNodePlayer } from '@renderer/types'

export function useAudioNodePlayer(audioNode: AudioNode): AudioNodePlayer {
  const player = new AudioPlayer()
  const audioUrl = audioNode.url

  async function play() {
    await player.addAudio(audioUrl)
    player.play()
  }

  async function pause() {
    player.pause()
  }

  function stop() {
    player.stop()
  }

  function destory() {
    player.stop()
    // player.destory()
  }

  return {
    play,
    pause,
    stop,
    destory
  }
}
