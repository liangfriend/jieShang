/** 鼓机块：时值单位 Unit256（全音符 = 256，四分 = 64） */
export type DrumBlock = {
  duration: number
  active: boolean
}

export type DrumTrack = {
  id: string
  /** da-ji-yue.json 的键（序号 1~83） */
  sound: number
  /** 轨道音量 0~1 */
  volume: number
  muted: boolean
  solo: boolean
  /** 各块时值之和 = pattern.totalUnits */
  blocks: DrumBlock[]
}

/** 鼓机谱本体 */
export type DrumPattern = {
  /** 音轨区总时值（Unit256） */
  totalUnits: number
  tracks: DrumTrack[]
}

/** drum_machine.data 的 JSON 结构：谱本体在 pattern，其余为播放配置 */
export type DrumMachineData = {
  version: 1
  bpm: number
  /** 总音量 0~1 */
  volume: number
  /** 摇摆 0~DRUM_SWING_MAX：延后落在反拍上的块，最多延后 swing × swingUnit */
  swing: number
  /** 摇摆单位（Unit256）：推迟起点落在 unit 反拍上的块，如 64 = 每小节第 2、4 拍，32 = 八分反拍 */
  swingUnit: 128 | 64 | 32 | 16 | 8
  pattern: DrumPattern
}

export type DrumMachineRecord = {
  id: number
  name: string
  data: DrumMachineData
  created_at?: string
  updated_at?: string
}

/** 鼓机界面当前选中的块 */
export type DrumBlockSelection = { trackIndex: number; blockIndex: number }

export type DrumMachineListItem = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}
