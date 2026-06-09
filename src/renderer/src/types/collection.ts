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
  content: string
  description: string | null
  is_built_in: boolean
  owned: boolean
  thumbnail: string | null
  created_at?: string
  updated_at?: string
}

/** 单键钢琴皮肤 SVG 资源 */
export type VirtualPianoSkin = {
  normal: string
  press: string
  active: string
}

/** 88 键钢琴皮肤包，key 为 midi 21~108 */
export type VirtualPianoPack = Record<number, VirtualPianoSkin>
