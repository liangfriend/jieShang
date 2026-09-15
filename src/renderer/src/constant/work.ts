/** 新建未保存作品临时键（对应 query 仅 tempId，保存为新增） */
export const EDIT_NEW_WORK_TEMP_ID = 'editNewWork' as const

/** 已有作品 edit/show 切换时的临时键（与 workId 同现，保存为更新） */
export const CUR_SHOW_WORK_TEMP_ID = 'curShowWork' as const

/** 作品页进入演唱模式时写入 tempScoreMap 的键 */
export const WORK_SINGING_SCORE_TEMP_ID = 'workSingingScore' as const

export function workSingingVocalAudioKey(scoreId: string): string {
  return `work-vocal-${scoreId}`
}

export function workSingingAccompanimentAudioKey(scoreId: string): string {
  return `work-accomp-${scoreId}`
}
