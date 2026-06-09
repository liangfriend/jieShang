/** 藏品类型（渲染层枚举值，与业务文档一致） */
export enum CollectionTypeEnum {
  VirtualPianoSkin = 'virtualPianoSkin',
  PerformSkin = 'performSkin',
  ToneColor = 'toneColor',
  ScoreSkin = 'scoreSkin'
}

/** 数据库 / IPC 使用的藏品类型（snake_case） */
export type CollectionDbType = 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'

export type CollectionRecord = {
  id: number
  type: CollectionDbType
  name: string
  content: string
  description: string | null
  is_built_in: boolean
  owned: boolean
  thumbnail: string | null
  created_at?: string
  updated_at?: string
}

/**
 * 单键钢琴皮肤资源：可直接用于 background-image 的 url
 * （SVG data URL，将来也可换成线上 svg 路径）
 */
export type VirtualPianoSkin = {
  normal: string // 正常情况下皮肤
  press: string // 按下皮肤
  active: string // 这个暂时没有用到，预留字段
}

/**
 * 钢琴皮肤包（即 piano_skin 的 content JSON）：key 为 midi 21~108，
 * 每个琴键单独一份皮肤，确保灵活性（不同键可用不同样式）。
 */
export type VirtualPianoPack = Record<number, VirtualPianoSkin>
