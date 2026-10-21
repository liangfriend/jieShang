<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { shortcutKey } from '@renderer/utils/shortcutKey'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ClSheet,
  parseChordLyrics,
  stringifyChordLyrics,
  type ClSheetData,
  type ClSheetMode
} from '@deciphony/cl-sheet'
import '@deciphony/cl-sheet/dist/cl-sheet.css'
import type { MusicScore } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import {
  CL_SHEET_EMBEDDED_HEIGHT_RANGE,
  CL_SHEET_EMBEDDED_SCALE_RANGE,
  DEFAULT_CL_SHEET_EMBEDDED_SCORE,
  DEFAULT_CL_SHEET_STYLE,
  DEFAULT_CL_SHEET_WIDTH,
  copyScoreForClSheet,
  createEmptyClSheet,
  exportClSheetToDisk,
  importClSheetFromDisk,
  loadClSheetFromDatabase,
  readClSheetDescription,
  readClSheetEmbeddedScore,
  readClSheetStyle,
  saveClSheetToDatabase,
  writeClSheetDescription,
  writeClSheetEmbeddedScore,
  writeClSheetStyle,
  type ClSheetStyle
} from '@renderer/utils/fileHelper/clSheetFile'
import {
  displayScoreName,
  searchScoresFromDatabase,
  type ScoreListItem
} from '@renderer/utils/fileHelper/scoreFile'
import ClSheetEmbeddedScore from './ClSheetEmbeddedScore.vue'

const MIN_SHEET_HEIGHT = 200

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const globalLoading = useGlobalLoadingStore()

const sheet = ref<ClSheetData>(createEmptyClSheet())
const style = reactive<ClSheetStyle>({ ...DEFAULT_CL_SHEET_STYLE })
const description = ref('')
const embedded = reactive({
  name: DEFAULT_CL_SHEET_EMBEDDED_SCORE.name,
  height: DEFAULT_CL_SHEET_EMBEDDED_SCORE.height,
  scale: DEFAULT_CL_SHEET_EMBEDDED_SCORE.scale,
  onlyChordName: DEFAULT_CL_SHEET_EMBEDDED_SCORE.onlyChordName
})
const embeddedScore = shallowRef<MusicScore | null>(null)
/** 曲谱副本体积大，改动检测只看换没换过，不序列化整份数据 */
const embeddedRevision = ref(0)
const embedOptions = ref<ScoreListItem[]>([])
const embedPicker = ref<number | null>(null)
const embedding = ref(false)
const mode = ref<ClSheetMode>('edit')
const scoreId = ref<number | null>(null)
const saving = ref(false)
const fileBusy = ref(false)
const savedSnapshot = ref('')
const bracketText = ref('')

const sheetRef = ref<InstanceType<typeof ClSheet> | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
let bodyObserver: ResizeObserver | null = null

const fontOptions = computed(() => [
  { label: t('clSheet.font.default'), value: '' },
  { label: t('clSheet.font.song'), value: 'SimSun, "Songti SC", serif' },
  { label: t('clSheet.font.kai'), value: 'KaiTi, "Kaiti SC", serif' },
  { label: t('clSheet.font.hei'), value: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' }
])

const modeOptions = computed(() => [
  { label: t('clSheet.mode.show'), value: 'show' },
  { label: t('clSheet.mode.edit'), value: 'edit' }
])

const isEdit = computed(() => mode.value === 'edit')

/** 高度随窗口变化，不算改动 */
const snapshot = computed(() => {
  const { height: _height, data: _data, ...rest } = sheet.value
  return JSON.stringify({
    ...rest,
    style,
    description: description.value,
    embedded,
    embeddedRevision: embeddedRevision.value
  })
})

const dirty = computed(() => snapshot.value !== savedSnapshot.value)

const paperStyle = computed(() => ({
  width: `${sheet.value.width}px`,
  fontFamily: sheet.value.fontFamily || undefined
}))

function resolveScoreId(): number | null {
  const raw = Array.isArray(route.query.scoreId) ? route.query.scoreId[0] : route.query.scoreId
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

function syncBracketText() {
  bracketText.value = stringifyChordLyrics(sheet.value.lyrics)
}

function markSaved() {
  savedSnapshot.value = snapshot.value
}

/** saved=false：导入的内容还没存进库，保持「未保存」 */
function applySheet(next: ClSheetData, { saved = true } = {}) {
  sheet.value = next
  Object.assign(style, readClSheetStyle(next))
  description.value = readClSheetDescription(next)
  const { score, ...layout } = readClSheetEmbeddedScore(next)
  embeddedScore.value = score
  Object.assign(embedded, layout)
  syncBracketText()
  measureHeight()
  if (saved) markSaved()
}

function measureHeight() {
  const el = bodyRef.value
  if (!el) return
  sheet.value.height = Math.max(MIN_SHEET_HEIGHT, Math.floor(el.clientHeight))
}

function onSheetChange() {
  syncBracketText()
}

/** 带和弦的字；行尾只为放和弦打的空格不算 */
const chordLyrics = computed(() =>
  sheet.value.lyrics.flat().filter((lyric) => lyric.chord && !/^\s+$/.test(lyric.text))
)

const chordLyricsUnderlined = computed(
  () => chordLyrics.value.length > 0 && chordLyrics.value.every((lyric) => lyric.underline)
)

/** 颜色都相同时显示该色，不一致或都没设时为空 */
const chordLyricsColor = computed(() => {
  const colors = new Set(chordLyrics.value.map((lyric) => lyric.color ?? ''))
  return colors.size === 1 ? [...colors][0] || null : null
})

function setChordLyricsUnderline(underline: boolean) {
  sheetRef.value?.endEditLine()
  for (const lyric of chordLyrics.value) {
    if (underline) lyric.underline = true
    else delete lyric.underline
  }
  syncBracketText()
}

/** null：去掉颜色，跟随默认歌词颜色 */
function setChordLyricsColor(color: string | null) {
  sheetRef.value?.endEditLine()
  for (const lyric of chordLyrics.value) {
    if (color) lyric.color = color
    else delete lyric.color
  }
  syncBracketText()
}

function resetStyle() {
  Object.assign(style, DEFAULT_CL_SHEET_STYLE)
  sheet.value.width = DEFAULT_CL_SHEET_WIDTH
  sheet.value.fontFamily = ''
}

function resetEmbeddedSize() {
  embedded.height = DEFAULT_CL_SHEET_EMBEDDED_SCORE.height
  embedded.scale = DEFAULT_CL_SHEET_EMBEDDED_SCORE.scale
}

function formatScale(value: number): string {
  return `${Math.round(value * 100)}%`
}

async function loadEmbedOptions() {
  embedOptions.value = await searchScoresFromDatabase('', 'music_score')
}

async function embedScore(id: number | null) {
  embedPicker.value = null
  if (id == null || embedding.value) return
  embedding.value = true
  try {
    const copied = await copyScoreForClSheet(id)
    if (!copied) {
      ElMessage.error(t('clSheet.embedded.loadFailed'))
      return
    }
    embeddedScore.value = copied.score
    embedded.name = copied.name
    embeddedRevision.value++
  } catch {
    ElMessage.error(t('clSheet.embedded.loadFailed'))
  } finally {
    embedding.value = false
  }
}

function removeEmbeddedScore() {
  embeddedScore.value = null
  embedded.name = ''
  embeddedRevision.value++
}

async function importBracketText() {
  if (sheet.value.lyrics.length > 0) {
    try {
      await ElMessageBox.confirm(t('clSheet.text.importConfirm'), t('common.confirm'), {
        type: 'warning'
      })
    } catch {
      return
    }
  }
  sheetRef.value?.clearSelection()
  sheet.value.lyrics = parseChordLyrics(bracketText.value)
  syncBracketText()
}

async function copyBracketText() {
  try {
    await navigator.clipboard.writeText(bracketText.value)
    ElMessage.success(t('clSheet.text.copied'))
  } catch {
    ElMessage.error(t('clSheet.text.copyFailed'))
  }
}

/** 把样式、描述、顶部曲谱等写回 sheet.data，保存和导出前调用 */
function syncSheetData() {
  sheetRef.value?.endEditLine()
  writeClSheetStyle(sheet.value, { ...style })
  writeClSheetDescription(sheet.value, description.value.trim())
  writeClSheetEmbeddedScore(sheet.value, { ...embedded, score: embeddedScore.value })
}

async function importSheet() {
  if (fileBusy.value) return
  sheetRef.value?.endEditLine()
  const hasContent = sheet.value.lyrics.length > 0 || !!sheet.value.title.trim()
  if (hasContent) {
    try {
      await ElMessageBox.confirm(t('clSheet.file.importConfirm'), t('common.confirm'), {
        type: 'warning'
      })
    } catch {
      return
    }
  }
  fileBusy.value = true
  try {
    const result = await importClSheetFromDisk()
    if (!result) return
    sheetRef.value?.clearSelection()
    applySheet(result.sheet, { saved: false })
    ElMessage.success(t('clSheet.file.importSuccess', { fileName: result.fileName }))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('clSheet.file.importFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function exportSheet() {
  if (fileBusy.value) return
  fileBusy.value = true
  syncSheetData()
  try {
    if (await exportClSheetToDisk(sheet.value)) {
      ElMessage.success(t('clSheet.file.exportSuccess'))
    }
  } catch {
    ElMessage.error(t('clSheet.file.exportFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function save() {
  if (saving.value) return
  saving.value = true
  syncSheetData()
  try {
    await globalLoading.run(t('common.saving'), async () => {
      const saved = await saveClSheetToDatabase(sheet.value, scoreId.value)
      markSaved()
      if (!scoreId.value) {
        scoreId.value = saved.id
        await router.replace({ name: 'clSheet', query: { scoreId: String(saved.id) } })
      }
      ElMessage.success(t('clSheet.messages.saveSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('clSheet.messages.saveFailed'))
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && shortcutKey(event).toLowerCase() === 's') {
    event.preventDefault()
    void save()
  }
}

async function confirmDiscard(): Promise<boolean> {
  sheetRef.value?.endEditLine()
  if (!dirty.value) return true
  try {
    // 由后退（hash 变化）触发的离开守卫里弹框，默认会被 hashchange 立即关掉
    await ElMessageBox.confirm(t('clSheet.messages.discardConfirm'), t('common.confirm'), {
      type: 'warning',
      closeOnHashChange: false
    })
    return true
  } catch {
    return false
  }
}

watch(
  () => [style.color, style.chordColor],
  () => {
    if (!style.color) style.color = DEFAULT_CL_SHEET_STYLE.color
    if (!style.chordColor) style.chordColor = DEFAULT_CL_SHEET_STYLE.chordColor
  }
)

// 取色器清空给的是 null，统一成 ''（不写颜色）
watch(
  () => [style.addLyricColor, style.addChordColor],
  () => {
    style.addLyricColor ||= ''
    style.addChordColor ||= ''
  }
)

watch(mode, () => {
  sheetRef.value?.endEditLine()
  sheetRef.value?.clearSelection()
  void nextTick(measureHeight)
})

onBeforeRouteLeave(() => confirmDiscard())

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  bodyObserver = new ResizeObserver(() => measureHeight())
  if (bodyRef.value) bodyObserver.observe(bodyRef.value)
  void loadEmbedOptions()

  const id = resolveScoreId()
  if (!id) {
    applySheet(createEmptyClSheet())
    return
  }

  mode.value = 'show'
  globalLoading.show(t('common.loading'))
  try {
    const loaded = await loadClSheetFromDatabase(id)
    if (!loaded) {
      ElMessage.error(t('clSheet.messages.loadFailed'))
      return
    }
    scoreId.value = id
    applySheet(loaded)
  } catch {
    ElMessage.error(t('clSheet.messages.loadFailed'))
  } finally {
    globalLoading.hide()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  bodyObserver?.disconnect()
  bodyObserver = null
})
</script>

<template>
  <div class="cl-sheet-view">
    <header class="cl-sheet-view__header">
      <BackButton fallback="/scores" />
      <h1 class="cl-sheet-view__heading">{{ t('router.clSheet') }}</h1>
      <span v-if="dirty" class="cl-sheet-view__unsaved">{{ t('clSheet.unsaved') }}</span>
      <div class="cl-sheet-view__header-actions">
        <el-button round :disabled="fileBusy" @click="importSheet">
          {{ t('clSheet.file.import') }}
        </el-button>
        <el-button round :disabled="fileBusy" @click="exportSheet">
          {{ t('clSheet.file.export') }}
        </el-button>
        <el-segmented v-model="mode" :options="modeOptions" />
        <el-button type="primary" round :loading="saving" @click="save">
          {{ t('common.save') }}
        </el-button>
      </div>
    </header>

    <main class="cl-sheet-view__main">
      <section class="cl-sheet-view__stage">
        <div class="cl-sheet-view__paper" :style="paperStyle">
          <ClSheetEmbeddedScore
            v-if="embeddedScore"
            v-model:height="embedded.height"
            :score="embeddedScore"
            :scale="embedded.scale"
            :only-chord-name="embedded.onlyChordName"
            :resizable="isEdit"
          />
          <div class="cl-sheet-view__paper-head">
            <template v-if="isEdit">
              <input
                v-model="sheet.title"
                class="cl-sheet-view__title-input"
                :placeholder="t('clSheet.titlePlaceholder')"
              />
              <div class="cl-sheet-view__meta">
                <input
                  v-model="description"
                  class="cl-sheet-view__description-input"
                  :placeholder="t('clSheet.descriptionPlaceholder')"
                />
                <input
                  v-model="sheet.author"
                  class="cl-sheet-view__author-input"
                  :placeholder="t('clSheet.authorPlaceholder')"
                />
              </div>
            </template>
            <template v-else>
              <h2 class="cl-sheet-view__title">{{ sheet.title || t('clSheet.untitled') }}</h2>
              <div v-if="description || sheet.author" class="cl-sheet-view__meta">
                <p class="cl-sheet-view__description">{{ description }}</p>
                <p class="cl-sheet-view__author">{{ sheet.author }}</p>
              </div>
            </template>
            <p v-if="sheet.lyrics.length === 0" class="cl-sheet-view__empty">
              {{ isEdit ? t('clSheet.emptyEdit') : t('clSheet.emptyShow') }}
            </p>
          </div>
          <div ref="bodyRef" class="cl-sheet-view__paper-body">
            <ClSheet
              ref="sheetRef"
              :data="sheet"
              :mode="mode"
              :font-size="style.fontSize"
              :line-gap="style.lineGap"
              :color="style.color"
              :chord-color="style.chordColor"
              :add-lyric-color="style.addLyricColor"
              :add-chord-color="style.addChordColor"
              @change="onSheetChange"
            />
          </div>
        </div>
      </section>

      <aside v-if="isEdit" class="cl-sheet-view__aside">
        <section class="cl-sheet-view__panel">
          <div class="cl-sheet-view__panel-head">
            <h3>{{ t('clSheet.embedded.title') }}</h3>
            <el-button v-if="embeddedScore" link type="primary" @click="resetEmbeddedSize">
              {{ t('clSheet.style.reset') }}
            </el-button>
          </div>
          <p class="cl-sheet-view__desc">{{ t('clSheet.embedded.desc') }}</p>
          <div v-if="embeddedScore" class="cl-sheet-view__embedded-current">
            <span class="cl-sheet-view__embedded-name" :title="embedded.name">
              {{ displayScoreName(embedded.name) }}
            </span>
            <el-button link type="danger" size="small" @click="removeEmbeddedScore">
              {{ t('clSheet.embedded.remove') }}
            </el-button>
          </div>
          <el-select
            v-model="embedPicker"
            filterable
            size="small"
            class="cl-sheet-view__embed-select"
            :loading="embedding"
            :disabled="embedding"
            :placeholder="
              embeddedScore ? t('clSheet.embedded.replace') : t('clSheet.embedded.placeholder')
            "
            @visible-change="(visible: boolean) => visible && loadEmbedOptions()"
            @change="embedScore"
          >
            <el-option
              v-for="item in embedOptions"
              :key="item.id"
              :label="displayScoreName(item.name)"
              :value="item.id"
            />
          </el-select>
          <template v-if="embeddedScore">
            <div class="cl-sheet-view__field">
              <span>{{ t('clSheet.embedded.height') }}</span>
              <el-slider
                v-model="embedded.height"
                :min="CL_SHEET_EMBEDDED_HEIGHT_RANGE.min"
                :max="CL_SHEET_EMBEDDED_HEIGHT_RANGE.max"
              />
            </div>
            <div class="cl-sheet-view__field">
              <span>{{ t('clSheet.embedded.scale') }}</span>
              <el-slider
                v-model="embedded.scale"
                :min="CL_SHEET_EMBEDDED_SCALE_RANGE.min"
                :max="CL_SHEET_EMBEDDED_SCALE_RANGE.max"
                :step="0.05"
                :format-tooltip="formatScale"
              />
            </div>
            <div class="cl-sheet-view__switch">
              <span>{{ t('clSheet.embedded.onlyChordName') }}</span>
              <el-switch v-model="embedded.onlyChordName" size="small" />
            </div>
          </template>
        </section>

        <section class="cl-sheet-view__panel">
          <div class="cl-sheet-view__panel-head">
            <h3>{{ t('clSheet.style.title') }}</h3>
            <el-button link type="primary" @click="resetStyle">
              {{ t('clSheet.style.reset') }}
            </el-button>
          </div>
          <div class="cl-sheet-view__field">
            <span>{{ t('clSheet.style.width') }}</span>
            <el-slider v-model="sheet.width" :min="360" :max="1200" :step="10" />
          </div>
          <div class="cl-sheet-view__field">
            <span>{{ t('clSheet.style.fontSize') }}</span>
            <el-slider v-model="style.fontSize" :min="12" :max="40" />
          </div>
          <div class="cl-sheet-view__field">
            <span>{{ t('clSheet.style.lineGap') }}</span>
            <el-slider v-model="style.lineGap" :min="0" :max="48" />
          </div>
          <div class="cl-sheet-view__field">
            <span>{{ t('clSheet.style.font') }}</span>
            <el-select v-model="sheet.fontFamily" size="small">
              <el-option
                v-for="font in fontOptions"
                :key="font.label"
                :label="font.label"
                :value="font.value"
              />
            </el-select>
          </div>
          <div class="cl-sheet-view__colors">
            <div class="cl-sheet-view__color">
              <span>{{ t('clSheet.style.color') }}</span>
              <el-color-picker v-model="style.color" size="small" />
            </div>
            <div class="cl-sheet-view__color">
              <span>{{ t('clSheet.style.chordColor') }}</span>
              <el-color-picker v-model="style.chordColor" size="small" />
            </div>
          </div>
          <div class="cl-sheet-view__colors">
            <div class="cl-sheet-view__color">
              <span>{{ t('clSheet.style.addLyricColor') }}</span>
              <el-color-picker v-model="style.addLyricColor" size="small" />
            </div>
            <div class="cl-sheet-view__color">
              <span>{{ t('clSheet.style.addChordColor') }}</span>
              <el-color-picker v-model="style.addChordColor" size="small" />
            </div>
          </div>
          <p class="cl-sheet-view__desc cl-sheet-view__desc--after">
            {{ t('clSheet.style.addColorHint') }}
          </p>
        </section>

        <section class="cl-sheet-view__panel">
          <div class="cl-sheet-view__panel-head">
            <h3>{{ t('clSheet.chordLyrics.title') }}</h3>
          </div>
          <p class="cl-sheet-view__desc">
            {{
              chordLyrics.length > 0
                ? t('clSheet.chordLyrics.desc', { count: chordLyrics.length })
                : t('clSheet.chordLyrics.empty')
            }}
          </p>
          <div class="cl-sheet-view__switch">
            <span>{{ t('clSheet.chordLyrics.underline') }}</span>
            <el-switch
              :model-value="chordLyricsUnderlined"
              size="small"
              :disabled="chordLyrics.length === 0"
              @change="(value: string | number | boolean) => setChordLyricsUnderline(Boolean(value))"
            />
          </div>
          <div class="cl-sheet-view__switch">
            <span>{{ t('clSheet.chordLyrics.color') }}</span>
            <el-color-picker
              :model-value="chordLyricsColor"
              size="small"
              :disabled="chordLyrics.length === 0"
              @change="setChordLyricsColor"
            />
          </div>
        </section>

        <section class="cl-sheet-view__panel">
          <div class="cl-sheet-view__panel-head">
            <h3>{{ t('clSheet.text.title') }}</h3>
          </div>
          <p class="cl-sheet-view__desc">{{ t('clSheet.text.desc') }}</p>
          <el-input
            v-model="bracketText"
            type="textarea"
            :rows="10"
            spellcheck="false"
            class="cl-sheet-view__textarea"
            :placeholder="t('clSheet.text.placeholder')"
          />
          <div class="cl-sheet-view__panel-actions">
            <el-button size="small" round @click="copyBracketText">
              {{ t('clSheet.text.copy') }}
            </el-button>
            <el-button size="small" type="primary" round @click="importBracketText">
              {{ t('clSheet.text.import') }}
            </el-button>
          </div>
        </section>

        <section class="cl-sheet-view__panel">
          <div class="cl-sheet-view__panel-head">
            <h3>{{ t('clSheet.tips.title') }}</h3>
          </div>
          <ul class="cl-sheet-view__tips">
            <li>{{ t('clSheet.tips.select') }}</li>
            <li>{{ t('clSheet.tips.editLine') }}</li>
            <li>{{ t('clSheet.tips.dragChord') }}</li>
            <li>{{ t('clSheet.tips.save') }}</li>
          </ul>
        </section>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.cl-sheet-view {
  --text: #5c4a6a;
  --text-soft: #9a8aa8;
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  color: var(--text);
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.cl-sheet-view__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 14px;
  padding: 16px 24px;
}

.cl-sheet-view__heading {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cl-sheet-view__unsaved {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #c27c0e;
  background: rgba(250, 236, 216, 0.9);
}

.cl-sheet-view__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.cl-sheet-view__main {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 0;
  padding: 0 24px 24px;
}

.cl-sheet-view__stage {
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 0;
  overflow-x: auto;
}

.cl-sheet-view__paper {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  box-sizing: border-box;
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.cl-sheet-view__paper-head {
  flex-shrink: 0;
  padding: 20px 16px 4px;
  text-align: center;
}

.cl-sheet-view__title,
.cl-sheet-view__title-input {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #303133;
}

/* 简谱习惯：描述（1=C 4/4）在左，作者在右 */
.cl-sheet-view__meta {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.cl-sheet-view__description,
.cl-sheet-view__description-input,
.cl-sheet-view__author,
.cl-sheet-view__author-input {
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.cl-sheet-view__description,
.cl-sheet-view__description-input {
  text-align: left;
  color: #606266;
}

.cl-sheet-view__author,
.cl-sheet-view__author-input {
  text-align: right;
}

.cl-sheet-view__description,
.cl-sheet-view__author {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.cl-sheet-view__title-input,
.cl-sheet-view__description-input,
.cl-sheet-view__author-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 2px 8px;
  border: 1px dashed transparent;
  border-radius: 8px;
  font-family: inherit;
  background: transparent;
  outline: none;
}

.cl-sheet-view__title-input {
  text-align: center;
}

.cl-sheet-view__title-input:hover,
.cl-sheet-view__description-input:hover,
.cl-sheet-view__author-input:hover,
.cl-sheet-view__title-input:focus,
.cl-sheet-view__description-input:focus,
.cl-sheet-view__author-input:focus {
  border-color: #dcdfe6;
}

.cl-sheet-view__empty {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--text-soft);
}

.cl-sheet-view__paper-body {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.cl-sheet-view__aside {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 12px;
  width: 300px;
  overflow-y: auto;
}

.cl-sheet-view__panel {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--shadow);
}

.cl-sheet-view__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cl-sheet-view__panel-head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #8a5a72;
}

.cl-sheet-view__field {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.cl-sheet-view__field + .cl-sheet-view__field {
  margin-top: 4px;
}

.cl-sheet-view__colors {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.cl-sheet-view__color {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.cl-sheet-view__desc {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-soft);
}

.cl-sheet-view__desc--after {
  margin: 8px 0 0;
}

.cl-sheet-view__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
}

.cl-sheet-view__embedded-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 13px;
  background: #faf3f8;
}

.cl-sheet-view__embedded-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cl-sheet-view__embed-select {
  width: 100%;
  margin-bottom: 6px;
}

.cl-sheet-view__textarea :deep(textarea) {
  font:
    13px/1.5 Consolas,
    monospace;
}

.cl-sheet-view__panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.cl-sheet-view__tips {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-soft);
}
</style>
