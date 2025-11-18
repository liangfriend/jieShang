declare module 'deciphony-player' {
  export class AudioPlayer {
    constructor()

    addAudio(url: string): Promise<void>

    play(): void

    pause(): void

    stop(): void

    destroy?(): void

    destory?(): void
  }

  export default AudioPlayer
}
