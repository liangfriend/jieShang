<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { ToneColor } from '@deciphony/player'
import SJWPDF, {
  DrawToolEnum,
  type ElementContextMenuItem,
  type ElementContextMenuPayload,
  type ResolvedScoreAudio,
  type SJW,
  type SjwMode,
  type SjwSelection,
  type SPage,
  type SScore
} from '@deciphony/work'
import '@deciphony/work/dist/work.css'
import type { MusicScore } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import WorkThumbnailRail from '@renderer/views/work/WorkThumbnailRail.vue'
import WorkEditToolbar from '@renderer/views/work/WorkEditToolbar.vue'
import WorkAssetPickerDialog from '@renderer/views/work/WorkAssetPickerDialog.vue'
import WorkSaveDialog from '@renderer/views/work/WorkSaveDialog.vue'
import WorkSettingsDialog from '@renderer/views/work/WorkSettingsDialog.vue'
import WorkMediaPreviewDialog from '@renderer/views/work/WorkMediaPreviewDialog.vue'
import WorkElementPropertyPanel, {
  type WorkCropPayload,
  type WorkFramePatch,
  type WorkGrandStaffCropPayload,
  type WorkPropertyTarget,
  type WorkTextStylePatch
} from '@renderer/views/work/WorkElementPropertyPanel.vue'
import {
  CUR_SHOW_WORK_TEMP_ID,
  WORK_SINGING_SCORE_TEMP_ID,
  workSingingAccompanimentAudioKey,
  workSingingVocalAudioKey
} from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { useTempAudioStore } from '@renderer/store/tempAudio.store'
import {
  collectStaffToneColorIds,
  defaultToneColorIdForScore,
  PIANO_TONE_COLOR_NAME
} from '@renderer/store/play.store'
import { isDrumMusicScore, isTabMusicScore } from '@renderer/utils/isTabNotation'
import { loadOwnedToneColorContent, toneColorKey } from '@renderer/utils/collection/toneColorUsage'
import { ensureScoreSlotHeights } from '@renderer/utils/scoreSpacingDefaults'
import { PLAY_VOLUME_MAX, PLAY_VOLUME_MIN } from '@renderer/constant/play'
import pianoTone from '@renderer/toneColor/accoustic_grand_piano.json'
import i18n from '@renderer/i18n'
import {
  applySjwInPlace,
  buildWorkRouteQuery,
  ensureWorkHasPage,
  loadWorkFromRoute,
  resolveEditorWorkTempId,
  resolveWorkId,
  resolveWorkTempId
} from '@renderer/utils/workRoute'
import { loadWorkPageSize, saveWorkPageSize } from '@renderer/utils/workPageSizeStorage'
import { saveWorkToDatabase } from '@renderer/utils/fileHelper/workFile'
import { resolveBoundScoreAudios } from '@renderer/utils/work/resolveBoundScoreAudios'
import { loadOwnedScoreSkinPack } from '@renderer/utils/collection/scoreSkinUsage'
import { planScorePages, type ScoreToWorkJob } from '@renderer/utils/work/scoreToWork'
import { EDIT_NEW_WORK_TEMP_ID } from '@renderer/constant/work'
import type { AssetPickKind } from '@renderer/views/work/WorkAssetPickerDialog.vue'
import { applyWorkPages, type WorkHistoryStep } from '@renderer/utils/workEditHistory'
import {
  useWorkEditHistory,
  type WorkHistoryAssetApi
} from '@renderer/views/work/useWorkEditHistory'

defineOptions({ name: 'WorkStudioView' })

const PLACE_X = 100
const PLACE_Y = 100

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

/** 避免 HMR 后 i18n 实例未合并新 key 时菜单显示原始 key */
function mt(key: string, zh: string, en: string): string {
  const loc = locale.value
  const translated = i18n.global.t(key)
  if (typeof translated === 'string' && translated !== key) return translated
  return loc === 'zh' ? zh : en
}
const dataStore = useDataStore()
const globalLoading = useGlobalLoadingStore()
const tempAudioStore = useTempAudioStore()

const pdfRef = ref<InstanceType<typeof SJWPDF> | null>(null)
const workData = ref<SJW | null>(null)
const pageIndex = ref(0)
const ready = ref(false)
const busy = ref(false)
const assetDialogOpen = ref(false)
const backgroundDialogOpen = ref(false)
const saveDialogOpen = ref(false)
const settingsDialogOpen = ref(false)
const importInputRef = ref<HTMLInputElement | null>(null)
const mediaPreviewOpen = ref(false)
const mediaPreviewKind = ref<'image' | 'video'>('image')
const mediaPreviewSrc = ref('')
const mediaPreviewTitle = ref('')
const toneReady = ref(false)
/** 已灌过音色的 SJWPDF 实例；随 ready 卸载重建后必须重灌 */
let tonePdf: InstanceType<typeof SJWPDF> | null = null
/** 作品内播放音量（0~1），同时写入 NPlayer / APlayer；进入页默认 1 */
const WORK_DEFAULT_VOLUME = 1
const workVolume = ref(WORK_DEFAULT_VOLUME)
/** 由 @before-context-menu 按目标动态写入 */
const workContextMenu = ref<ElementContextMenuItem[]>([])

type ScoreRangeSelect = { scoreId: string; startNoteId: string | null; endNoteId: string | null }
type ScoreRangeChangePayload = ScoreRangeSelect & { scoreIndex: number }
/** @deciphony/work 选段 API；已发布的 0.0.12 类型尚未包含，升级依赖后改为从包导入 */
type RangeSelectPdf = {
  play: (scoreIndex: number, options?: { range?: ScoreRangeSelect | null }) => Promise<void>
  startRangeSelect: (scoreId: string) => void
  endRangeSelect: () => void
  clearRangeSelect: () => void
}
/** 展示模式选段（内存态，不写入作品），与 SJWPDF 内部状态经 rangeChange 同步 */
const rangeSelect = ref<ScoreRangeSelect | null>(null)
const rangeComplete = computed(
  () => !!rangeSelect.value?.startNoteId && !!rangeSelect.value?.endNoteId
)
const rangeHint = computed(() => {
  const state = rangeSelect.value
  if (!state?.startNoteId) return t('work.range.pickStart')
  if (!state.endNoteId) return t('work.range.pickEnd')
  return t('work.range.ready')
})

function rangePdf(): RangeSelectPdf | null {
  return pdfRef.value as unknown as RangeSelectPdf | null
}
const storedPageSize = loadWorkPageSize()
const newPageWidth = ref(storedPageSize.width)
const newPageHeight = ref(storedPageSize.height)

const drawing = ref(false)
const drawTool = ref<DrawToolEnum>(DrawToolEnum.Pen)
const drawLineWidth = ref(3)
const drawColor = ref('#000000')

const mode = computed<SjwMode>(() => (route.name === 'workEdit' ? 'edit' : 'show'))
const workId = computed(() => resolveWorkId(route.query.workId))
const tempId = computed(() => resolveEditorWorkTempId(route))
const isExisting = computed(() => !!workId.value)

/** 有 workId 时，缺省 tempId 与 curShowWork 等价（避免首次补 tempId 触发整页重载） */
function normalizeWorkTempQuery(workIdRaw: unknown, tempIdRaw: unknown): string {
  const wid = resolveWorkId(workIdRaw)
  const tid = resolveWorkTempId(tempIdRaw)
  if (tid) return tid
  if (wid) return CUR_SHOW_WORK_TEMP_ID
  return ''
}

async function snapshotBlob() {
  const pdf = pdfRef.value
  if (!pdf || !workData.value) return
  try {
    const blob = await pdf.exportSjw()
    dataStore.setTempWorkBlob(tempId.value, blob)
  } catch {
    // ignore snapshot failures
  }
}

async function ensureToneColor() {
  const pdf = pdfRef.value
  if (!pdf) return
  // SJWPDF 随 ready 卸载重建后，playback/NPlayer 是新实例，必须重新灌音色
  if (tonePdf !== pdf || !toneReady.value) {
    await pdf.addToneColor(PIANO_TONE_COLOR_NAME, pianoTone as ToneColor)
    tonePdf = pdf
    toneReady.value = true
  }
  pdf.setToneColorName(PIANO_TONE_COLOR_NAME)
  applyWorkVolume(workVolume.value)
}

/** 曲谱类型默认音色：吉他 / 尤克里里尼龙弦、贝斯原声贝斯、鼓谱打击乐；其余返回 null，用已灌入的内置钢琴 */
function workDefaultToneColorId(musicScore: MusicScore): number | null {
  if (isTabMusicScore(musicScore) || isDrumMusicScore(musicScore)) {
    return defaultToneColorIdForScore(musicScore)
  }
  return null
}

/**
 * 作品播放：单谱表 instrumentValue 优先，未设置的谱表用曲谱类型默认音色。
 * 用到的音色先登记到作品的 NPlayer，返回应设置的默认音色名（加载失败回落钢琴）。
 */
async function ensureScoreToneColors(
  pdf: InstanceType<typeof SJWPDF>,
  musicScore: MusicScore
): Promise<string> {
  const player = pdf.getPlayer?.()
  const defaultId = workDefaultToneColorId(musicScore)
  const ids = new Set(collectStaffToneColorIds(musicScore))
  if (defaultId != null) ids.add(defaultId)
  const missing = [...ids].filter((id) => !player?.hasToneColor(toneColorKey(id)))
  if (missing.length) {
    await globalLoading.run(t('play.toneColor.loading'), async () => {
      await Promise.all(
        missing.map(async (id) => {
          const tone = await loadOwnedToneColorContent(id)
          if (tone) await pdf.addToneColor(toneColorKey(id), tone)
        })
      )
    })
  }
  if (defaultId == null) return PIANO_TONE_COLOR_NAME
  const defaultKey = toneColorKey(defaultId)
  return pdf.getPlayer?.()?.hasToneColor(defaultKey) ? defaultKey : PIANO_TONE_COLOR_NAME
}

function applyWorkVolume(value: number) {
  const next = Math.min(PLAY_VOLUME_MAX, Math.max(PLAY_VOLUME_MIN, value))
  workVolume.value = next
  const pdf = pdfRef.value
  if (!pdf) return
  const nplayer = pdf.getPlayer?.()
  if (nplayer) nplayer.volume = next
  const aplayer = pdf.getAPlayer?.()
  if (aplayer) aplayer.volume = next
}

function onWorkVolumeChange(value: number | number[]) {
  const v = Array.isArray(value) ? value[0] : value
  if (typeof v !== 'number' || !Number.isFinite(v)) return
  applyWorkVolume(v)
}

async function hydratePdf(blob: Blob | null) {
  await nextTick()
  const pdf = pdfRef.value
  if (!pdf || !workData.value) return
  if (blob) {
    const loaded = await pdf.loadSjw(blob)
    applySjwInPlace(workData.value, loaded)
  }
  await ensureToneColor()
}

async function bootstrap() {
  ready.value = false
  toneReady.value = false
  tonePdf = null
  copiedPage.value = null
  globalLoading.show(t('common.loading'))
  try {
    const loaded = await loadWorkFromRoute(route)
    if (!loaded) {
      await router.replace({ name: 'myWorks' })
      return
    }
    ensureWorkHasPage(loaded.work)
    workData.value = loaded.work
    dataStore.setTempWork(tempId.value, loaded.work)
    pageIndex.value = 0
    ready.value = true
    await hydratePdf(loaded.blob)
    const scoreToWork = tempId.value === EDIT_NEW_WORK_TEMP_ID ? dataStore.takePendingScoreToWork() : null
    if (scoreToWork) await layoutScoreIntoWork(scoreToWork)
  } finally {
    editHistory.reset()
    globalLoading.hide()
  }
}

watch(
  () => [route.name, route.query.workId, route.query.tempId] as const,
  async (_next, prev) => {
    if (!prev) return
    const [prevName, prevWorkId, prevTempId] = prev
    // 同作品 edit↔show：只改 mode，不重载。
    // 首次从「仅 workId」切到带 tempId=curShowWork 也视为同作品（列表进展示时往往没带 tempId）。
    if (
      (prevName === 'workEdit' || prevName === 'workShow') &&
      (route.name === 'workEdit' || route.name === 'workShow') &&
      String(prevWorkId ?? '') === String(route.query.workId ?? '') &&
      normalizeWorkTempQuery(prevWorkId, prevTempId) ===
        normalizeWorkTempQuery(route.query.workId, route.query.tempId)
    ) {
      return
    }
    await snapshotBlob()
    await bootstrap()
  }
)

onMounted(() => {
  // HMR 后 createI18n 可能仍持有旧 messages，强制合并 work 文案
  void import('@renderer/i18n/messages/zh/work').then((m) => {
    i18n.global.mergeLocaleMessage('zh', m.default)
  })
  void import('@renderer/i18n/messages/en/work').then((m) => {
    i18n.global.mergeLocaleMessage('en', m.default)
  })
  void import('@renderer/i18n/messages/ja/work').then((m) => {
    i18n.global.mergeLocaleMessage('ja', m.default)
  })
  void bootstrap()
})

onBeforeUnmount(() => {
  stopDrawSession()
  pdfRef.value?.stop()
  void snapshotBlob()
})

const DEFAULT_PEN_WIDTH = 3
const DEFAULT_ERASER_WIDTH = 20

function stopDrawSession() {
  if (!drawing.value) return
  drawing.value = false
  pdfRef.value?.endDraw()
}

watch(mode, () => {
  // edit 持久笔迹 / show 教学标注共用 startDraw，切模式时结束会话
  stopDrawSession()
  endScoreRange()
})

// SJWPDF 换页或重建时选段随之结束，且不抛 rangeChange
watch([pageIndex, pdfRef], () => {
  rangeSelect.value = null
})

function startScoreRange(score: SScore) {
  const pdf = rangePdf()
  if (!pdf) return
  stopDrawSession()
  pdf.startRangeSelect(score.id)
  rangeSelect.value = { scoreId: score.id, startNoteId: null, endNoteId: null }
}

function endScoreRange() {
  if (!rangeSelect.value) return
  rangePdf()?.endRangeSelect()
  rangeSelect.value = null
}

function clearScoreRange() {
  rangePdf()?.clearRangeSelect()
}

function onRangeChange(payload: ScoreRangeChangePayload) {
  rangeSelect.value = {
    scoreId: payload.scoreId,
    startNoteId: payload.startNoteId,
    endNoteId: payload.endNoteId
  }
}

function playRangeFromBar() {
  const scoreId = rangeSelect.value?.scoreId
  const score = workData.value?.pages[pageIndex.value]?.scores?.find((s) => s.id === scoreId)
  if (score) void playScore(score)
}

/** 同作品 edit↔show 不重载（见上方 route watch），无需先 exportSjw；含大视频时打包会卡顿 */
function toggleMode() {
  const nextName = mode.value === 'edit' ? 'workShow' : 'workEdit'
  stopDrawSession()
  router.replace({
    name: nextName,
    query: buildWorkRouteQuery(route)
  })
}

function syncDrawToolToPdf() {
  const pdf = pdfRef.value
  if (!pdf || !drawing.value) return
  pdf.setTool(drawTool.value, {
    lineWidth: drawLineWidth.value,
    color: drawColor.value
  })
}

function applyDrawSession() {
  const pdf = pdfRef.value
  if (!pdf) return
  if (!drawing.value) {
    pdf.endDraw()
    return
  }
  // show → 教学标注层；edit → page.drawings（SJWPDF 按 mode 分流）
  pdf.startDraw()
  syncDrawToolToPdf()
}

function onToggleDraw() {
  drawing.value = !drawing.value
  if (drawing.value) endScoreRange()
  applyDrawSession()
}

function onDrawToolChange(tool: DrawToolEnum) {
  if (tool === DrawToolEnum.Pen && drawLineWidth.value === DEFAULT_ERASER_WIDTH) {
    drawLineWidth.value = DEFAULT_PEN_WIDTH
  }
  if (tool === DrawToolEnum.Eraser && drawLineWidth.value === DEFAULT_PEN_WIDTH) {
    drawLineWidth.value = DEFAULT_ERASER_WIDTH
  }
  drawTool.value = tool
  syncDrawToolToPdf()
}

function onDrawLineWidthChange(width: number) {
  drawLineWidth.value = width
  syncDrawToolToPdf()
}

function onDrawColorChange(color: string | null) {
  drawColor.value = color || '#000000'
  syncDrawToolToPdf()
}

function onClearDrawings() {
  // show 清空教学标注；edit 清空 page.drawings
  pdfRef.value?.clearDrawings()
}

/** 等到下一帧真正绘制到屏幕 */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * 换页渲染是同步阻塞的：必须先让加载框画到屏幕上，再改页码，否则遮罩来不及出现。
 * 新页挂载并绘制后再关闭。
 */
async function withPageLoading(task: () => void) {
  globalLoading.show(t('common.loading'), { instant: true })
  try {
    await waitForPaint()
    task()
    await nextTick()
    await waitForPaint()
  } finally {
    globalLoading.hide()
  }
}

async function switchToPage(index: number) {
  if (index === pageIndex.value) return
  await withPageLoading(() => {
    pageIndex.value = index
  })
}

async function selectPage(index: number) {
  await switchToPage(index)
  if (drawing.value) applyDrawSession()
}

async function handleAddPage() {
  const pdf = pdfRef.value
  if (!pdf) return
  const { index } = pdf.addPage({
    width: newPageWidth.value,
    height: newPageHeight.value
  })
  await switchToPage(index)
  editHistory.checkpoint()
}

async function handleInsertPage() {
  const pdf = pdfRef.value
  if (!pdf) return
  const { index } = pdf.insertPage(pageIndex.value + 1, {
    width: newPageWidth.value,
    height: newPageHeight.value
  })
  await switchToPage(index)
  editHistory.checkpoint()
}

/** 复制当前页：插在当前页后面，内容与当前页相同（曲谱 / 元素换新 id） */
async function handleDuplicatePage() {
  const source = workData.value?.pages[pageIndex.value]
  if (!source || !workData.value) return
  const insertAt = pageIndex.value + 1
  await withPageLoading(() => {
    const page = clonePageData(source)
    page.id = crypto.randomUUID()
    for (const score of page.scores ?? []) score.id = crypto.randomUUID()
    for (const el of page.elements ?? []) el.id = crypto.randomUUID()
    workData.value!.pages.splice(insertAt, 0, page)
    pageIndex.value = insertAt
  })
  if (drawing.value) applyDrawSession()
  editHistory.checkpoint()
}

async function handleRemovePage() {
  await handleRemovePageAt(pageIndex.value)
}

/** 缩略图右键「复制」：深拷贝整页（资源 id 共用，粘贴时再换新元素 id） */
const copiedPage = ref<SPage | null>(null)
const canPastePage = computed(() => copiedPage.value != null)

/** 深拷贝整页：toRaw 只脱一层，嵌套的曲谱仍是 Proxy，structuredClone 会失败；用 JSON */
function clonePageData(page: SPage): SPage {
  return JSON.parse(JSON.stringify(toRaw(page))) as SPage
}

function handleCopyPage(index: number) {
  const page = workData.value?.pages[index]
  if (!page) return
  copiedPage.value = clonePageData(page)
}

/** 粘贴到目标页：覆盖内容，保留该页 id；曲谱 / 元素换新 id，避免与源页冲突 */
function applyCopiedPageOnto(target: SPage, source: SPage) {
  const cloned = clonePageData(source)
  for (const score of cloned.scores ?? []) score.id = crypto.randomUUID()
  for (const el of cloned.elements ?? []) el.id = crypto.randomUUID()
  target.width = cloned.width
  target.height = cloned.height
  target.scores = cloned.scores ?? []
  target.elements = cloned.elements ?? []
  target.drawings = cloned.drawings ?? []
  if (cloned.thumbnail !== undefined) target.thumbnail = cloned.thumbnail
  else delete target.thumbnail
  if (cloned.background !== undefined) target.background = cloned.background
  else delete target.background
}

async function handlePastePage(index: number) {
  const source = copiedPage.value
  const target = workData.value?.pages[index]
  if (!source || !target) return
  await withPageLoading(() => {
    applyCopiedPageOnto(target, source)
    pageIndex.value = index
  })
  if (drawing.value) applyDrawSession()
  editHistory.checkpoint()
}

async function handleRemovePageAt(index: number) {
  const pdf = pdfRef.value
  if (!pdf || !workData.value || workData.value.pages.length <= 1) return
  if (index < 0 || index >= workData.value.pages.length) return
  // 删中间页时 pageIndex 可能不变，但当前页内容已换成后一页，也要盖住重绘
  await withPageLoading(() => {
    if (!pdf.removePage(index) || !workData.value) return
    if (pageIndex.value > index) pageIndex.value -= 1
    else if (pageIndex.value >= workData.value.pages.length) {
      pageIndex.value = Math.max(0, workData.value.pages.length - 1)
    }
  })
  if (drawing.value) applyDrawSession()
  editHistory.checkpoint()
}

function applySizeToAllPages(width: number, height: number) {
  if (!workData.value) return
  for (const page of workData.value.pages) {
    page.width = width
    page.height = height
  }
  ElMessage.success(t('work.applyPageSizeSuccess'))
}

function applySizeToCurrentPage(width: number, height: number) {
  const page = workData.value?.pages[pageIndex.value]
  if (!page) return
  page.width = width
  page.height = height
  ElMessage.success(t('work.applyCurrentPageSizeSuccess'))
}

function onApplyWorkInfo(payload: { name: string; author: string }) {
  if (!workData.value) return
  workData.value.name = payload.name
  workData.value.author = payload.author
  ElMessage.success(t('work.settingsDialog.applyInfoSuccess'))
}

/** 默认页「应用」：写入新页尺寸（加页 / 新建作品） */
function onApplyDefaultPageSize(payload: { width: number; height: number }) {
  newPageWidth.value = payload.width
  newPageHeight.value = payload.height
  saveWorkPageSize(payload)
  ElMessage.success(t('work.settingsDialog.applyDefaultSuccess'))
}

function onApplyDefaultPageSizeAll(payload: { width: number; height: number }) {
  newPageWidth.value = payload.width
  newPageHeight.value = payload.height
  saveWorkPageSize(payload)
  applySizeToAllPages(payload.width, payload.height)
}

function onApplyCurrentPageSize(payload: { width: number; height: number }) {
  applySizeToCurrentPage(payload.width, payload.height)
}

function onApplyCurrentPageSizeAll(payload: { width: number; height: number }) {
  applySizeToAllPages(payload.width, payload.height)
}

const settingsCurrentWidth = computed(
  () => workData.value?.pages[pageIndex.value]?.width ?? newPageWidth.value
)
const settingsCurrentHeight = computed(
  () => workData.value?.pages[pageIndex.value]?.height ?? newPageHeight.value
)
function onAddText(payload: { text: string; fontSize: number; color: string }) {
  pdfRef.value?.addText({
    x: PLACE_X,
    y: PLACE_Y,
    text: payload.text,
    fontSize: payload.fontSize,
    color: payload.color
  })
}

async function onAssetConfirm(payload: {
  kind: AssetPickKind
  item: { name: string }
  file: File
}) {
  const pdf = pdfRef.value
  if (!pdf) return
  // 对齐 workTest：*FromFile 内部 loadAsset，name 用带扩展名的文件名
  const assetName = payload.file.name || payload.item.name
  if (payload.kind === 'image') {
    await pdf.addImageFromFile({
      x: PLACE_X,
      y: PLACE_Y,
      file: payload.file,
      name: assetName
    })
  } else if (payload.kind === 'video') {
    await pdf.addVideoFromFile({
      x: PLACE_X,
      y: PLACE_Y,
      file: payload.file,
      name: assetName
    })
  } else {
    pdf.addAudioFromFile({
      x: PLACE_X,
      y: PLACE_Y,
      file: payload.file,
      name: assetName
    })
  }
  editHistory.checkpoint()
}

function onBackgroundConfirm(payload: {
  kind: AssetPickKind
  item: { name: string }
  file: File
}) {
  const pdf = pdfRef.value
  if (!pdf || payload.kind !== 'image') return
  // 对齐 workTest.setDemoBackground：setBackgroundFromFile(file, nameWithExt)
  const assetName = payload.file.name || payload.item.name
  pdf.setBackgroundFromFile(payload.file, assetName)
  ElMessage.success(t('work.background.setSuccess'))
}

function onClearBackground() {
  const pdf = pdfRef.value
  if (!pdf) return
  pdf.clearBackground()
  ElMessage.success(t('work.background.clearSuccess'))
}

function onAddScore(payload: { musicScore: unknown; scale: number; skinId?: number | null }) {
  void addScoreToPage(payload)
}

/** 往当前页加曲谱：补齐槽位高度，载入皮肤与绑定的范唱 / 伴奏；返回曲谱 id */
async function addScoreWithAssets(
  pdf: InstanceType<typeof SJWPDF>,
  source: unknown,
  skinId: number | null | undefined,
  x: number,
  y: number
): Promise<string> {
  const musicScore = JSON.parse(JSON.stringify(source)) as MusicScore
  // 作品读 data.sLSlotW / sRSlotW / showInstrumentName 画左右留白与音色名，旧谱先补齐
  ensureScoreSlotHeights(musicScore)
  const bound = await resolveBoundScoreAudios(musicScore)

  let skinPack: Awaited<ReturnType<typeof loadOwnedScoreSkinPack>> = null
  if (skinId != null) {
    skinPack = await loadOwnedScoreSkinPack(skinId)
    if (!skinPack) {
      ElMessage.warning(t('work.toolbar.scoreSkinLoadFailed'))
    }
  }

  return pdf.addScore({
    x,
    y,
    musicScore,
    ...(skinPack ? { skin: skinPack.pack } : {}),
    ...(bound.vocalPerformance
      ? { vocalPerformance: { file: bound.vocalPerformance.file, name: bound.vocalPerformance.name } }
      : {}),
    ...(bound.accompaniment
      ? { accompaniment: { file: bound.accompaniment.file, name: bound.accompaniment.name } }
      : {})
  })
}

async function addScoreToPage(payload: {
  musicScore: unknown
  scale: number
  skinId?: number | null
}) {
  const pdf = pdfRef.value
  const page = workData.value?.pages[pageIndex.value]
  if (!pdf || !page) return
  const id = await addScoreWithAssets(pdf, payload.musicScore, payload.skinId, PLACE_X, PLACE_Y)
  const score = page.scores?.find((s) => s.id === id)
  if (score) {
    const scale = payload.scale > 0 ? payload.scale : 0.5
    score.width = score.width * scale
    score.height = score.height * scale
  }
  editHistory.checkpoint()
}

/**
 * 曲谱编辑页「导出为作品」：第一页加曲谱（载入皮肤 / 音频），按复谱表分页，
 * 每页一份同源曲谱裁出对应复谱表，横向居中、按上边距放置。
 */
async function layoutScoreIntoWork(job: ScoreToWorkJob) {
  const pdf = pdfRef.value
  const work = workData.value
  if (!pdf || !work?.pages[0]) return
  pageIndex.value = 0
  await nextTick()

  const id = await addScoreWithAssets(pdf, job.musicScore, job.skinId, 0, job.topMargin)
  const firstPage = work.pages[0]
  const score = firstPage.scores?.find((s) => s.id === id)
  if (!score) return
  const bands = await pdf.getScoreVerticalBands(id)
  const source = score.musicScore
  const contentBottom = Math.max(0, ...bands.map((band) => band.y + band.height))
  // 曲谱 SVG 只画到 musicScore.height，内容更高时裁剪区会被截掉
  if (contentBottom > source.height) source.height = Math.ceil(contentBottom)

  const slices = planScorePages(bands, job, source.width)
  const scale = job.scoreWidth / source.width
  const template = JSON.parse(JSON.stringify(toRaw(score))) as SScore
  slices.forEach((slice, i) => {
    const target = i === 0 ? score : ({ ...JSON.parse(JSON.stringify(template)), id: crypto.randomUUID() } as SScore)
    target.crop = { x: 0, y: slice.cropY, width: source.width, height: slice.cropHeight }
    target.x = (job.pageWidth - job.scoreWidth) / 2
    target.y = job.topMargin
    target.width = job.scoreWidth
    target.height = slice.cropHeight * scale
    if (i === 0) return
    const { index } = pdf.addPage({ width: job.pageWidth, height: job.pageHeight })
    const page = work.pages[index]!
    page.scores = [...(page.scores ?? []), target]
  })
  ElMessage.success(t('work.scoreToWorkDone', { n: slices.length }))
}

function openSave() {
  if (isExisting.value && workData.value) {
    void persistSave(workData.value.name || t('work.title'), workData.value.author || '')
    return
  }
  saveDialogOpen.value = true
}

async function persistSave(name: string, author: string) {
  const pdf = pdfRef.value
  if (!pdf || !workData.value || busy.value) return
  busy.value = true
  try {
    await globalLoading.run(t('common.saving'), async () => {
      workData.value!.name = name
      workData.value!.author = author
      const blob = await pdf.exportSjw()
      const buffer = await blob.arrayBuffer()
      const saved = await saveWorkToDatabase({
        name,
        file: buffer,
        workId: workId.value,
        originalName: `${name}.sjw`
      })
      dataStore.setTempWork(CUR_SHOW_WORK_TEMP_ID, workData.value!)
      dataStore.setTempWorkBlob(CUR_SHOW_WORK_TEMP_ID, blob)
      if (!workId.value) {
        await router.replace({
          name: route.name === 'workShow' ? 'workShow' : 'workEdit',
          query: {
            workId: String(saved.id),
            tempId: CUR_SHOW_WORK_TEMP_ID
          }
        })
      }
      ElMessage.success(t('work.saveSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.saveFailed'))
  } finally {
    busy.value = false
  }
}

function onSaveConfirm(payload: { name: string; author: string }) {
  void persistSave(payload.name, payload.author)
}

const selection = ref<SjwSelection>(null)

/**
 * 按下即选中并开始拖动；此刻挂载属性面板会让拖拽第一帧明显卡一下。
 * 按住期间只暂存选中，松开后再显示面板。
 */
let pointerHeld = false
let pendingSelection: SjwSelection | undefined

function onSelectionChange(payload: SjwSelection) {
  if (pointerHeld) {
    pendingSelection = payload
    return
  }
  selection.value = payload
}

/** 画布按下时插件会阻止默认行为，焦点会留在之前的输入框里，导致 Delete 被当成打字 */
function onWindowPointerDown(ev: PointerEvent) {
  pointerHeld = true
  const active = document.activeElement
  const onCanvas = (ev.target as HTMLElement | null)?.closest?.('.sjw-pdf')
  if (onCanvas && active instanceof HTMLElement && isTypingTarget(active)) active.blur()
}

function onWindowPointerUp() {
  pointerHeld = false
  if (pendingSelection === undefined) return
  selection.value = pendingSelection
  pendingSelection = undefined
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el?.closest?.('input, textarea, select, [contenteditable="true"]')
}

/** Delete / Backspace 删除选中项（与右键「删除」相同：曲谱会清理无引用的范唱伴奏） */
function onWindowKeydown(ev: KeyboardEvent) {
  if (ev.key !== 'Delete' && ev.key !== 'Backspace') return
  if (mode.value !== 'edit' || drawing.value || isTypingTarget(ev.target)) return
  const pdf = pdfRef.value
  const current = selection.value
  if (!pdf || !current) return
  ev.preventDefault()
  if (current.kind === 'score') pdf.removeScore(current.score.id)
  else pdf.removeElement(current.element.id)
}

onMounted(() => {
  window.addEventListener('pointerdown', onWindowPointerDown, true)
  window.addEventListener('pointerup', onWindowPointerUp, true)
  window.addEventListener('pointercancel', onWindowPointerUp, true)
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown, true)
  window.removeEventListener('pointerup', onWindowPointerUp, true)
  window.removeEventListener('pointercancel', onWindowPointerUp, true)
  window.removeEventListener('keydown', onWindowKeydown)
})

/** 应用撤销 / 恢复快照：先停播放、退出选段与裁剪，再换内容并跳到改动所在页 */
async function applyHistoryStep(step: WorkHistoryStep) {
  const work = workData.value
  if (!work) return
  const pdf = pdfRef.value
  pdf?.stop()
  pdf?.endCrop()
  endScoreRange()
  const target = Math.min(Math.max(0, step.changedPage), Math.max(0, step.to.length - 1))
  if (target !== pageIndex.value || step.from.length !== step.to.length) {
    await withPageLoading(() => {
      applyWorkPages(work, step.from, step.to)
      pageIndex.value = target
    })
  } else {
    applyWorkPages(work, step.from, step.to)
    await nextTick()
  }
  if (drawing.value) applyDrawSession()
}

const editHistory = useWorkEditHistory({
  getWork: () => workData.value,
  getAssetApi: () => pdfRef.value as WorkHistoryAssetApi | null,
  canEdit: () => mode.value === 'edit' && ready.value && !busy.value,
  applyStep: applyHistoryStep
})

const propertyTarget = computed<WorkPropertyTarget | null>(() => {
  const s = selection.value
  if (!s || mode.value !== 'edit') return null
  if (s.kind === 'score') return { kind: 'score', item: s.score }
  if (s.element.type === 'image') return { kind: 'image', item: s.element }
  if (s.element.type === 'text') return { kind: 'text', item: s.element }
  return null
})

const propertyAssetName = computed(() => {
  const target = propertyTarget.value
  if (target?.kind !== 'image') return undefined
  return pdfRef.value?.getAssetName(target.item.src) ?? undefined
})

function onPropertyPatch(patch: WorkFramePatch) {
  const target = propertyTarget.value
  if (target) Object.assign(target.item, patch)
}

function onPropertyTextStyle(patch: WorkTextStylePatch) {
  const target = propertyTarget.value
  if (target?.kind === 'text') Object.assign(target.item, patch)
}

async function onPropertyCrop(payload: WorkCropPayload) {
  const pdf = pdfRef.value
  if (!pdf) return
  try {
    if (payload.kind === 'score') pdf.cropScore(payload.id, payload.area, { keepFrame: payload.keepFrame })
    else await pdf.cropImage(payload.id, payload.area, { keepFrame: payload.keepFrame })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.props.cropFailed'))
  }
  editHistory.checkpoint()
}

async function onPropertyCropByGrandStaff(payload: WorkGrandStaffCropPayload) {
  const pdf = pdfRef.value
  if (!pdf) return
  try {
    await pdf.cropScoreByGrandStaff(payload.id, payload.from, payload.to, {
      keepFrame: payload.keepFrame,
      keepY: payload.keepY
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.props.cropFailed'))
  }
  editHistory.checkpoint()
}

function onPropertyClearCrop(payload: { keepFrame: boolean }) {
  const target = propertyTarget.value
  if (target) pdfRef.value?.clearCrop(target.item.id, { keepFrame: payload.keepFrame })
}

/** 插件裁剪模式目标 id（cropModeChange 同步；右键「裁剪」/ Esc / Enter 也会改变） */
const cropModeTargetId = ref<string | null>(null)

function onCropModeChange(payload: SjwSelection) {
  cropModeTargetId.value = payload
    ? payload.kind === 'score'
      ? payload.score.id
      : payload.element.id
    : null
}

const propertyCropping = computed(
  () => !!propertyTarget.value && propertyTarget.value.item.id === cropModeTargetId.value
)

async function onPropertyToggleCropMode() {
  const pdf = pdfRef.value
  const target = propertyTarget.value
  if (!pdf || !target) return
  if (propertyCropping.value) {
    pdf.endCrop()
    return
  }
  try {
    await pdf.startCrop(target.item.id)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.props.cropFailed'))
  }
  editHistory.checkpoint()
}

type WorkExportCommand = 'sjw' | 'images' | 'pdf'

async function handleExport(command: WorkExportCommand) {
  const pdf = pdfRef.value
  if (!pdf || !workData.value || busy.value) return
  busy.value = true
  const exportingText = t('common.exporting')
  const pageOptions = {
    filename: workData.value.name || 'work',
    onProgress: (done: number, total: number) => {
      globalLoading.text = t('work.exportProgress', { text: exportingText, done, total })
    },
    onWarning: (message: string) => {
      ElMessage.warning({ message, duration: 5000 })
    }
  }
  try {
    await globalLoading.run(exportingText, async () => {
      if (command === 'sjw') await pdf.exportSjw(`${pageOptions.filename}.sjw`)
      else if (command === 'images') await pdf.exportImages(pageOptions)
      else await pdf.exportPdf(pageOptions)
      ElMessage.success(t('work.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.exportFailed'))
  } finally {
    busy.value = false
  }
}

function openImport() {
  importInputRef.value?.click()
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !pdfRef.value || !workData.value) return
  busy.value = true
  try {
    await globalLoading.run(t('common.importing'), async () => {
      const loaded = await pdfRef.value!.loadSjw(file)
      applySjwInPlace(workData.value!, loaded)
      pageIndex.value = 0
      editHistory.reset()
      const blob = await pdfRef.value!.exportSjw()
      dataStore.setTempWorkBlob(tempId.value, blob)
      ElMessage.success(t('work.importSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.importFailed'))
  } finally {
    busy.value = false
  }
}

function onLoaded(payload: { data: SJW }) {
  if (!workData.value) return
  applySjwInPlace(workData.value, payload.data)
  editHistory.reset()
  void ensureToneColor()
}

function findScoreIndex(score: SScore): number {
  const page = workData.value?.pages[pageIndex.value]
  return page?.scores?.findIndex((s) => s.id === score.id) ?? -1
}

function openMediaPreview(kind: 'image' | 'video', src: string, title?: string) {
  if (!src) return
  mediaPreviewKind.value = kind
  mediaPreviewSrc.value = src
  mediaPreviewTitle.value = title ?? ''
  mediaPreviewOpen.value = true
}

function elementTypeOf(payload: ElementContextMenuPayload): string | undefined {
  return (payload.element as { type?: string } | undefined)?.type
}

function enlargeElement(payload: ElementContextMenuPayload) {
  const el = payload.element
  if (!el) return
  const type = elementTypeOf(payload)
  if (type === 'image' && 'src' in el) {
    openMediaPreview('image', pdfRef.value?.resolveSrc(el.src) ?? '')
    return
  }
  if (type === 'video' && 'src' in el) {
    pdfRef.value?.pauseMedia(el.id)
    openMediaPreview('video', pdfRef.value?.resolveSrc((el as { src: string }).src) ?? '')
  }
}

async function playScoreNotes(payload: ElementContextMenuPayload) {
  if (payload.score) await playScore(payload.score)
}

/** 该曲谱处于选段模式时只按完整选段播放；起止未选齐则提示 */
async function playScore(score: SScore) {
  const pdf = pdfRef.value
  if (!pdf) return
  const idx = findScoreIndex(score)
  if (idx < 0) {
    ElMessage.warning(mt('work.menu.scoreMissing', '找不到曲谱', 'Score not found'))
    return
  }
  const range = rangeSelect.value?.scoreId === score.id ? { ...rangeSelect.value } : null
  if (range && !rangeComplete.value) {
    ElMessage.warning(
      mt('work.range.incomplete', '请先点击音符选择起始和结束音符', 'Pick the start and end notes first')
    )
    return
  }
  try {
    if (tonePdf !== pdf || !toneReady.value) {
      await ensureToneColor()
    }
    if (!toneReady.value || tonePdf !== pdf) {
      ElMessage.warning(mt('work.menu.toneLoading', '音色加载中，请稍后再试', 'Tone is still loading'))
      return
    }
    pdf.setToneColorName(await ensureScoreToneColors(pdf, score.musicScore))
    await rangePdf()!.play(idx, range ? { range } : undefined)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : mt('work.menu.playFailed', '播放失败', 'Playback failed'))
  }
}

async function playScoreVocal(payload: ElementContextMenuPayload) {
  const score = payload.score
  const pdf = pdfRef.value
  if (!score || !pdf || !payload.vocalPerformance) return
  const idx = findScoreIndex(score)
  if (idx < 0) return
  try {
    await pdf.playVocal(idx)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : mt('work.menu.playFailed', '播放失败', 'Playback failed'))
  }
}

async function playScoreAccompaniment(payload: ElementContextMenuPayload) {
  const score = payload.score
  const pdf = pdfRef.value
  if (!score || !pdf || !payload.accompaniment) return
  const idx = findScoreIndex(score)
  if (idx < 0) return
  try {
    await pdf.playAccompaniment(idx)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : mt('work.menu.playFailed', '播放失败', 'Playback failed'))
  }
}

async function storeResolvedTempAudio(
  key: string,
  audio: ResolvedScoreAudio | undefined
): Promise<boolean> {
  if (!audio) return false

  // 只持久化二进制，不存作品页 AssetStore 的 blob: URL（离页即失效）
  if (audio.file) {
    const buffer = await audio.file.arrayBuffer()
    tempAudioStore.setTempAudio(key, {
      buffer,
      mimeType: audio.file.type || 'audio/mpeg',
      name: audio.name
    })
    return true
  }

  const url = audio.url?.trim()
  if (!url) return false

  if (url.startsWith('blob:')) {
    try {
      const res = await fetch(url)
      if (!res.ok) return false
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      tempAudioStore.setTempAudio(key, {
        buffer,
        mimeType: blob.type || 'audio/mpeg',
        name: audio.name
      })
      return true
    } catch {
      return false
    }
  }

  tempAudioStore.setTempAudio(key, { url, name: audio.name })
  return true
}

async function enterSingingMode(payload: ElementContextMenuPayload) {
  const score = payload.score
  if (!score) return
  if (!payload.vocalPerformance && !payload.accompaniment) return

  dataStore.setTempScore(
    WORK_SINGING_SCORE_TEMP_ID,
    JSON.parse(JSON.stringify(score.musicScore)) as MusicScore
  )

  const vocalKey = workSingingVocalAudioKey(score.id)
  const accompKey = workSingingAccompanimentAudioKey(score.id)
  const query: Record<string, string> = { tempId: WORK_SINGING_SCORE_TEMP_ID }

  const hasVocal = await storeResolvedTempAudio(vocalKey, payload.vocalPerformance)
  if (hasVocal) query.vocalAudioKey = vocalKey

  const hasAccomp = await storeResolvedTempAudio(accompKey, payload.accompaniment)
  if (hasAccomp) query.accompanimentAudioKey = accompKey

  pdfRef.value?.stop()
  await router.push({ name: 'singing', query })
}

function frameOf(payload: ElementContextMenuPayload): {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
} | null {
  if (payload.kind === 'score') return payload.score ?? null
  return payload.element ?? null
}

/** 扶正：旋转角归 0 */
function straightenTarget(payload: ElementContextMenuPayload) {
  const frame = frameOf(payload)
  if (!frame) return
  frame.rotation = 0
}

/** 水平居中：放置框中心对齐页面水平中线 */
function centerHorizontally(payload: ElementContextMenuPayload) {
  const frame = frameOf(payload)
  const page = payload.page
  if (!frame || !page) return
  frame.x = page.width / 2 - frame.width / 2
}

type CropSize = { crop?: { width: number; height: number } }

/** 有裁剪时框里只显示裁剪区域，比例要按裁剪区域算 */
function cropSizeOf(target: unknown): { width: number; height: number } | null {
  const crop = (target as CropSize).crop
  return crop && crop.width > 0 && crop.height > 0 ? crop : null
}

/** 比例恢复：框宽不变，按可见区域（裁剪区域或整份曲谱）的宽高比重算框高 */
function restoreScoreProportion(payload: ElementContextMenuPayload) {
  const score = payload.score
  if (!score?.musicScore) return
  const view = cropSizeOf(score) ?? {
    width: Number(score.musicScore.width),
    height: Number(score.musicScore.height)
  }
  if (!Number.isFinite(view.width) || view.width <= 0 || !Number.isFinite(view.height) || view.height <= 0) {
    return
  }
  score.height = score.width * (view.height / view.width)
}

/** work 类型声明未导出 readImageSize / readVideoSize；比例恢复按原始像素读宽高 */
function readImageSize(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      if (!(width > 0 && height > 0)) {
        reject(new Error('无法读取图片原始宽高'))
        return
      }
      resolve({ width, height })
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = source
  })
}

function readVideoSize(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.onloadedmetadata = () => {
      const width = video.videoWidth
      const height = video.videoHeight
      video.removeAttribute('src')
      video.load()
      if (!(width > 0 && height > 0)) {
        reject(new Error('无法读取视频原始宽高'))
        return
      }
      resolve({ width, height })
    }
    video.onerror = () => reject(new Error('视频加载失败'))
    video.src = source
  })
}

/** 比例恢复：框宽不变，按图片裁剪区域或图片/视频原始像素比重算框高 */
async function restoreMediaProportion(payload: ElementContextMenuPayload) {
  const el = payload.element
  const pdf = pdfRef.value
  if (!el || !pdf || !('src' in el) || typeof (el as { src?: unknown }).src !== 'string') return
  const type = elementTypeOf(payload)
  if (type !== 'image' && type !== 'video') return
  const crop = type === 'image' ? cropSizeOf(el) : null
  if (crop) {
    ;(el as { height: number }).height = (el as { width: number }).width * (crop.height / crop.width)
    return
  }
  const url = pdf.resolveSrc((el as { src: string }).src)
  if (!url) {
    ElMessage.warning(mt('work.menu.restoreProportionFailed', '无法读取素材尺寸', 'Cannot read media size'))
    return
  }
  try {
    const size = type === 'image' ? await readImageSize(url) : await readVideoSize(url)
    if (!(size.width > 0) || !(size.height > 0)) return
    ;(el as { height: number }).height =
      (el as { width: number }).width * (size.height / size.width)
  } catch (error) {
    ElMessage.error(
      error instanceof Error
        ? error.message
        : mt('work.menu.restoreProportionFailed', '无法读取素材尺寸', 'Cannot read media size')
    )
  }
}

function buildEditMenu(payload: ElementContextMenuPayload): ElementContextMenuItem[] {
  const items: ElementContextMenuItem[] = [
    {
      text: mt('work.menu.straighten', '扶正', 'Straighten'),
      callback: (p) => straightenTarget(p)
    },
    {
      text: mt('work.menu.centerHorizontal', '水平居中', 'Center horizontally'),
      callback: (p) => centerHorizontally(p)
    }
  ]
  if (payload.kind === 'score') {
    items.push(
      {
        text: mt('work.menu.restoreScoreProportion', '比例恢复', 'Restore proportion'),
        callback: (p) => restoreScoreProportion(p)
      }
    )
    return items
  }

  const type = elementTypeOf(payload)
  if (type === 'image' || type === 'video') {
    items.push({
      text: mt('work.menu.restoreScoreProportion', '比例恢复', 'Restore proportion'),
      callback: (p) => {
        void restoreMediaProportion(p)
      }
    })
  }
  return items
}

function buildShowImageMenu(): ElementContextMenuItem[] {
  return [
    {
      text: mt('work.menu.enlarge', '放大', 'Enlarge'),
      callback: (p) => enlargeElement(p)
    }
  ]
}

function buildShowVideoMenu(): ElementContextMenuItem[] {
  return [
    {
      text: mt('work.menu.play', '播放', 'Play'),
      callback: (p) => enlargeElement(p)
    },
    {
      text: mt('work.menu.enlarge', '放大', 'Enlarge'),
      callback: (p) => enlargeElement(p)
    }
  ]
}

function buildRangeMenu(payload: ElementContextMenuPayload): ElementContextMenuItem[] {
  const score = payload.score
  if (!score) return []
  if (rangeSelect.value?.scoreId !== score.id) {
    return [
      {
        text: mt('work.range.start', '选段', 'Select range'),
        callback: () => startScoreRange(score)
      }
    ]
  }
  return [
    {
      text: mt('work.range.clear', '清空选段', 'Clear range'),
      disabled: !rangeSelect.value.startNoteId,
      callback: () => clearScoreRange()
    },
    {
      text: mt('work.range.end', '结束选段', 'Exit range'),
      callback: () => endScoreRange()
    }
  ]
}

function buildShowScoreMenu(payload: ElementContextMenuPayload): ElementContextMenuItem[] {
  const hasVocal = !!payload.vocalPerformance
  const hasAccomp = !!payload.accompaniment
  return [
    {
      text: mt('work.menu.play', '播放', 'Play'),
      callback: (p) => {
        void playScoreNotes(p)
      }
    },
    ...buildRangeMenu(payload),
    {
      text: mt('work.menu.playVocal', '播放范唱', 'Play vocal'),
      disabled: !hasVocal,
      callback: (p) => {
        void playScoreVocal(p)
      }
    },
    {
      text: mt('work.menu.playAccompaniment', '播放伴奏', 'Play accompaniment'),
      disabled: !hasAccomp,
      callback: (p) => {
        void playScoreAccompaniment(p)
      }
    },
    {
      text: mt('work.menu.pause', '暂停', 'Pause'),
      callback: () => {
        pdfRef.value?.pause()
      }
    },
    {
      text: mt('work.menu.stop', '停止', 'Stop'),
      callback: () => {
        pdfRef.value?.stop()
      }
    },
    {
      text: mt('work.menu.enterSinging', '进入演唱模式', 'Enter singing mode'),
      disabled: !hasVocal && !hasAccomp,
      callback: (p) => {
        void enterSingingMode(p)
      }
    }
  ]
}

/**
 * 编辑页：扶正 / 水平居中；曲谱额外「高度修改」。包内仍自带「删除」。
 * 展示页：按图片 / 视频 / 曲谱组装菜单；范唱伴奏缺失时项保留但 disabled。
 */
function onBeforeContextMenu(payload: ElementContextMenuPayload) {
  if (payload.mode === 'edit') {
    workContextMenu.value = buildEditMenu(payload)
    return
  }

  if (payload.kind === 'score') {
    workContextMenu.value = buildShowScoreMenu(payload)
    return
  }

  const type = elementTypeOf(payload)
  if (type === 'image') {
    workContextMenu.value = buildShowImageMenu()
    return
  }
  if (type === 'video') {
    workContextMenu.value = buildShowVideoMenu()
    return
  }
  workContextMenu.value = []
}

</script>

<template>
  <div class="work-studio">
    <header class="work-studio__top">
      <BackButton fallback="/my-works" />
      <div class="work-studio__center">
        <template v-if="mode === 'edit'">
          <button
            type="button"
            class="top-btn"
            :title="t('work.undoHint')"
            :disabled="busy || !editHistory.canUndo.value"
            @click="editHistory.undo()"
          >
            {{ t('work.undo') }}
          </button>
          <button
            type="button"
            class="top-btn"
            :title="t('work.redoHint')"
            :disabled="busy || !editHistory.canRedo.value"
            @click="editHistory.redo()"
          >
            {{ t('work.redo') }}
          </button>
        </template>
        <button
          v-if="mode === 'edit'"
          type="button"
          class="top-btn"
          @click="settingsDialogOpen = true"
        >
          {{ t('work.settings') }}
        </button>
        <button type="button" class="top-btn" @click="toggleMode">
          {{ mode === 'edit' ? t('work.modeShow') : t('work.modeEdit') }}
        </button>
        <button
          v-if="mode === 'edit'"
          type="button"
          class="top-btn top-btn--primary"
          :disabled="busy"
          @click="openSave"
        >
          {{ t('work.save') }}
        </button>
        <button type="button" class="top-btn" :disabled="busy" @click="openImport">
          {{ t('work.import') }}
        </button>
        <el-dropdown trigger="click" :disabled="busy" @command="handleExport">
          <button type="button" class="top-btn" :disabled="busy">
            {{ t('work.export') }}
            <el-icon class="top-btn__arrow"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="sjw">{{ t('work.exportFormat.sjw') }}</el-dropdown-item>
              <el-dropdown-item command="images">{{ t('work.exportFormat.images') }}</el-dropdown-item>
              <el-dropdown-item command="pdf">{{ t('work.exportFormat.pdf') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <label class="work-volume" :title="t('work.volume')">
          <span class="work-volume__label">{{ t('work.volume') }}</span>
          <el-slider
            class="work-volume__slider"
            :model-value="workVolume"
            :min="PLAY_VOLUME_MIN"
            :max="PLAY_VOLUME_MAX"
            :step="0.01"
            :show-tooltip="true"
            :format-tooltip="(v: number) => `${Math.round(v * 100)}%`"
            @update:model-value="onWorkVolumeChange"
          />
        </label>
        <div v-if="mode === 'show'" class="work-annotate" :title="t('work.annotate.hint')">
          <button
            type="button"
            class="top-btn"
            :class="{ 'top-btn--primary': drawing }"
            @click="onToggleDraw"
          >
            {{ t('work.annotate.start') }}
          </button>
          <button
            type="button"
            class="top-btn top-btn--chip"
            :class="{ 'is-on': drawing && drawTool === DrawToolEnum.Pen }"
            :disabled="!drawing"
            @click="onDrawToolChange(DrawToolEnum.Pen)"
          >
            {{ t('work.annotate.pen') }}
          </button>
          <button
            type="button"
            class="top-btn top-btn--chip"
            :class="{ 'is-on': drawing && drawTool === DrawToolEnum.Eraser }"
            :disabled="!drawing"
            @click="onDrawToolChange(DrawToolEnum.Eraser)"
          >
            {{ t('work.annotate.eraser') }}
          </button>
          <el-color-picker
            class="work-annotate__color"
            size="small"
            :model-value="drawColor"
            :disabled="!drawing || drawTool !== DrawToolEnum.Pen"
            @update:model-value="onDrawColorChange"
          />
          <el-input-number
            class="work-annotate__width"
            size="small"
            :model-value="drawLineWidth"
            :min="1"
            :max="80"
            :step="1"
            :disabled="!drawing"
            controls-position="right"
            @update:model-value="(v) => v != null && onDrawLineWidthChange(Number(v))"
          />
          <button type="button" class="top-btn top-btn--chip" @click="onClearDrawings">
            {{ t('work.annotate.clear') }}
          </button>
        </div>
      </div>
      <div class="work-studio__spacer" />
    </header>

    <div v-if="ready && workData" class="work-studio__body">
      <div v-if="rangeSelect && mode === 'show'" class="work-range-bar">
        <span class="work-range-bar__label">{{ t('work.range.title') }}</span>
        <span class="work-range-bar__hint">{{ rangeHint }}</span>
        <button
          type="button"
          class="top-btn top-btn--primary"
          :disabled="!rangeComplete"
          @click="playRangeFromBar"
        >
          {{ t('work.range.play') }}
        </button>
        <button type="button" class="top-btn" @click="pdfRef?.stop()">
          {{ t('work.menu.stop') }}
        </button>
        <button
          type="button"
          class="top-btn"
          :disabled="!rangeSelect.startNoteId"
          @click="clearScoreRange"
        >
          {{ t('work.range.clear') }}
        </button>
        <button type="button" class="top-btn" @click="endScoreRange">
          {{ t('work.range.end') }}
        </button>
      </div>

      <WorkThumbnailRail
        :data="workData"
        :page-index="pageIndex"
        :editable="mode === 'edit'"
        :can-paste="canPastePage"
        :pdf-ref="pdfRef"
        @select="selectPage"
        @add-page="handleAddPage"
        @insert-page="handleInsertPage"
        @remove-page="handleRemovePage"
        @duplicate-page="handleDuplicatePage"
        @copy-page="handleCopyPage"
        @paste-page="handlePastePage"
        @remove-page-at="handleRemovePageAt"
      />

      <div class="work-studio__canvas">
        <SJWPDF
          ref="pdfRef"
          :data="workData"
          :mode="mode"
          :page-index="pageIndex"
          :context-menu="workContextMenu"
          @before-context-menu="onBeforeContextMenu"
          @loaded="onLoaded"
          @range-change="onRangeChange"
          @selection-change="onSelectionChange"
          @crop-mode-change="onCropModeChange"
        />
        <WorkElementPropertyPanel
          v-if="propertyTarget"
          class="work-studio__props"
          :target="propertyTarget"
          :asset-name="propertyAssetName"
          :cropping="propertyCropping"
          @patch="onPropertyPatch"
          @text-style="onPropertyTextStyle"
          @crop="onPropertyCrop"
          @crop-by-grand-staff="onPropertyCropByGrandStaff"
          @clear-crop="onPropertyClearCrop"
          @toggle-crop-mode="onPropertyToggleCropMode"
        />
      </div>

      <WorkEditToolbar
        v-if="mode === 'edit'"
        :drawing="drawing"
        :draw-tool="drawTool"
        :draw-line-width="drawLineWidth"
        :draw-color="drawColor"
        @open-assets="assetDialogOpen = true"
        @open-background="backgroundDialogOpen = true"
        @clear-background="onClearBackground"
        @add-text="onAddText"
        @add-score="onAddScore"
        @toggle-draw="onToggleDraw"
        @update:draw-tool="onDrawToolChange"
        @update:draw-line-width="onDrawLineWidthChange"
        @update:draw-color="onDrawColorChange"
        @clear-drawings="onClearDrawings"
      />
    </div>

    <input
      ref="importInputRef"
      class="work-studio__file"
      type="file"
      accept=".sjw,application/zip"
      @change="onImportFile"
    />

    <WorkAssetPickerDialog v-model="assetDialogOpen" purpose="element" @confirm="onAssetConfirm" />
    <WorkAssetPickerDialog
      v-model="backgroundDialogOpen"
      purpose="background"
      @confirm="onBackgroundConfirm"
    />
    <WorkSettingsDialog
      v-model="settingsDialogOpen"
      :work-name="workData?.name ?? ''"
      :work-author="workData?.author ?? ''"
      :default-width="newPageWidth"
      :default-height="newPageHeight"
      :current-width="settingsCurrentWidth"
      :current-height="settingsCurrentHeight"
      @apply-default="onApplyDefaultPageSize"
      @apply-default-all="onApplyDefaultPageSizeAll"
      @apply-current="onApplyCurrentPageSize"
      @apply-current-all="onApplyCurrentPageSizeAll"
      @apply-info="onApplyWorkInfo"
    />
    <WorkSaveDialog
      v-model="saveDialogOpen"
      :name="workData?.name ?? ''"
      :author="workData?.author ?? ''"
      @confirm="onSaveConfirm"
    />
    <WorkMediaPreviewDialog
      v-model="mediaPreviewOpen"
      :kind="mediaPreviewKind"
      :src="mediaPreviewSrc"
      :title="mediaPreviewTitle"
    />
  </div>
</template>

<style scoped>
.work-studio {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.work-studio__top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.92);
}

.work-studio__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.work-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  max-width: 200px;
  padding: 0 10px 0 12px;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  box-sizing: border-box;
}

.work-volume__label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.work-volume__slider {
  flex: 1;
  min-width: 72px;
  margin: 0;
}

.work-annotate {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 100%;
}

.work-annotate__color {
  flex-shrink: 0;
}

.work-annotate__width {
  width: 108px;
}

.work-studio__spacer {
  min-width: 0;
}

.top-btn {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.top-btn--chip {
  padding: 0 10px;
}

.top-btn__arrow {
  margin-left: 4px;
  vertical-align: -2px;
}

.top-btn--chip.is-on {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.top-btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.top-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.work-range-bar {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: calc(100% - 32px);
  flex-wrap: wrap;
  justify-content: center;
  padding: 6px 8px 6px 12px;
  border: 1px solid rgba(201, 184, 255, 0.6);
  border-radius: 999px;
  background: rgba(248, 243, 255, 0.96);
  box-shadow: 0 6px 18px rgba(124, 77, 255, 0.18);
  box-sizing: border-box;
}

.work-range-bar__label {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.work-range-bar__hint {
  font-size: 13px;
  font-weight: 700;
  color: #6b4f8a;
}

.work-studio__body {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}

.work-studio__canvas {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 浮层，不占布局：选中即出现，若挤窄画布会让居中的页面整体平移 */
.work-studio__props {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  max-height: calc(100% - 24px);
}

.work-studio__file {
  display: none;
}
</style>
