declare module 'deciphony-player' {
  export type PlaySequenceItem = {
    id: string
    midi: number
    duration: number
    playTime: number
    toneColor: string
    data?: Record<string, unknown>
    end?: boolean
  }

  export type PlaySequence = PlaySequenceItem[]

  export class NPlayer {
    constructor(options?: { checkTime?: number; checkDuration?: number })

    addToneColor(name: string, toneColor: unknown): Promise<void>

    setPlaySequence(seq: PlaySequence): void

    play(): Promise<void>

    pause(): void

    stop(): void

    dispose(): void

    get volume(): number

    set volume(value: number)

    get bpm(): number

    set bpm(value: number)

    set onProgressStart(cb: (progress: number, data: unknown) => void)

    set onProgressEnd(cb: (progress: number, data: unknown) => void)

    set onEnd(cb: () => void)
  }

  export function activeContext(): Promise<void>

  export function startJPlayer(): void
}
