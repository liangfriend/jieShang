import type { VDom } from 'deciphony-renderer'
import {
  isNumberNotationSkinKey,
  resolveStandardNoteHeadShape
} from './noteHeadOutlinePaths'
import type { NoteHeadGeometry, NoteHeadShapeKind } from './types'

type VDomBox = VDom & { x?: number; y?: number; w?: number; h?: number }

function readVDomBox(node: VDom): Pick<NoteHeadGeometry, 'x' | 'y' | 'w' | 'h'> | null {
  const n = node as VDomBox
  if (typeof n.x !== 'number' || typeof n.y !== 'number') return null
  const w = n.w ?? 0
  const h = n.h ?? 0
  if (w <= 0 || h <= 0) return null
  return { x: n.x, y: n.y, w, h }
}

function readDomBox(el: SVGElement): Pick<NoteHeadGeometry, 'x' | 'y' | 'w' | 'h'> | null {
  if (!(el instanceof SVGGraphicsElement)) return null
  const box = el.getBBox()
  if (box.width <= 0 || box.height <= 0) return null
  return { x: box.x, y: box.y, w: box.width, h: box.height }
}

function normalizeNoteId(noteId: unknown): string | null {
  if (noteId == null) return null
  const id = String(noteId).trim()
  return id || null
}

function resolveShapeKind(tag: 'noteHead' | 'rest', skinKey?: string): NoteHeadShapeKind {
  if (tag === 'rest') return 'rest'
  const standard = resolveStandardNoteHeadShape(skinKey)
  if (standard === 'whole') return 'standard-whole'
  if (standard === 'tilted-ring') return 'standard-tilted-ring'
  if (standard === 'tilted-filled') return 'standard-tilted-filled'
  if (isNumberNotationSkinKey(skinKey)) return 'number'
  return 'fallback'
}

/**
 * 从 vDom 列表构建 noteId → 符头/休止符几何（SVG 用户坐标）。
 * 优先 noteHead；无符头时用 rest。vDom 缺尺寸时回退 DOM getBBox。
 */
export function buildNoteHeadGeometryIndex(
  vDomList: readonly VDom[],
  findElementByVDom?: (node: VDom) => SVGElement | null
): Map<string, NoteHeadGeometry> {
  const map = new Map<string, NoteHeadGeometry>()

  for (const node of vDomList) {
    if (node.tag !== 'noteHead' && node.tag !== 'rest') continue
    const noteId = normalizeNoteId(node.targetId)
    if (!noteId) continue
    if (node.tag === 'rest' && map.has(noteId)) continue

    let box = readVDomBox(node)
    if (!box && findElementByVDom) {
      const el = findElementByVDom(node)
      if (el) box = readDomBox(el)
    }
    if (!box) continue

    const skinKey = node.skinKey as string | undefined
    map.set(noteId, {
      noteId,
      ...box,
      tag: node.tag,
      skinKey,
      shapeKind: resolveShapeKind(node.tag, skinKey)
    })
  }

  return map
}

export function findNoteHeadVDom(vDomList: readonly VDom[], noteId: string): VDom | null {
  const id = noteId.trim()
  if (!id) return null
  return (
    vDomList.find((node) => node.tag === 'noteHead' && node.targetId === id) ??
    vDomList.find((node) => node.tag === 'rest' && node.targetId === id) ??
    null
  )
}
