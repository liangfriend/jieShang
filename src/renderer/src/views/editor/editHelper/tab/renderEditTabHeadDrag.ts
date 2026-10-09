import type {MusicScore, TabNote, TabNoteInfo, VDom} from '@deciphony/renderer'
import {isTabHeadInfo, setTabNoteInfoRegion} from '@deciphony/extensions/dr-edit'
import {pointerToSvg} from '../standardStaff/renderEditSymbolAddAction'
import {tabRegionFromRelativeY, tabStaffFrame} from './renderEditTabAddAction'

type TabHeadInfo = TabNoteInfo & {region: number}

export type TabHeadDragSession = {
  pointerId: number
  notesInfoId: string
  info: TabHeadInfo
  note: TabNote
  measureId: string
}

export function createTabHeadDragSession(
  event: PointerEvent,
  info: TabNoteInfo,
  note: TabNote,
  measureId: string,
): TabHeadDragSession | null {
  if (!isTabHeadInfo(info)) return null
  const head = info as TabHeadInfo
  return {
    pointerId: event.pointerId,
    notesInfoId: head.id,
    info: head,
    note,
    measureId,
  }
}

/** 按指针 y 更新弦位 region，返回新 region（未变化则为 null） */
export function updateTabHeadRegionByPointerY(
  session: TabHeadDragSession,
  vDomList: VDom[],
  svgY: number,
  stringCount: number,
): number | null {
  const frame = tabStaffFrame(vDomList, session.measureId)
  if (!frame) return null
  const region = tabRegionFromRelativeY(svgY - frame.y, frame.h, stringCount)
  return setTabNoteInfoRegion(session.info, region, stringCount, session.note) ? region : null
}

/**
 * 在顶层 svg 上跟踪指针，按小节 TAB 弦框换算 region。
 * 与 deciphony-test / 五线符头拖一致：直接改源数据，由 musicScore deep watch 整谱刷新。
 */
export function updateTabHeadDragFromPointer(
  session: TabHeadDragSession,
  svg: SVGSVGElement,
  vDomList: VDom[],
  clientX: number,
  clientY: number,
  stringCount: number,
): number | null {
  const {y} = pointerToSvg(svg, clientX, clientY)
  return updateTabHeadRegionByPointerY(session, vDomList, y, stringCount)
}

/** @deprecated 使用 updateTabHeadDragFromPointer */
export function previewTabHeadRegionDrag(
  _musicScore: MusicScore,
  _getUpdateVDom: () => unknown,
  session: TabHeadDragSession,
  vDomList: VDom[],
  svgY: number,
  stringCount: number,
): number | null {
  return updateTabHeadRegionByPointerY(session, vDomList, svgY, stringCount)
}
