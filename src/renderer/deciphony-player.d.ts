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

    trigger(options: {
      id: string
      midi: number
      toneColor: string
      volume?: number
      duration?: number
    }): void

    release(options: { id: string }): void

    releaseAll(): void
  }

  export type Intensity = 'strong' | 'weak' | 'secondary'

  /** 节拍器音色：每种强度对应一个 dataurl / url */
  export type MetronomeColor = Record<Intensity, string>

  /** 拍号字符串，如 "4/4" "3/8" */
  export type TimeSignature = string

  export type MetronomeSequenceGenOption = {
    copyCount: number
  }

  export class MPlayer {
    constructor(options: {
      checkTime: number
      checkDuration: number
      sequenceGenOption?: Partial<MetronomeSequenceGenOption>
    })

    addMetronomeColor(name: string, metronomeColor: MetronomeColor): Promise<void>

    play(): Promise<void>

    pause(): void

    stop(): void

    dispose(): void

    get state(): 'stopped' | 'playing' | 'paused'

    get volume(): number

    set volume(value: number)

    get bpm(): number

    set bpm(value: number)

    get beatUnit(): number

    set beatUnit(value: number)

    get timeSignature(): TimeSignature

    set timeSignature(value: TimeSignature)

    get loop(): boolean

    set loop(value: boolean)

    get metronomeColor(): string

    set metronomeColor(name: string)

    set sequenceGenOption(opt: Partial<MetronomeSequenceGenOption>)

    set onProgressStart(cb: (progress: number, data: unknown) => void)

    set onProgressEnd(cb: (progress: number, data: unknown) => void)

    set onEnd(cb: () => void)
  }

  export function activeContext(): Promise<void>

  export function startJPlayer(): void
}
