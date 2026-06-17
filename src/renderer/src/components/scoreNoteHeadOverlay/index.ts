export type {
  BeginnerNoteProgressState,
  NoteHeadGeometry,
  NoteHeadMarkerKind,
  NoteHeadMarkerStyle,
  NoteHeadShapeKind,
  ScoreNoteHeadOverlayApi
} from './types'
export {
  resolveStandardNoteHeadShape,
  isNumberNotationSkinKey,
  STANDARD_WHOLE_NOTE_RING_PATH,
  STANDARD_TILTED_RING_PATH
} from './noteHeadOutlinePaths'
export { buildNoteHeadGeometryIndex, findNoteHeadVDom } from './noteHeadGeometry'
export { drawNoteHeadMarker } from './drawNoteHeadMarker'
export { createScoreNoteHeadOverlay } from './createScoreNoteHeadOverlay'
export type { CreateScoreNoteHeadOverlayDeps } from './createScoreNoteHeadOverlay'
export { default as ScoreNoteHeadOverlay } from './ScoreNoteHeadOverlay.vue'
