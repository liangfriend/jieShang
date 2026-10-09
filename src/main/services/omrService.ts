// src/main/services/omrService.ts
import { OmrError, OmrWorker, type RecognizeInfo } from '@deciphony/number-notation-omr'

export type OmrRecognizeResult =
  | {
      ok: true
      musicScore: unknown
      warnings: string[]
      info: Pick<
        RecognizeInfo,
        | 'rows'
        | 'measures'
        | 'notes'
        | 'keySignature'
        | 'keySignatureSource'
        | 'timeSignature'
        | 'timeSignatureSource'
        | 'elapsedMs'
      >
    }
  | { ok: false; code: 'BAD_IMAGE' | 'NO_NOTATION' | 'INTERNAL'; message: string }

/** 图片 → 简谱识别；识别在 worker_threads 中进行，空闲 60s 自动回收线程 */
export class OmrService {
  private omr = new OmrWorker({ idleTimeoutMs: 60_000 })

  async recognize(image: Buffer): Promise<OmrRecognizeResult> {
    try {
      const { musicScore, warnings, info } = await this.omr.recognize(image)
      return {
        ok: true,
        musicScore,
        warnings,
        info: {
          rows: info.rows,
          measures: info.measures,
          notes: info.notes,
          keySignature: info.keySignature,
          keySignatureSource: info.keySignatureSource,
          timeSignature: info.timeSignature,
          timeSignatureSource: info.timeSignatureSource,
          elapsedMs: info.elapsedMs
        }
      }
    } catch (e) {
      if (e instanceof OmrError) return { ok: false, code: e.code, message: e.message }
      return { ok: false, code: 'INTERNAL', message: (e as Error).message }
    }
  }

  terminate() {
    return this.omr.terminate()
  }
}
