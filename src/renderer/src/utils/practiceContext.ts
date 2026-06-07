import type { InjectionKey, Ref } from 'vue'

/** 练习模式页面上下文（设置弹窗等） */
export type PracticeContext = {
  /** 各复谱表单谱表数量的最大值，用于生成单谱表开关列表 */
  maxStaffCount: Ref<number>
  /** 当前 BPM（设置表单初始值） */
  bpm: Ref<number>
}

export const practiceContextKey: InjectionKey<PracticeContext> = Symbol('practiceContext')
