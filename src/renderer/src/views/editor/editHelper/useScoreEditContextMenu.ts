import { getMeasureSlots, MusicScoreTypeEnum } from '@deciphony/renderer'
import type { MusicScore, SingleStaff, SlotData, VDom } from '@deciphony/renderer'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { nextTick, ref, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { isFixedToneColorScore } from '@renderer/utils/isTabNotation'
import { EXCLUDED_INTERACTION_TAGS } from './constants'
import { deleteSelectedItem, deleteStaffRow, staffRowTargets } from './renderEditDelete'
import { insertMeasureColumn } from './renderEditMeasureColumn'
import {
  createEmptyContextMenuState,
  resolveContextMenuEntries,
  type EditContextMenuItem,
  type EditContextMenuPayload,
  type EditContextMenuState
} from './renderEditContextMenu'
import {
  clearMeasureNotes,
  copyMeasureNotes,
  hasMeasureNoteClipboard,
  pasteMeasureNotes,
  resolveContextMenuMeasureSlot
} from './renderEditMeasureNoteClipboard'
import { slotDataFromVDom } from './renderEditSelection'
import {
  copyGrandStaff,
  copySingleStaff,
  hasGrandStaffClipboard,
  hasStaffClipboard,
  pasteGrandStaff,
  pasteSingleStaff
} from './renderEditStaffClipboard'

export type UseScoreEditContextMenuOptions = {
  selectedItem: Ref<SlotData | null>
  clearSelection: () => void
  /**
   * 自定义菜单项；可在 onBeforeContextMenu 里同步改写。
   * 不传则使用内置：删除 + 小节复制/粘贴音符。
   */
  contextMenu?: MaybeRefOrGetter<EditContextMenuItem[]>
  onBeforeContextMenu?: (payload: EditContextMenuPayload) => void
}

/**
 * 曲谱编辑右键菜单：挂 dr-contextmenu / top-contextmenu，
 * 内置删除（与 Delete 同源）及小节音符复制/粘贴。
 */
export function useScoreEditContextMenu(
  musicScore: Ref<MusicScore>,
  options: UseScoreEditContextMenuOptions
) {
  const { t } = useI18n()
  const contextMenuState = ref<EditContextMenuState>(createEmptyContextMenuState())
  const contextMenuItems = ref<EditContextMenuItem[]>([])
  /** 「设置音色」目标单谱表；非 null 时宿主打开音色选择弹窗 */
  const toneColorStaff = ref<SingleStaff | null>(null)

  function closeContextMenu() {
    contextMenuState.value = createEmptyContextMenuState()
  }

  function buildPayload(event: MouseEvent, vDom: VDom | null): EditContextMenuPayload {
    const slot =
      vDom && !EXCLUDED_INTERACTION_TAGS.has(vDom.tag)
        ? (vDom.slotData ?? slotDataFromVDom(musicScore.value, vDom))
        : null
    return { event, vDom, slot }
  }

  function createDeleteContextMenuItem(
    overrides?: Partial<Omit<EditContextMenuItem, 'callback'>>
  ): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.delete'),
      danger: true,
      visible: (p) => p.slot != null,
      ...overrides,
      callback: (p) => {
        if (!p.slot) return
        if (!deleteSelectedItem(musicScore.value, p.slot)) return
        options.clearSelection()
      }
    }
  }

  function createCopyNotesContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.copyNotes'),
      visible: (p) =>
        resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value) != null,
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target) return
        copyMeasureNotes(target.measure, musicScore.value.type)
      }
    }
  }

  function createPasteNotesContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.pasteNotes'),
      visible: (p) =>
        resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value) != null,
      disabled: () => !hasMeasureNoteClipboard(musicScore.value.type),
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target) return
        pasteMeasureNotes(musicScore.value, target.measure)
      }
    }
  }

  function createClearNotesContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.clearNotes'),
      visible: (p) =>
        resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value) != null,
      disabled: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        return !target || getMeasureSlots(target.measure).length === 0
      },
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target) return
        const selected = options.selectedItem.value
        if (selected?.measure === target.measure && selected.self !== target.measure) {
          options.clearSelection()
        }
        clearMeasureNotes(musicScore.value, target.measure)
      }
    }
  }

  function resolveStaffTarget(p: EditContextMenuPayload) {
    const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
    if (!target?.grandStaff || !target.singleStaff) return null
    return { grandStaff: target.grandStaff, singleStaff: target.singleStaff }
  }

  function createCopyStaffContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.copyStaff'),
      visible: (p) => resolveStaffTarget(p) != null,
      callback: (p) => {
        const target = resolveStaffTarget(p)
        if (target) copySingleStaff(musicScore.value, target.singleStaff)
      }
    }
  }

  function createPasteStaffContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.pasteStaff'),
      visible: (p) => resolveStaffTarget(p) != null,
      disabled: () => !hasStaffClipboard(musicScore.value.type),
      callback: (p) => {
        const target = resolveStaffTarget(p)
        if (!target) return
        options.clearSelection()
        pasteSingleStaff(musicScore.value, target.grandStaff, target.singleStaff)
      }
    }
  }

  function createCopyGrandStaffContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.copyGrandStaff'),
      visible: (p) => resolveStaffTarget(p) != null,
      callback: (p) => {
        const target = resolveStaffTarget(p)
        if (target) copyGrandStaff(musicScore.value, target.grandStaff)
      }
    }
  }

  function createPasteGrandStaffContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.pasteGrandStaff'),
      visible: (p) => resolveStaffTarget(p) != null,
      disabled: () => !hasGrandStaffClipboard(musicScore.value.type),
      callback: (p) => {
        const target = resolveStaffTarget(p)
        if (!target) return
        options.clearSelection()
        pasteGrandStaff(musicScore.value, target.grandStaff)
      }
    }
  }

  function withText(item: EditContextMenuItem, text: string): EditContextMenuItem {
    return { ...item, text }
  }

  /** 一级「复制」，二级：小节 / 单谱表 / 复谱表 */
  function createCopyContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.copy'),
      children: [
        withText(createCopyNotesContextMenuItem(), t('editor.contextMenu.measure')),
        withText(createCopyStaffContextMenuItem(), t('editor.contextMenu.staff')),
        withText(createCopyGrandStaffContextMenuItem(), t('editor.contextMenu.grandStaff'))
      ]
    }
  }

  /** 一级「粘贴」，二级：小节 / 单谱表 / 复谱表 */
  function createPasteContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.paste'),
      children: [
        withText(createPasteNotesContextMenuItem(), t('editor.contextMenu.measure')),
        withText(createPasteStaffContextMenuItem(), t('editor.contextMenu.staff')),
        withText(createPasteGrandStaffContextMenuItem(), t('editor.contextMenu.grandStaff'))
      ]
    }
  }

  /** 一级「增加小节」，二级：左 / 右（整列插入） */
  function createInsertMeasureContextMenuItem(): EditContextMenuItem {
    const side = (position: 'before' | 'after'): EditContextMenuItem => ({
      text: t(position === 'before' ? 'editor.contextMenu.left' : 'editor.contextMenu.right'),
      visible: (p) => resolveStaffTarget(p) != null,
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target?.singleStaff) return
        insertMeasureColumn(musicScore.value, target.singleStaff, target.measure, position)
      }
    })
    return {
      text: t('editor.contextMenu.addMeasure'),
      children: [side('before'), side('after')]
    }
  }

  function staffRowIndex(p: EditContextMenuPayload) {
    const target = resolveStaffTarget(p)
    return target ? target.grandStaff.staves.indexOf(target.singleStaff) : -1
  }

  /** 删除所有复谱表中与当前单谱表同索引的单谱表 */
  function createDeleteStaffRowContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.deleteStaffRow'),
      danger: true,
      visible: (p) => staffRowIndex(p) >= 0,
      disabled: (p) => !staffRowTargets(musicScore.value, staffRowIndex(p)).deletable,
      callback: (p) => {
        const index = staffRowIndex(p)
        if (index < 0) return
        options.clearSelection()
        deleteStaffRow(musicScore.value, index)
      }
    }
  }

  function createSetToneColorContextMenuItem(): EditContextMenuItem {
    return {
      text: t('editor.contextMenu.setToneColor'),
      visible: (p) =>
        !isFixedToneColorScore(musicScore.value) &&
        resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)?.singleStaff != null,
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target?.singleStaff) return
        toneColorStaff.value = target.singleStaff
      }
    }
  }

  /** 鼓谱：小节设为 / 取消长休止符 */
  function createLongRestContextMenuItem(enable: boolean): EditContextMenuItem {
    return {
      text: t(enable ? 'editor.contextMenu.longRest' : 'editor.contextMenu.cancelLongRest'),
      visible: (p) => {
        if (musicScore.value.type !== MusicScoreTypeEnum.DrumNotation) return false
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        return target != null && !!target.measure.longRest !== enable
      },
      callback: (p) => {
        const target = resolveContextMenuMeasureSlot(p.slot, options.selectedItem.value)
        if (!target) return
        target.measure.longRest = enable
        const selected = options.selectedItem.value
        if (enable && selected?.measure === target.measure && selected.self !== target.measure) {
          options.clearSelection()
        }
      }
    }
  }

  function buildDefaultItems(): EditContextMenuItem[] {
    return [
      createDeleteContextMenuItem(),
      createLongRestContextMenuItem(true),
      createLongRestContextMenuItem(false),
      createCopyContextMenuItem(),
      createPasteContextMenuItem(),
      createClearNotesContextMenuItem(),
      createInsertMeasureContextMenuItem(),
      createDeleteStaffRowContextMenuItem(),
      createSetToneColorContextMenuItem()
    ]
  }

  async function openContextMenu(event: MouseEvent, vDom: VDom | null) {
    event.preventDefault()
    const payload = buildPayload(event, vDom)

    if (options.contextMenu) {
      options.onBeforeContextMenu?.(payload)
      await nextTick()
      const items = resolveContextMenuEntries(toValue(options.contextMenu) ?? [], payload)
      if (!items.length) {
        closeContextMenu()
        return
      }
      contextMenuState.value = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        items,
        payload
      }
      return
    }

    contextMenuItems.value = buildDefaultItems()
    options.onBeforeContextMenu?.(payload)
    await nextTick()
    const items = resolveContextMenuEntries(contextMenuItems.value, payload)
    if (!items.length) {
      closeContextMenu()
      return
    }
    contextMenuState.value = {
      open: true,
      x: event.clientX,
      y: event.clientY,
      items,
      payload
    }
  }

  function handleDrContextMenu(event: MouseEvent, vDom: VDom) {
    void openContextMenu(event, vDom)
  }

  function handleTopContextMenu(event: MouseEvent, vDom: VDom | null) {
    void openContextMenu(event, vDom)
  }

  return {
    contextMenuState,
    contextMenuItems,
    toneColorStaff,
    closeContextMenu,
    createDeleteContextMenuItem,
    createCopyNotesContextMenuItem,
    createPasteNotesContextMenuItem,
    createClearNotesContextMenuItem,
    createCopyStaffContextMenuItem,
    createPasteStaffContextMenuItem,
    createCopyGrandStaffContextMenuItem,
    createPasteGrandStaffContextMenuItem,
    createCopyContextMenuItem,
    createPasteContextMenuItem,
    createInsertMeasureContextMenuItem,
    createDeleteStaffRowContextMenuItem,
    createSetToneColorContextMenuItem,
    createLongRestContextMenuItem,
    handleDrContextMenu,
    handleTopContextMenu
  }
}
