import type {Chronaxie} from 'deciphony-renderer'

/** 小节添加模式：待插入的符号类型 */
export type AddNoteSlotKind = 'note' | 'rest'

export type AddNoteState = {
  kind: AddNoteSlotKind
  chronaxie: Chronaxie
}

export const DEFAULT_ADD_NOTE_STATE: AddNoteState = {
  kind: 'note',
  chronaxie: 64,
}

export const ADD_NOTE_KIND_VALUES: AddNoteSlotKind[] = ['note', 'rest']

/** 时值选项（chronaxie 越大音符越长） */
export const CHRONAXIE_VALUES: Chronaxie[] = [256, 128, 64, 32, 16, 8, 4, 2]

/** 休止符时值选项（chronaxie 与 renderer 休止符一致） */
export const REST_CHRONAXIE_VALUES: Chronaxie[] = [256, 128, 64, 32, 16, 8, 4, 2]

export function chronaxieValuesForKind(kind: AddNoteSlotKind) {
  return kind === 'rest' ? REST_CHRONAXIE_VALUES : CHRONAXIE_VALUES
}
