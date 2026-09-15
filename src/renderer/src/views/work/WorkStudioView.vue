<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { ToneColor } from '@deciphony/player'
import SJWPDF, {
  DrawToolEnum,
  type ElementContextMenuItem,
  type ElementContextMenuPayload,
  type ResolvedScoreAudio,
  type SJW,
  type SjwMode,
  type SScore
} from '@deciphony/work'
import type { MusicScore } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import WorkThumbnailRail from '@renderer/views/work/WorkThumbnailRail.vue'
import WorkEditToolbar from '@renderer/views/work/WorkEditToolbar.vue'
import WorkAssetPickerDialog from '@renderer/views/work/WorkAssetPickerDialog.vue'
import WorkSaveDialog from '@renderer/views/work/WorkSaveDialog.vue'
import WorkSettingsDialog from '@renderer/views/work/WorkSettingsDialog.vue'
import WorkMediaPreviewDialog from '@renderer/views/work/WorkMediaPreviewDialog.vue'
import {
  CUR_SHOW_WORK_TEMP_ID,
  WORK_SINGING_SCORE_TEMP_ID,
  workSingingAccompanimentAudioKey,
  workSingingVocalAudioKey
} from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { useTempAudioStore } from '@renderer/store/tempAudio.store'
import { PIANO_TONE_COLOR_NAME } from '@renderer/store/play.store'
import pianoTone from '@renderer/toneColor/accoustic_grand_piano.json'
import i18n from '@renderer/i18n'
import {
  applySjwInPlace,
  buildWorkRouteQuery,
  ensureWorkHasPage,
  loadWorkFromRoute,
  resolveEditorWorkTempId,
  resolveWorkId
} from '@renderer/utils/workRoute'
import { loadWorkPageSize, saveWorkPageSize } from '@renderer/utils/workPageSizeStorage'
import { saveWorkToDatabase } from '@renderer/utils/fileHelper/workFile'
import { resolveBoundScoreAudios } from '@renderer/utils/work/resolveBoundScoreAudios'
import type { AssetPickKind } from '@renderer/views/work/WorkAssetPickerDialog.vue'

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
  return loc === 'en' ? en : zh
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
const saveDialogOpen = ref(false)
const settingsDialogOpen = ref(false)
const importInputRef = ref<HTMLInputElement | null>(null)
const mediaPreviewOpen = ref(false)
const mediaPreviewKind = ref<'image' | 'video'>('image')
const mediaPreviewSrc = ref('')
const mediaPreviewTitle = ref('')
const toneReady = ref(false)
/** 由 @before-context-menu 按目标动态写入 */
const workContextMenu = ref<ElementContextMenuItem[]>([])

const storedPageSize = loadWorkPageSize()
const newPageWidth = ref(storedPageSize.width)
const newPageHeight = ref(storedPageSize.height)

const drawing = ref(false)
const drawTool = ref<DrawToolEnum>(DrawToolEnum.Pen)
const drawLineWidth = ref(3)

const mode = computed<SjwMode>(() => (route.name === 'workEdit' ? 'edit' : 'show'))
const workId = computed(() => resolveWorkId(route.query.workId))
const tempId = computed(() => resolveEditorWorkTempId(route))
const isExisting = computed(() => !!workId.value)

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
  // 每次挂到当前 SJWPDF 实例上都要 setToneColorName；音色 buffer 进全局缓存后可跳过重复 decode
  if (!toneReady.value) {
    await pdf.addToneColor(PIANO_TONE_COLOR_NAME, pianoTone as ToneColor)
    toneReady.value = true
  }
  pdf.setToneColorName(PIANO_TONE_COLOR_NAME)
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
  } finally {
    globalLoading.hide()
  }
}

watch(
  () => [route.name, route.query.workId, route.query.tempId] as const,
  async (_next, prev) => {
    if (!prev) return
    const [prevName, prevWorkId, prevTempId] = prev
    // 同作品 edit↔show：只改 mode，不重载
    if (
      (prevName === 'workEdit' || prevName === 'workShow') &&
      (route.name === 'workEdit' || route.name === 'workShow') &&
      String(prevWorkId ?? '') === String(route.query.workId ?? '') &&
      String(prevTempId ?? '') === String(route.query.tempId ?? '')
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
  void bootstrap()
})

onBeforeUnmount(() => {
  if (drawing.value) {
    drawing.value = false
    pdfRef.value?.endDraw()
  }
  pdfRef.value?.stop()
  void snapshotBlob()
})

watch(mode, (m) => {
  if (m !== 'edit' && drawing.value) {
    drawing.value = false
    pdfRef.value?.endDraw()
  }
})

function toggleMode() {
  const nextName = mode.value === 'edit' ? 'workShow' : 'workEdit'
  if (nextName === 'workShow' && drawing.value) {
    drawing.value = false
    pdfRef.value?.endDraw()
  }
  void snapshotBlob().then(() => {
    router.replace({
      name: nextName,
      query: buildWorkRouteQuery(route)
    })
  })
}

function syncDrawToolToPdf() {
  const pdf = pdfRef.value
  if (!pdf || !drawing.value) return
  pdf.setTool(drawTool.value, { lineWidth: drawLineWidth.value })
}

function applyDrawSession() {
  const pdf = pdfRef.value
  if (!pdf) return
  if (!drawing.value) {
    pdf.endDraw()
    return
  }
  pdf.startDraw()
  syncDrawToolToPdf()
}

function onToggleDraw() {
  drawing.value = !drawing.value
  applyDrawSession()
}

function onDrawToolChange(tool: DrawToolEnum) {
  drawTool.value = tool
  syncDrawToolToPdf()
}

function onDrawLineWidthChange(width: number) {
  drawLineWidth.value = width
  syncDrawToolToPdf()
}

function onClearDrawings() {
  pdfRef.value?.clearDrawings()
}

function selectPage(index: number) {
  pageIndex.value = index
  if (drawing.value) {
    void nextTick(() => applyDrawSession())
  }
}

function handleAddPage() {
  const pdf = pdfRef.value
  if (!pdf) return
  const { index } = pdf.addPage({
    width: newPageWidth.value,
    height: newPageHeight.value
  })
  pageIndex.value = index
}

function handleInsertPage() {
  const pdf = pdfRef.value
  if (!pdf) return
  const { index } = pdf.insertPage(pageIndex.value, {
    width: newPageWidth.value,
    height: newPageHeight.value
  })
  pageIndex.value = index
}

function handleRemovePage() {
  const pdf = pdfRef.value
  if (!pdf || !workData.value) return
  const ok = pdf.removePage(pageIndex.value)
  if (!ok) return
  if (pageIndex.value >= workData.value.pages.length) {
    pageIndex.value = Math.max(0, workData.value.pages.length - 1)
  }
}

function persistNewPageSize(width: number, height: number) {
  newPageWidth.value = width
  newPageHeight.value = height
  saveWorkPageSize({ width, height })
}

function onApplyPageSizeAll(payload: { width: number; height: number }) {
  if (!workData.value) return
  persistNewPageSize(payload.width, payload.height)
  for (const page of workData.value.pages) {
    page.width = payload.width
    page.height = payload.height
  }
  ElMessage.success(t('work.applyPageSizeSuccess'))
}

watch([newPageWidth, newPageHeight], ([width, height]) => {
  saveWorkPageSize({ width, height })
})

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
  if (payload.kind === 'image') {
    await pdf.addImageFromFile({
      x: PLACE_X,
      y: PLACE_Y,
      file: payload.file,
      name: payload.item.name
    })
    return
  }
  pdf.addAudioFromFile({
    x: PLACE_X,
    y: PLACE_Y,
    file: payload.file,
    name: payload.item.name
  })
}

function onAddScore(payload: { musicScore: unknown; scale: number }) {
  void addScoreToPage(payload)
}

async function addScoreToPage(payload: { musicScore: unknown; scale: number }) {
  const pdf = pdfRef.value
  const page = workData.value?.pages[pageIndex.value]
  if (!pdf || !page) return
  const musicScore = JSON.parse(JSON.stringify(payload.musicScore)) as MusicScore
  const bound = await resolveBoundScoreAudios(musicScore)
  const id = pdf.addScore({
    x: PLACE_X,
    y: PLACE_Y,
    musicScore,
    ...(bound.vocalPerformance
      ? { vocalPerformance: { file: bound.vocalPerformance.file, name: bound.vocalPerformance.name } }
      : {}),
    ...(bound.accompaniment
      ? { accompaniment: { file: bound.accompaniment.file, name: bound.accompaniment.name } }
      : {})
  })
  const score = page.scores?.find((s) => s.id === id)
  if (score) {
    const scale = payload.scale > 0 ? payload.scale : 0.5
    score.width = score.width * scale
    score.height = score.height * scale
  }
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

async function handleExport() {
  const pdf = pdfRef.value
  if (!pdf || !workData.value || busy.value) return
  busy.value = true
  try {
    await globalLoading.run(t('common.exporting'), async () => {
      const filename = `${workData.value!.name || 'work'}.sjw`
      await pdf.exportSjw(filename)
      ElMessage.success(t('work.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('work.exportSuccess'))
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
    openMediaPreview('video', pdfRef.value?.resolveSrc((el as { src: string }).src) ?? '')
  }
}

async function playScoreNotes(payload: ElementContextMenuPayload) {
  const score = payload.score
  const pdf = pdfRef.value
  if (!score || !pdf) return
  const idx = findScoreIndex(score)
  if (idx < 0) {
    ElMessage.warning(mt('work.menu.scoreMissing', '找不到曲谱', 'Score not found'))
    return
  }
  try {
    if (!toneReady.value) {
      ElMessage.warning(mt('work.menu.toneLoading', '音色加载中，请稍后再试', 'Tone is still loading'))
      void ensureToneColor()
      return
    }
    pdf.setToneColorName(PIANO_TONE_COLOR_NAME)
    await pdf.play(idx)
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
      callback: () => {
        ElMessage.warning(mt('work.assets.videoUnavailable', '视频元素尚在开发中', 'Video elements are not ready yet'))
      }
    },
    {
      text: mt('work.menu.pause', '暂停', 'Pause'),
      callback: () => {
        /* video element API 未就绪 */
      }
    },
    {
      text: mt('work.menu.stop', '停止', 'Stop'),
      callback: () => {
        /* video element API 未就绪 */
      }
    },
    {
      text: mt('work.menu.enlarge', '放大', 'Enlarge'),
      callback: (p) => enlargeElement(p)
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
 * 编辑页：仅包内自带「删除」，自定义项为空。
 * 展示页：按图片 / 视频 / 曲谱组装菜单；范唱伴奏缺失时项保留但 disabled。
 */
function onBeforeContextMenu(payload: ElementContextMenuPayload) {
  if (payload.mode === 'edit') {
    workContextMenu.value = []
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
        <button type="button" class="top-btn top-btn--primary" :disabled="busy" @click="openSave">
          {{ t('work.save') }}
        </button>
        <button type="button" class="top-btn" :disabled="busy" @click="openImport">
          {{ t('work.import') }}
        </button>
        <button type="button" class="top-btn" :disabled="busy" @click="handleExport">
          {{ t('work.export') }}
        </button>
      </div>
      <div class="work-studio__spacer" />
    </header>

    <div v-if="ready && workData" class="work-studio__body">
      <WorkThumbnailRail
        :data="workData"
        :page-index="pageIndex"
        :editable="mode === 'edit'"
        :pdf-ref="pdfRef"
        @select="selectPage"
        @add-page="handleAddPage"
        @insert-page="handleInsertPage"
        @remove-page="handleRemovePage"
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
        />
      </div>

      <WorkEditToolbar
        v-if="mode === 'edit'"
        :drawing="drawing"
        :draw-tool="drawTool"
        :draw-line-width="drawLineWidth"
        @open-assets="assetDialogOpen = true"
        @add-text="onAddText"
        @add-score="onAddScore"
        @toggle-draw="onToggleDraw"
        @update:draw-tool="onDrawToolChange"
        @update:draw-line-width="onDrawLineWidthChange"
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

    <WorkAssetPickerDialog v-model="assetDialogOpen" @confirm="onAssetConfirm" />
    <WorkSettingsDialog
      v-model="settingsDialogOpen"
      v-model:page-width="newPageWidth"
      v-model:page-height="newPageHeight"
      @apply-all="onApplyPageSizeAll"
    />
    <WorkSaveDialog
      v-model="saveDialogOpen"
      :name="workData?.name ?? ''"
      :author="workData?.author ?? ''"
      :existing="isExisting"
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

.top-btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.top-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.work-studio__body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.work-studio__canvas {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.work-studio__file {
  display: none;
}
</style>
