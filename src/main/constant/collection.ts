/** 藏品类型 */
export const COLLECTION_TYPE = {
  /** 音色，content 为 JSON，传入 NPlayer */
  TONE_COLOR: 'tone_color',
  /** 曲谱皮肤，content 为 deciphony-renderer 皮肤 JSON */
  SCORE_SKIN: 'score_skin',
  /** 钢琴皮肤，content 为 SVG data URL 字符串 */
  PIANO_SKIN: 'piano_skin',
  /** 演奏皮肤，content 为内置皮肤名称（见 PerformSkinNameList） */
  PERFORM_SKIN: 'perform_skin'
} as const

export type CollectionType = (typeof COLLECTION_TYPE)[keyof typeof COLLECTION_TYPE]
