<script lang="ts" setup>
import musicScoreVue from '@deciphony/renderer'
import { isNumberNotationSlur, MusicScoreTypeEnum, type MusicScore, type VDom } from '@deciphony/renderer'
import { isSlurSelected } from '@renderer/views/editor/editHelper/renderEditSlurDrag'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useBoxSelect } from '@renderer/views/editor/editHelper/useBoxSelect'
import { useLyricsFocusHighlight } from '@renderer/views/editor/editHelper/useLyricsFocusHighlight'
import { deleteMultiSelected } from '@renderer/views/editor/editHelper/renderEditMultiSelect'
import type { MusicScoreComponentExpose } from '@renderer/views/editor/editHelper/useRenderEdit'
import {
  AddNoteStatePanel,
  AddNumberStatePanel,
  EditContextMenu,
  EditSlotGdButtons,
  EditSlotSdButtons,
  GhostNotePreview,
  GhostNumberPreview,
  HorizontalDragHandles,
  MoveDragHandle,
  PropertyPanel,
  SlurDragHandles,
  VerticalDragHandles,
  VoltaDragHandles,
  useRenderEdit
} from '@renderer/views/editor/editHelper'
import AddTabStatePanel from '@renderer/views/editor/editHelper/tab/components/AddTabStatePanel.vue'
import GhostTabPreview from '@renderer/views/editor/editHelper/tab/components/GhostTabPreview.vue'
import AddDrumStatePanel from '@renderer/views/editor/editHelper/drumNotation/components/AddDrumStatePanel.vue'
import GhostDrumPreview from '@renderer/views/editor/editHelper/drumNotation/components/GhostDrumPreview.vue'
import { tabStringCount } from '@deciphony/extensions/dr-edit'
import { isTabNotationType } from '@renderer/utils/isTabNotation'
import type { AddNoteState } from '@renderer/views/editor/editHelper/renderEditAddNoteState'
import {
  OCTAVE_DOT_PRESET_VALUES,
  type AddNumberState
} from '@renderer/views/editor/editHelper/numberNotation/renderEditNumberAddState'
import type { AddTabState } from '@renderer/views/editor/editHelper/tab/renderEditTabAddState'
import type { AddDrumState } from '@renderer/views/editor/editHelper/drumNotation/renderEditDrumAddState'
import {
  addGrandStaffFromSelected,
  addSingleStaffFromSelected,
  appendDrumNoteToSelectedMeasure,
  appendNumberNoteToSelectedMeasure,
  appendStaffNoteToSelectedMeasure,
  chronaxieForDigit,
  drumAcceptsChronaxie,
  numberNoteForLetterCode,
  toggleDrumRestKind,
  toggleNoteRestKind,
  toggleTabRestKind
} from '@renderer/views/editor/editHelper/renderEditKeyboardShortcuts'
import { runStandardModeAdd } from '@renderer/views/editor/editHelper/renderEditStandardMode'
import { applySlurShortcut, removeSlursOfCurrent } from '@renderer/views/editor/editHelper/renderEditSlurShortcut'
import {
  applyAddGraceShortcut,
  applyClearGraceNotes,
  applyCycleNoteChronaxie
} from '@renderer/views/editor/editHelper/renderEditGraceShortcut'
import { duplicateMeasureNotes } from '@renderer/views/editor/editHelper/renderEditMeasureNoteClipboard'
import { resolveNeighborMeasureSlot } from '@renderer/views/editor/editHelper/renderEditMeasureNavigate'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  applyRhythmPatternOption,
  buildRhythmPatternOptions,
  resolveRhythmPatternTarget,
  rhythmPatternIndexForCode,
  type RhythmPatternMode,
  type RhythmPatternOption,
  type RhythmPatternTarget
} from '@renderer/views/editor/editHelper/renderEditRhythmPattern'
import RhythmPatternPopup from '@renderer/views/editor/editHelper/components/RhythmPatternPopup.vue'
import { deleteLastSlotInMeasure } from '@renderer/views/editor/editHelper/renderEditDelete'
import {
  cycleSlotBarline,
  type MeasureEditSlot
} from '@renderer/views/editor/editHelper/renderEditMeasureProperties'
import { isMeasureAddMode } from '@renderer/views/editor/editHelper/standardStaff/renderEditSymbolAddAction'
import { findDrumLegalNoteByShortcut } from '@renderer/utils/drumLegalNotes'
import { isEditableTarget, shortcutKey } from '@renderer/utils/shortcutKey'
import { TitleSlot } from '@deciphony/extensions/dr-title'
import { LyricsSlot } from '@deciphony/extensions/dr-lyrics'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useMidiStore } from '@renderer/store/midi.store'
import StaffToneColorDialog from '@renderer/views/editor/StaffToneColorDialog.vue'
import StaffVolumeDialog from '@renderer/views/editor/StaffVolumeDialog.vue'
import { provideEditorSkinPack } from '@renderer/views/editor/editHelper/editorSkin'

const musicScoreData = defineModel<MusicScore>({ required: true })
/** 音值组合模式：工具栏切换，浮窗内按 Tab 也会改 */
const rhythmPatternMode = defineModel<RhythmPatternMode>('rhythmPatternMode', { default: 'beat' })

withDefaults(
  defineProps<{
    /** 显示小节/谱表结构按钮；关闭后隐藏按钮，插槽高度保留 */
    structureEditEnabled?: boolean
    /** 显示歌词区；关闭后隐藏，插槽高度保留 */
    lyricsEditEnabled?: boolean
  }>(),
  {
    structureEditEnabled: true,
    lyricsEditEnabled: true
  }
)

const musicScoreRef = ref<MusicScoreComponentExpose | null>(null)
const isNumberNotation = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.NumberNotation
)
const isTabNotation = computed(() => isTabNotationType(musicScoreData.value.type))
const isDrumNotation = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.DrumNotation
)
const tabStrings = computed(() => tabStringCount(musicScoreData.value.type))
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()
provideEditorSkinPack(() =>
  scoreSkinName.value ? scoreSkin.value?.[scoreSkinName.value] : undefined
)
const {
  extensions: scoreExtensions,
  slotProps: lyricsSlotProps,
  slotConfig: scoreSlotConfig,
  titlePadding,
  titleFontFamily
} = createScoreLyricsExtension('edit', musicScoreData)

const {
  scoreRootRef,
  selectedItem,
  selectedEl,
  addNoteState,
  addTabState,
  addDrumState,
  activeGhostPreview,
  propertyPanelKind,
  isMeasureSelected,
  slurHandlePoints,
  voltaHandlePoints,
  arpeggioHandlePoints,
  strummingHandlePoints,
  pedalHandlePoints,
  pitchHandlePoints,
  lineHandlePoints,
  noteAffiliatedBox,
  relatedMeasureIds,
  handleDrClick,
  handleDrEnter,
  handleDrLeave,
  handleDrDown,
  handleDrUp,
  handleSlurHandleDown,
  handleVoltaHandleDown,
  handleArpeggioHandleDown,
  handleStrummingHandleDown,
  handlePedalHandleDown,
  handlePitchHandleDown,
  handleLineHandleDown,
  handleNoteAffiliatedHandleDown,
  handleTopMove,
  handleTopUp,
  handleDrContextMenu,
  handleTopContextMenu,
  handleRenderMusicScore,
  deleteSelected,
  navigateSelectedMeasure,
  selectMeasureSlot,
  addMidiNote,
  addTabFretByKey,
  clearSelection,
  contextMenuState,
  closeContextMenu,
  toneColorStaff,
  volumeStaff
} = useRenderEdit(musicScoreData, { musicScoreRef })

const boxSelect = useBoxSelect({
  musicScore: musicScoreData,
  scoreRootRef,
  enabled: () => true,
  clearSelection
})
const { multiSelected, boxRect } = boxSelect

watch(selectedItem, (item) => {
  if (item) boxSelect.clearMultiSelected()
})

/** 选中连音线按自身 style（缺省按谱种）决定圆润 / 尖锐拖拽框 */
const slurUsesRoundedDragHandles = computed(() => {
  if (isSlurSelected(selectedItem.value)) {
    return isNumberNotationSlur(
      musicScoreData.value.type,
      selectedItem.value.self.data.slur?.style
    )
  }
  return isNumberNotation.value
})

const { onLyricsCellFocus, onLyricsCellBlur, refreshLyricsFocusHighlight } =
  useLyricsFocusHighlight(scoreRootRef)

function onRenderMusicScore(list: VDom[]) {
  handleRenderMusicScore(list)
  boxSelect.handleRender(list)
  refreshLyricsFocusHighlight()
}

function onTopUp(event: PointerEvent, vDom: VDom | null) {
  if (boxSelect.isPointerUpSuppressed()) return
  handleTopUp(event, vDom)
}

function onDrClick(event: MouseEvent, vDom: VDom) {
  if (boxSelect.isPointerUpSuppressed()) return
  handleDrClick(event, vDom)
}

const midiStore = useMidiStore()

const ARROW_TO_MEASURE_NAV = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
} as const
/**
 * 谱面上的拖拽（如 TAB 品格换弦）会 preventDefault 掉 pointerdown，浏览器不再把焦点移出属性栏输入框，
 * 之后 Delete 等快捷键会被 isEditableTarget 当成在打字而忽略
 */
function releaseEditableFocus(event: PointerEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return
  const active = document.activeElement
  if (active instanceof HTMLElement && isEditableTarget(active)) active.blur()
}

/** 0：切换音符 / 休止符 */
function toggleAddKind() {
  if (isTabNotation.value) {
    addTabState.value = toggleTabRestKind(addTabState.value as AddTabState)
  } else if (isDrumNotation.value) {
    addDrumState.value = toggleDrumRestKind(addDrumState.value as AddDrumState)
  } else {
    addNoteState.value = toggleNoteRestKind(addNoteState.value as AddNoteState | AddNumberState)
  }
}

/** 1–8：切换添加时值 */
function setAddChronaxie(digit: number) {
  const chronaxie = chronaxieForDigit(digit)
  if (chronaxie == null) return
  if (isTabNotation.value) {
    addTabState.value = { ...(addTabState.value as AddTabState), chronaxie }
  } else if (isDrumNotation.value) {
    if (!drumAcceptsChronaxie(chronaxie)) return
    addDrumState.value = { ...(addDrumState.value as AddDrumState), chronaxie }
  } else {
    addNoteState.value = { ...(addNoteState.value as AddNoteState), chronaxie }
  }
}

/** 简谱主键盘 8 / 9：工具栏八度点 -1 / +1，限制在预设范围内 */
function stepAddOctaveDot(step: -1 | 1) {
  const state = addNoteState.value as AddNumberState
  const min = Math.min(...OCTAVE_DOT_PRESET_VALUES)
  const max = Math.max(...OCTAVE_DOT_PRESET_VALUES)
  const octaveDot = Math.min(max, Math.max(min, (state.octaveDot ?? 0) + step))
  addNoteState.value = { ...state, octaveDot: octaveDot as AddNumberState['octaveDot'] }
}

const { t } = useI18n()

/** TAB 字母键对应的品：p 留给「复制到下一小节」，q 起顺延 */
const TAB_FRET_LETTERS = 'ABCDEFGHIJKLMNOQRSTUVWXYZ'

function currentVoice() {
  return isDrumNotation.value ? (addDrumState.value as AddDrumState).voice : 'up'
}

/** 键盘录入统一走标准模式：超出小节时挪到下一小节并选中 */
function appendByKey(append: () => boolean): boolean {
  runStandardModeAdd(selectedItem.value, currentVoice(), append, selectMeasureSlot)
  return true
}

/** 简谱与线谱共用唱名键位：主键盘数字、q–u / a–j / z–m 直接录音，时值切换走小键盘 */
const usesSolfegeKeys = computed(
  () => isNumberNotation.value || musicScoreData.value.type === MusicScoreTypeEnum.StandardStaff
)

/** syllable 0 为休止符；octaveDot 为相对中音的八度 */
function appendSolfegeByKey(
  syllable: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
  octaveDot: AddNumberState['octaveDot']
): boolean {
  return appendByKey(() =>
    isNumberNotation.value
      ? appendNumberNoteToSelectedMeasure(
          selectedItem.value,
          syllable,
          addNoteState.value as AddNumberState,
          octaveDot
        )
      : appendStaffNoteToSelectedMeasure(
          selectedItem.value,
          syllable,
          addNoteState.value as AddNoteState,
          octaveDot
        )
  )
}

/** P：把选中小节的音符复制到下一小节（替换），并选中下一小节，连按可一路往后复制 */
function copyMeasureToNext(): boolean {
  const selected = selectedItem.value
  if (!isMeasureAddMode(selected)) return false
  const next = resolveNeighborMeasureSlot(selected, 'right')
  if (!next?.measure) {
    ElMessage.warning(t('editor.standardMode.noNextMeasure'))
    return true
  }
  duplicateMeasureNotes(selected.musicScore, selected.measure, next.measure)
  selectMeasureSlot(next)
  return true
}

/**
 * 数字键、字母键与 / * - { } < > ; ' L P 快捷键。
 * 简谱 / 线谱主键盘 1–7 录入中音、0 / ~ / i / k 录入休止符，q–u 高音、a–j 中音、z–m 低音（线谱按调号换算音高）；
 * 简谱 8 / 9 降 / 升工具栏八度点；时值与音符休止符切换走小键盘；鼓谱、TAB 两排数字键都切时值。
 * 鼓谱 a、b、c…（跳过 p）在选中小节末尾录入对应合法音符（按物理键位判断，输入法中文态也生效）。
 * TAB a、b、c…（跳过 p）依次为 0、1、2… 品：改工具栏品，选中小节且鼠标在小节内时同时写入鼠标所指的弦与列。
 * < > 连音线（选中小节时取最后一个音），/ 删连音线，{ } 小节线；; ' 前后倚音，L 清空倚音，O 循环主音符时值。
 */
function handleEditShortcutKey(event: KeyboardEvent, key: string): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  const score = musicScoreData.value

  if (event.code === 'KeyP') return copyMeasureToNext()

  // 按逗号 / 句号键本身判断，Shift 可按可不按：中文输入法常吞掉 Shift，只给出「，」「。」
  // < 等同 {（往左连 / 左扩），> 等同 }（往右连 / 右扩）；选中小节时取最后一个音，无需先点音符
  const slurSide =
    event.code === 'Comma' || key === '<' ? 'left' : event.code === 'Period' || key === '>' ? 'right' : null
  if (slurSide) {
    return applySlurShortcut(selectedItem.value, slurSide, currentVoice())
  }

  if (key === '/') {
    removeSlursOfCurrent(selectedItem.value, currentVoice())
    return true
  }

  // ; 前倚音、' 后倚音：按键位判断，Shift 可按可不按；选中小节时取最后一个音
  if (event.code === 'Semicolon' || key === ';') {
    return applyAddGraceShortcut(selectedItem.value, 'before', currentVoice())
  }
  if (event.code === 'Quote' || key === "'" || key === '"') {
    return applyAddGraceShortcut(selectedItem.value, 'after', currentVoice())
  }

  // L：清空目标音上的倚音；有可清目标时优先于 TAB 品位 / 鼓谱字母
  if (event.code === 'KeyL' || key === 'l' || key === 'L') {
    if (applyClearGraceNotes(selectedItem.value, currentVoice())) return true
  }

  // O：循环主音符 / 休止符时值；有可改目标时优先于 TAB 品位 / 鼓谱字母
  if (event.code === 'KeyO' || key === 'o' || key === 'O') {
    if (applyCycleNoteChronaxie(selectedItem.value, currentVoice())) return true
  }

  // { }：前置 / 后置小节线循环；按键位判断，Shift 可按可不按
  if (event.code === 'BracketLeft' || event.code === 'BracketRight') {
    const selected = selectedItem.value
    if (!isMeasureAddMode(selected) || !selected.singleStaff) return false
    cycleSlotBarline(selected as MeasureEditSlot, event.code === 'BracketLeft' ? 'f' : 'b')
    return true
  }

  const letter = /^Key([A-Z])$/.exec(event.code)?.[1]
  if (letter && isTabNotation.value) {
    const fret = TAB_FRET_LETTERS.indexOf(letter)
    return fret >= 0 && addTabFretByKey(fret)
  }
  if (letter && isDrumNotation.value) {
    const legal = findDrumLegalNoteByShortcut(letter)
    if (!legal) return false
    return appendByKey(() =>
      appendDrumNoteToSelectedMeasure(selectedItem.value, legal, addDrumState.value as AddDrumState)
    )
  }
  if (usesSolfegeKeys.value) {
    const lettered = numberNoteForLetterCode(event.code)
    if (lettered) return appendSolfegeByKey(lettered.syllable, lettered.octaveDot)
    // i / k 与 0 / ~ 一样录入休止符（中排字母空出来的键）
    if (event.code === 'KeyI' || event.code === 'KeyK' || event.code === 'Backquote') {
      return appendSolfegeByKey(0, 0)
    }
  }
  if (key === '*') {
    addSingleStaffFromSelected(selectedItem.value, score)
    return true
  }
  if (key === '-') {
    addGrandStaffFromSelected(selectedItem.value, score)
    return true
  }

  if (!/^[0-9]$/.test(key)) return false
  const digit = Number(key)
  const fromNumpad = event.code.startsWith('Numpad')

  if (usesSolfegeKeys.value && !fromNumpad) {
    if (digit === 8 || digit === 9) {
      if (!isNumberNotation.value) return false
      stepAddOctaveDot(digit === 8 ? -1 : 1)
      return true
    }
    return appendSolfegeByKey(digit as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, 0)
  }

  if (digit === 0) toggleAddKind()
  else if (digit <= 8) setAddChronaxie(digit)
  else return false
  return true
}

type RhythmPatternSession = {
  target: RhythmPatternTarget
  options: RhythmPatternOption[]
  anchorRect: DOMRect | null
}

const rhythmPatternSession = shallowRef<RhythmPatternSession | null>(null)
const rhythmPatternActive = ref(0)
const rhythmPatternPopupRef = ref<InstanceType<typeof RhythmPatternPopup> | null>(null)
watch(selectedItem, () => closeRhythmPattern())
watch(rhythmPatternMode, () => {
  if (rhythmPatternSession.value) openRhythmPattern()
})

/** 空格：选中小节且有符号时弹出音值组合浮窗 */
function openRhythmPattern() {
  const voice = isDrumNotation.value ? (addDrumState.value as AddDrumState).voice : 'up'
  const target = resolveRhythmPatternTarget(selectedItem.value, voice, rhythmPatternMode.value)
  if (!target) return
  const options = buildRhythmPatternOptions(musicScoreData.value, target)
  rhythmPatternSession.value = {
    target,
    options,
    anchorRect: selectedEl.value?.getBoundingClientRect() ?? null
  }
  rhythmPatternActive.value = 0
}

function closeRhythmPattern() {
  rhythmPatternSession.value = null
}

function pickRhythmPattern(index: number) {
  const session = rhythmPatternSession.value
  const option = session?.options[index]
  if (!session || !option) return
  applyRhythmPatternOption(session.target, option)
  closeRhythmPattern()
}

function moveRhythmPatternActive(step: number) {
  const count = rhythmPatternSession.value?.options.length ?? 0
  if (!count) return
  const next = rhythmPatternActive.value + step
  rhythmPatternActive.value = Math.min(count - 1, Math.max(0, next))
}

/** 浮窗打开时独占单键：数字 / 字母 / 小键盘选节奏型，方向键 + Enter / 空格选当前卡片，Tab 切换模式，Esc 关闭 */
function handleRhythmPatternKey(event: KeyboardEvent, key: string) {
  if (key === 'Escape') {
    closeRhythmPattern()
    return
  }
  if (key === 'Tab') {
    rhythmPatternMode.value = rhythmPatternMode.value === 'beat' ? 'measure' : 'beat'
    return
  }
  // 按住空格打开浮窗时的自动重复不算确认
  if (event.code === 'Space' && event.repeat) return
  if (key === 'Enter' || event.code === 'Space') {
    pickRhythmPattern(rhythmPatternActive.value)
    return
  }
  // 按物理键位先匹配：NumLock 关闭时小键盘数字的 key 会变成方向键 / Home 等
  const index = rhythmPatternIndexForCode(event.code)
  if (index >= 0) {
    pickRhythmPattern(index)
    return
  }
  const columns = rhythmPatternPopupRef.value?.columnCount() ?? 1
  const arrowStep: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -columns,
    ArrowDown: columns
  }
  if (key in arrowStep) moveRhythmPatternActive(arrowStep[key]!)
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (isEditableTarget(event.target)) {
    const target = event.target as HTMLElement
    const leave =
      !event.isComposing &&
      (event.key === 'Escape' || (event.key === 'Enter' && target instanceof HTMLInputElement))
    // 让输入框自己的 Enter / 失焦提交先跑完，再交还快捷键
    if (leave) setTimeout(() => target.blur())
    return
  }

  const key = shortcutKey(event)

  if (rhythmPatternSession.value) {
    // 组合键（撤销等）照常生效，先收起浮窗
    if (event.ctrlKey || event.metaKey || event.altKey) {
      closeRhythmPattern()
      return
    }
    handleRhythmPatternKey(event, key)
    event.preventDefault()
    event.stopPropagation()
    return
  }

  if (event.code === 'Space') {
    // 编辑区禁用空格默认的页面滚动 / 按钮激活
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) openRhythmPattern()
    return
  }

  if (key === 'Escape') {
    if (multiSelected.value.length) {
      boxSelect.clearMultiSelected()
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (selectedItem.value) {
      clearSelection()
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }

  if (handleEditShortcutKey(event, key)) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  const navDir = ARROW_TO_MEASURE_NAV[key as keyof typeof ARROW_TO_MEASURE_NAV]
  if (navDir) {
    // 始终拦截方向键，避免焦点在时值/音符类型 radio 上时切换选项
    navigateSelectedMeasure(navDir)
    event.preventDefault()
    event.stopPropagation()
    return
  }

  if (key !== 'Delete' && key !== 'Backspace') return
  const selected = selectedItem.value
  if (key === 'Backspace' && !multiSelected.value.length && isMeasureAddMode(selected)) {
    // 选中小节时 Backspace 只删末尾一个音符 / 休止符，小节保留；Delete 才删整个小节
    const voice = isDrumNotation.value ? (addDrumState.value as AddDrumState).voice : 'up'
    deleteLastSlotInMeasure(musicScoreData.value, selected.measure, voice)
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (multiSelected.value.length) {
    deleteMultiSelected(musicScoreData.value, multiSelected.value)
    boxSelect.clearMultiSelected()
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (deleteSelected()) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onMidiMessage(event: MIDIMessageEvent) {
  const data = event.data
  if (!data || data.length < 2) return
  const command = data[0]! & 0xf0
  const note = data[1]!
  const velocity = data.length > 2 ? data[2]! : 0
  if (command === 0x90 && velocity > 0) {
    addMidiNote(note)
  }
}

onMounted(async () => {
  // capture：整页优先于顶部 radio / 按钮，避免焦点落在工具栏后快捷键失效
  window.addEventListener('keydown', onKeyDown, true)
  await midiStore.init()
  midiStore.addMessageListener(onMidiMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown, true)
  midiStore.removeMessageListener(onMidiMessage)
})

const hasAffiliatedHandles = computed(() =>
  Boolean(
    slurHandlePoints.value ||
      voltaHandlePoints.value ||
      arpeggioHandlePoints.value ||
      strummingHandlePoints.value ||
      pedalHandlePoints.value ||
      pitchHandlePoints.value ||
      lineHandlePoints.value ||
      noteAffiliatedBox.value
  )
)

/** 五线谱/简谱/Tab addNoteState 形态不同，用 computed 桥接 v-model */
const addNoteStateModel = computed<any>({
  get: () => addNoteState.value,
  set: (value) => {
    addNoteState.value = value
  }
})

const addTabStateModel = computed<any>({
  get: () => addTabState.value,
  set: (value) => {
    addTabState.value = value
  }
})

const addDrumStateModel = computed<any>({
  get: () => addDrumState.value,
  set: (value) => {
    addDrumState.value = value
  }
})

defineExpose({ clearSelection, clearMultiSelected: boxSelect.clearMultiSelected })
</script>

<template>
  <header class="editor-chrome">
    <div class="editor-chrome__menu">
      <slot name="top-actions" />
    </div>
    <div class="editor-chrome__tools">
      <AddTabStatePanel
        v-if="isTabNotation"
        v-model="addTabStateModel"
        :string-count="tabStrings"
      />
      <AddDrumStatePanel
        v-else-if="isDrumNotation"
        v-model="addDrumStateModel"
      />
      <AddNumberStatePanel
        v-else-if="isNumberNotation"
        v-model="addNoteStateModel"
      />
      <AddNoteStatePanel v-else v-model="addNoteStateModel" />
    </div>
  </header>

  <div class="editor-body">
    <div
      ref="scoreRootRef"
      class="score-page__main"
      @pointerdown.capture="releaseEditableFocus"
      @pointerdown="boxSelect.handleAreaDown"
    >
      <div class="score-page__stack">
        <musicScoreVue
          v-if="scoreSkin"
          :key="scoreSkinName"
          ref="musicScoreRef"
          class="score-page__svg"
          :data="musicScoreData"
          :slot-config="scoreSlotConfig"
          :extensions="scoreExtensions"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          @renderMusicScore="onRenderMusicScore"
          @dr-click="onDrClick"
          @dr-down="handleDrDown"
          @dr-enter="handleDrEnter"
          @dr-leave="handleDrLeave"
          @dr-up="handleDrUp"
          @dr-contextmenu="handleDrContextMenu"
          @top-down="boxSelect.handleTopDown"
          @top-move="handleTopMove"
          @top-up="onTopUp"
          @top-contextmenu="handleTopContextMenu"
        >
          <template #t="{ node }">
            <TitleSlot
              mode="edit"
              :music-score="musicScoreData"
              :node="node"
              :padding-left="titlePadding.left"
              :padding-right="titlePadding.right"
              :font-family="titleFontFamily"
            />
          </template>
          <template #g-d="{ node }">
            <EditSlotGdButtons v-if="structureEditEnabled" :node="node" />
          </template>
          <template #s-d="{ node }">
            <!-- 宿主 #s-d 会覆盖扩展默认槽，需手动挂 LyricsSlot，扩展仍负责 slotConfig / vDom -->
            <LyricsSlot
              v-if="lyricsEditEnabled"
              :music-score="musicScoreData"
              :node="node"
              v-bind="lyricsSlotProps"
              @cell-focus="onLyricsCellFocus"
              @cell-blur="onLyricsCellBlur"
            />
            <EditSlotSdButtons
              v-if="structureEditEnabled"
              :disabled="isMeasureSelected"
              :node="node"
            />
          </template>
          <template #m="{ node }">
            <rect
              v-if="selectedItem?.measure?.id === node.slotData?.measure?.id"
              class="measure-selection-frame dr-selected-highlight"
              :height="node.h"
              :width="node.w"
              fill="white"
              fill-opacity="0.01"
              pointer-events="none"
            />
            <rect
              v-else-if="
                node.slotData?.measure?.id
                  && relatedMeasureIds.includes(node.slotData.measure.id)
              "
              class="measure-related-frame dr-related-highlight"
              :height="node.h"
              :width="node.w"
              fill="rgba(103, 194, 58, 0.18)"
              pointer-events="none"
            />
            <GhostTabPreview
              v-if="isTabNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostDrumPreview
              v-else-if="isDrumNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostNumberPreview
              v-else-if="isNumberNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostNotePreview
              v-else
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
          </template>
        </musicScoreVue>
        <svg
          v-if="hasAffiliatedHandles"
          class="score-page__affiliated-drag-layer"
          :height="musicScoreData.height"
          :viewBox="`0 0 ${musicScoreData.width} ${musicScoreData.height}`"
          :width="musicScoreData.width"
          xmlns="http://www.w3.org/2000/svg"
        >
          <SlurDragHandles
            v-if="slurHandlePoints"
            :handles="slurHandlePoints"
            :show-control="!slurUsesRoundedDragHandles"
            :vertical-control="slurUsesRoundedDragHandles"
            @handle-down="handleSlurHandleDown"
          />
          <VerticalDragHandles
            v-if="arpeggioHandlePoints"
            :handles="arpeggioHandlePoints"
            @handle-down="handleArpeggioHandleDown"
          />
          <VerticalDragHandles
            v-if="strummingHandlePoints"
            :handles="strummingHandlePoints"
            @handle-down="handleStrummingHandleDown"
          />
          <HorizontalDragHandles
            v-if="pedalHandlePoints"
            :handles="pedalHandlePoints"
            @handle-down="handlePedalHandleDown"
          />
          <HorizontalDragHandles
            v-if="pitchHandlePoints"
            :handles="pitchHandlePoints"
            @handle-down="handlePitchHandleDown"
          />
          <HorizontalDragHandles
            v-if="lineHandlePoints"
            :handles="lineHandlePoints"
            @handle-down="handleLineHandleDown"
          />
          <MoveDragHandle
            v-if="noteAffiliatedBox"
            :box="noteAffiliatedBox"
            @handle-down="handleNoteAffiliatedHandleDown"
          />
          <VoltaDragHandles
            v-if="voltaHandlePoints"
            :handles="voltaHandlePoints"
            @handle-down="handleVoltaHandleDown"
          />
        </svg>
        <svg
          v-if="boxRect"
          class="score-page__box-select-layer"
          :height="musicScoreData.height"
          :viewBox="`0 0 ${musicScoreData.width} ${musicScoreData.height}`"
          :width="musicScoreData.width"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            class="score-page__box-select-rect"
            :x="boxRect.x"
            :y="boxRect.y"
            :width="boxRect.w"
            :height="boxRect.h"
            rx="2"
          />
        </svg>
      </div>
    </div>

    <PropertyPanel
      :kind="propertyPanelKind"
      :selected="selectedItem"
      :multi-notes="multiSelected"
      @multi-deleted="boxSelect.clearMultiSelected()"
    />

    <EditContextMenu
      v-if="contextMenuState.open && contextMenuState.items.length"
      :x="contextMenuState.x"
      :y="contextMenuState.y"
      :items="contextMenuState.items"
      @close="closeContextMenu"
    />

    <StaffToneColorDialog v-model="toneColorStaff" :music-score="musicScoreData" />
    <StaffVolumeDialog v-model="volumeStaff" :music-score="musicScoreData" />

    <RhythmPatternPopup
      v-if="rhythmPatternSession"
      ref="rhythmPatternPopupRef"
      :options="rhythmPatternSession.options"
      :active-index="rhythmPatternActive"
      :anchor-rect="rhythmPatternSession.anchorRect"
      :time-signature="rhythmPatternSession.target.timeSignature"
      :note-count="rhythmPatternSession.target.slots.length"
      :skipped="rhythmPatternSession.target.skipped"
      :mode="rhythmPatternMode"
      :skin="scoreSkin"
      :skin-name="scoreSkinName"
      @pick="pickRhythmPattern"
      @close="closeRhythmPattern"
    />
  </div>
</template>

<style scoped>
.editor-chrome {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: var(--ec-card);
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  box-shadow: var(--ec-shadow);
}

.editor-chrome__menu {
  min-width: 0;
}

.editor-chrome__tools {
  min-width: 0;
  padding: 6px 10px 8px;
  background: rgba(255, 255, 255, 0.35);
  border-top: 1px solid rgba(255, 184, 208, 0.22);
}

.editor-chrome :deep(.add-note-state),
.editor-chrome :deep(.add-tab-state),
.editor-chrome :deep(.add-drum-state) {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.editor-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.score-page__main {
  min-width: 0;
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  box-sizing: border-box;
}

.score-page__stack {
  position: relative;
}

.score-page__affiliated-drag-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.score-page__affiliated-drag-layer :deep(.slur-drag-handles__square),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__circle),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__square),
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__center),
.score-page__affiliated-drag-layer :deep(.vertical-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.vertical-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.horizontal-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.horizontal-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.move-drag-handle) {
  pointer-events: all;
}

:deep(.dr-hover-highlight) {
  filter: drop-shadow(0 0 3px rgba(240, 112, 159, 0.9)) brightness(1.12);
}

:deep(.dr-selected-highlight) {
  filter: drop-shadow(0 0 4px rgba(255, 152, 0, 0.95)) brightness(1.14);
}

:deep(.dr-selected-highlight[data-tag='noteHead']),
:deep(.dr-selected-highlight[data-tag='noteNumber']),
:deep(.dr-selected-highlight[data-tag='tabNoteNumber']),
:deep(.dr-selected-highlight[data-tag='arpeggio']),
:deep(.dr-selected-highlight[data-tag='strumming']) {
  cursor: ns-resize;
}

:deep(.dr-drum-voice-dim) {
  opacity: 0.3;
}

:deep(.dr-related-highlight),
:deep(.dr-lyrics-focus-highlight) {
  filter: drop-shadow(0 0 4px rgba(103, 194, 58, 0.95)) brightness(1.12);
}

:deep(.dr-lyrics-focus-highlight :is(path, text, use, circle, ellipse, polygon):not([fill='none'])) {
  fill: #3fa61a;
}

:deep(.dr-multi-selected-highlight) {
  filter: drop-shadow(0 0 1px rgba(124, 77, 255, 1)) drop-shadow(0 0 3px rgba(155, 109, 255, 0.85));
}

.score-page__box-select-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.score-page__box-select-rect {
  fill: rgba(155, 109, 255, 0.12);
  stroke: rgba(124, 77, 255, 0.85);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}
</style>
