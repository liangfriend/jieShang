import type { InjectionKey, Ref } from 'vue'

/** 练习模式页面上下文（设置弹窗等） */
export type PracticeContext = {
  /** 各复谱表单谱表数量的最大值，用于生成单谱表开关列表 */
  maxStaffCount: Ref<number>
  /** 当前 BPM（设置表单初始值） */
  bpm: Ref<number>
  /** 演示播放中（含倒计时） */
  demoSession: Ref<boolean>
  /** 演示倒计时剩余秒数，0 表示不在倒计时 */
  demoCountdown: Ref<number>
  handleToggleDemo: () => Promise<void>
}

export const practiceContextKey: InjectionKey<PracticeContext> = Symbol('practiceContext')
