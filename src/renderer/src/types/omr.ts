import type { KeySignatureTypeEnum, MusicScore, TimeSignatureTypeEnum } from '@deciphony/renderer'

/** 主进程 omr:recognize 返回（@deciphony/number-notation-omr） */
export type OmrRecognizeInfo = {
  rows: number
  measures: number
  notes: number
  keySignature: KeySignatureTypeEnum
  keySignatureSource: 'option' | 'detected' | 'default'
  timeSignature: TimeSignatureTypeEnum
  timeSignatureSource: 'option' | 'detected' | 'inferred' | 'default'
  elapsedMs: number
}

export type OmrErrorCode = 'BAD_IMAGE' | 'NO_NOTATION' | 'INTERNAL'

export type OmrPageResult = {
  musicScore: MusicScore
  warnings: string[]
  info: OmrRecognizeInfo
}

export type OmrRecognizeResult =
  | ({ ok: true } & OmrPageResult)
  | { ok: false; code: OmrErrorCode; message: string }
