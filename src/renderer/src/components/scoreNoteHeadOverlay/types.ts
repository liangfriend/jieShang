import type { NoteScoreResult } from '@renderer/types/types'

export type BeginnerNoteProgressState = 'current' | 'done'

export type NoteHeadShapeKind =
  | 'standard-whole'
  | 'standard-tilted-ring'
  | 'standard-tilted-filled'
  | 'number'
  | 'rest'
  | 'fallback'

export type NoteHeadGeometry = {
  noteId: string
  x: number
  y: number
  w: number
  h: number
  tag: 'noteHead' | 'rest'
  skinKey?: string
  shapeKind: NoteHeadShapeKind
}

export type NoteHeadMarkerKind = 'play' | 'result' | 'beginner'

export type NoteHeadMarkerStyle = {
  kind: NoteHeadMarkerKind
  result?: NoteScoreResult
  beginnerState?: BeginnerNoteProgressState
}

export type ScoreNoteHeadOverlayApi = {
  onRenderMusicScore: (list: readonly import('deciphony-renderer').VDom[]) => void
  setPlayActive: (noteIdInput: unknown, active: boolean) => void
  clearPlay: () => void
  setNoteResult: (noteIdInput: unknown, result: NoteScoreResult | null) => void
  clearResults: () => void
  setResultsVisible: (visible: boolean) => void
  setBeginnerState: (noteIdInput: unknown, state: BeginnerNoteProgressState | null) => void
  clearBeginner: () => void
  markBeginnerBatchDone: (noteIds: unknown[]) => void
  setBeginnerCurrentBatch: (noteIds: unknown[]) => void
  clearAll: () => void
  resize: () => void
}
