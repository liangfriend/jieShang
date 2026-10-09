export type PanelSegmentedOption<V> = {
  value: V
  label: string
  /** 悬停提示；缺省用 label */
  title?: string
  disabled?: boolean
}

export type PanelTab = {
  name: string
  label: string
  /** 角标（如已添加的符号数）；0 / 缺省不显示 */
  badge?: number
}
