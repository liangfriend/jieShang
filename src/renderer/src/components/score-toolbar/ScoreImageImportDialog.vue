<script setup lang="ts">
import { ArrowDown, ArrowUp, Close, Loading, Plus, Sort, UploadFilled, Warning } from '@element-plus/icons-vue'
import type { MusicScore } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { computed, markRaw, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveKeySignatureLabel, resolveTimeSignatureLabel } from '@renderer/i18n/helpers'
import type { OmrErrorCode, OmrPageResult } from '@renderer/types/omr'
import {
  mergeOmrPages,
  pageWarnings,
  recognizeScoreImage,
  resolvePageSignatures,
  SCORE_IMAGE_ACCEPT
} from '@renderer/utils/scoreImageOmr'

defineOptions({ name: 'ScoreImageImportDialog' })

type ItemStatus = 'pending' | 'running' | 'done' | 'error'

type ImageItem = {
  id: number
  file: File
  name: string
  url: string
  status: ItemStatus
  result?: OmrPageResult
  errorCode?: OmrErrorCode
  errorMessage?: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'generated', payload: { musicScore: MusicScore; pageCount: number; warningCount: number }): void
}>()

const { t, tm } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const noticeItems = computed(() => tm('editor.scoreImageDialog.noticeItems') as string[])

const items = ref<ImageItem[]>([])
const phase = ref<'idle' | 'recognizing' | 'merging'>('idle')
const runTotal = ref(0)
const runProcessed = ref(0)
const currentName = ref('')
const stopRequested = ref(false)
const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
let nextId = 1

const busy = computed(() => phase.value !== 'idle')
const doneItems = computed(() => items.value.filter((i) => i.status === 'done'))
const failedItems = computed(() => items.value.filter((i) => i.status === 'error'))
const previewUrls = computed(() => items.value.map((i) => i.url))
const pageSignatures = computed(() => resolvePageSignatures(doneItems.value.map((i) => i.result!)))

const progressPercent = computed(() => {
  if (phase.value === 'merging') return 100
  if (!runTotal.value) return 0
  return Math.round((runProcessed.value / runTotal.value) * 100)
})

const progressText = computed(() => {
  if (phase.value === 'merging') return t('editor.scoreImageDialog.progressMerging')
  return t('editor.scoreImageDialog.progressRecognizing', {
    current: Math.min(runProcessed.value + 1, runTotal.value),
    total: runTotal.value,
    name: currentName.value
  })
})

const ACCEPTED_EXT = new Set(SCORE_IMAGE_ACCEPT.split(','))

function isAcceptedFile(file: File): boolean {
  const dot = file.name.lastIndexOf('.')
  return dot >= 0 && ACCEPTED_EXT.has(file.name.slice(dot).toLowerCase())
}

function addFiles(files: File[]) {
  if (busy.value) return
  const accepted = files.filter(isAcceptedFile)
  if (accepted.length < files.length) {
    ElMessage.warning(
      t('editor.scoreImageDialog.unsupportedSkipped', { n: files.length - accepted.length })
    )
  }
  for (const file of accepted) {
    items.value.push({
      id: nextId++,
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      status: 'pending'
    })
  }
}

function openPicker() {
  if (busy.value) return
  fileInputRef.value?.click()
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  addFiles(files)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  addFiles(Array.from(event.dataTransfer?.files ?? []))
}

function move(index: number, delta: -1 | 1) {
  const target = index + delta
  if (busy.value || target < 0 || target >= items.value.length) return
  const list = items.value
  ;[list[index], list[target]] = [list[target], list[index]]
}

function remove(index: number) {
  if (busy.value) return
  const [item] = items.value.splice(index, 1)
  if (item) URL.revokeObjectURL(item.url)
}

function sortByName() {
  if (busy.value) return
  items.value.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

function resetItems() {
  for (const item of items.value) URL.revokeObjectURL(item.url)
  items.value = []
}

function clearAll() {
  if (!busy.value) resetItems()
}

function errorText(item: ImageItem): string {
  if (item.errorCode === 'BAD_IMAGE') return t('editor.scoreImageDialog.errorBadImage')
  if (item.errorCode === 'NO_NOTATION') return t('editor.scoreImageDialog.errorNoNotation')
  return item.errorMessage || t('editor.scoreImageDialog.errorInternal')
}

function itemWarnings(item: ImageItem): string[] {
  if (!item.result) return []
  return pageWarnings(item.result, doneItems.value.indexOf(item))
}

function itemSummary(item: ImageItem): string {
  const info = item.result?.info
  const index = doneItems.value.indexOf(item)
  const sig = pageSignatures.value[index]
  if (!info || !sig) return ''
  const keyLabel = resolveKeySignatureLabel(sig.key)
  const key = sig.keyFromImage
    ? keyLabel
    : t(index > 0 ? 'editor.scoreImageDialog.keyInherited' : 'editor.scoreImageDialog.keyAssumed', {
        key: keyLabel
      })
  return t('editor.scoreImageDialog.itemSummary', {
    rows: info.rows,
    measures: info.measures,
    key,
    time: resolveTimeSignatureLabel(sig.time)
  })
}

async function recognizePending() {
  const queue = items.value.filter((i) => i.status !== 'done')
  runTotal.value = queue.length
  runProcessed.value = 0
  for (const item of queue) {
    if (stopRequested.value) return
    item.status = 'running'
    currentName.value = item.name
    const res = await recognizeScoreImage(item.file)
    if (res.ok) {
      item.status = 'done'
      item.result = markRaw({ musicScore: res.musicScore, warnings: res.warnings, info: res.info })
      item.errorCode = undefined
      item.errorMessage = undefined
    } else {
      item.status = 'error'
      item.errorCode = res.code
      item.errorMessage = res.message
    }
    runProcessed.value += 1
  }
}

async function mergeAndEmit() {
  const done = doneItems.value
  if (!done.length) return
  phase.value = 'merging'
  // 让进度条先渲染到「拼接中」
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const pages = done.map((i) => i.result!)
  const musicScore = mergeOmrPages(pages)
  const warningCount = pages.reduce((sum, page, i) => sum + pageWarnings(page, i).length, 0)
  emit('generated', { musicScore, pageCount: pages.length, warningCount })
  resetItems()
  visible.value = false
}

async function generate(skipFailed = false) {
  if (busy.value || !items.value.length) return
  stopRequested.value = false
  try {
    if (!skipFailed) {
      phase.value = 'recognizing'
      await recognizePending()
      if (stopRequested.value) return
      if (failedItems.value.length) return
    }
    await mergeAndEmit()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.scoreImageDialog.generateFailed'))
  } finally {
    phase.value = 'idle'
    stopRequested.value = false
    for (const item of items.value) if (item.status === 'running') item.status = 'pending'
  }
}

function onCancelOrStop() {
  if (busy.value) {
    stopRequested.value = true
    return
  }
  visible.value = false
}

function beforeClose(done: () => void) {
  if (!busy.value) done()
}

watch(visible, (open) => {
  if (open) dragOver.value = false
})

onBeforeUnmount(() => {
  for (const item of items.value) URL.revokeObjectURL(item.url)
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.scoreImageDialog.title')"
    width="680px"
    class="score-image-dialog cute-dialog"
    append-to-body
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="!busy"
    :show-close="!busy"
    :before-close="beforeClose"
  >
    <section class="score-image-dialog__notice">
      <div class="score-image-dialog__notice-title">
        <el-icon><Warning /></el-icon>
        <span>{{ t('editor.scoreImageDialog.noticeTitle') }}</span>
      </div>
      <ul class="score-image-dialog__notice-list">
        <li v-for="(item, index) in noticeItems" :key="index">{{ item }}</li>
      </ul>
    </section>

    <div
      v-if="!items.length"
      class="score-image-dialog__drop"
      :class="{ 'is-over': dragOver }"
      @click="openPicker"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <el-icon class="score-image-dialog__drop-icon"><UploadFilled /></el-icon>
      <div class="score-image-dialog__drop-text">{{ t('editor.scoreImageDialog.dropHint') }}</div>
      <div class="score-image-dialog__drop-sub">{{ t('editor.scoreImageDialog.formats') }}</div>
    </div>

    <template v-else>
      <div class="score-image-dialog__list-bar">
        <span class="score-image-dialog__count">
          {{ t('editor.scoreImageDialog.count', { n: items.length }) }}
        </span>
        <div class="score-image-dialog__list-actions">
          <button type="button" class="score-image-dialog__chip" :disabled="busy" @click="openPicker">
            <el-icon><Plus /></el-icon>{{ t('editor.scoreImageDialog.add') }}
          </button>
          <button type="button" class="score-image-dialog__chip" :disabled="busy" @click="sortByName">
            <el-icon><Sort /></el-icon>{{ t('editor.scoreImageDialog.sortByName') }}
          </button>
          <button type="button" class="score-image-dialog__chip" :disabled="busy" @click="clearAll">
            {{ t('editor.scoreImageDialog.clear') }}
          </button>
        </div>
      </div>

      <ol
        class="score-image-dialog__list"
        :class="{ 'is-over': dragOver }"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
      >
        <li
          v-for="(item, index) in items"
          :key="item.id"
          class="score-image-dialog__item"
          :class="`is-${item.status}`"
        >
          <span class="score-image-dialog__index">{{ index + 1 }}</span>
          <el-image
            class="score-image-dialog__thumb"
            :src="item.url"
            fit="contain"
            :preview-src-list="previewUrls"
            :initial-index="index"
            preview-teleported
            hide-on-click-modal
          />
          <div class="score-image-dialog__meta">
            <div class="score-image-dialog__name" :title="item.name">{{ item.name }}</div>
            <div class="score-image-dialog__status">
              <template v-if="item.status === 'pending'">
                {{ t('editor.scoreImageDialog.statusPending') }}
              </template>
              <template v-else-if="item.status === 'running'">
                <el-icon class="is-loading"><Loading /></el-icon>
                {{ t('editor.scoreImageDialog.statusRunning') }}
              </template>
              <template v-else-if="item.status === 'done'">
                <span class="score-image-dialog__ok">{{ itemSummary(item) }}</span>
                <el-popover
                  v-if="itemWarnings(item).length"
                  placement="bottom-start"
                  :width="360"
                  trigger="hover"
                >
                  <template #reference>
                    <span class="score-image-dialog__warn-badge">
                      {{ t('editor.scoreImageDialog.warnings', { n: itemWarnings(item).length }) }}
                    </span>
                  </template>
                  <ul class="score-image-dialog__warn-list">
                    <li v-for="(w, wi) in itemWarnings(item)" :key="wi">{{ w }}</li>
                  </ul>
                </el-popover>
              </template>
              <span v-else class="score-image-dialog__err">{{ errorText(item) }}</span>
            </div>
          </div>
          <div class="score-image-dialog__item-actions">
            <button
              type="button"
              class="score-image-dialog__icon-btn"
              :disabled="busy || index === 0"
              :title="t('editor.scoreImageDialog.moveUp')"
              @click="move(index, -1)"
            >
              <el-icon><ArrowUp /></el-icon>
            </button>
            <button
              type="button"
              class="score-image-dialog__icon-btn"
              :disabled="busy || index === items.length - 1"
              :title="t('editor.scoreImageDialog.moveDown')"
              @click="move(index, 1)"
            >
              <el-icon><ArrowDown /></el-icon>
            </button>
            <button
              type="button"
              class="score-image-dialog__icon-btn score-image-dialog__icon-btn--danger"
              :disabled="busy"
              :title="t('editor.scoreImageDialog.remove')"
              @click="remove(index)"
            >
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </li>
      </ol>
    </template>

    <section v-if="busy" class="score-image-dialog__progress">
      <div class="score-image-dialog__progress-text">{{ progressText }}</div>
      <el-progress
        :percentage="progressPercent"
        :stroke-width="10"
        striped
        striped-flow
        :duration="8"
        color="#ff9ec5"
      />
    </section>

    <section v-else-if="failedItems.length" class="score-image-dialog__failed">
      <span>{{ t('editor.scoreImageDialog.failedHint', { n: failedItems.length }) }}</span>
      <button
        v-if="doneItems.length"
        type="button"
        class="score-image-dialog__link"
        @click="generate(true)"
      >
        {{ t('editor.scoreImageDialog.skipFailed', { n: doneItems.length }) }}
      </button>
    </section>

    <input
      ref="fileInputRef"
      class="score-image-dialog__file"
      type="file"
      :accept="SCORE_IMAGE_ACCEPT"
      multiple
      @change="onFilesSelected"
    />

    <template #footer>
      <div class="score-image-dialog__actions">
        <button
          type="button"
          class="score-image-dialog__btn score-image-dialog__btn--ghost"
          :disabled="phase === 'merging' || stopRequested"
          @click="onCancelOrStop"
        >
          {{ busy ? t('editor.scoreImageDialog.stop') : t('common.cancel') }}
        </button>
        <button
          type="button"
          class="score-image-dialog__btn score-image-dialog__btn--primary"
          :disabled="busy || !items.length"
          @click="generate()"
        >
          {{
            failedItems.length
              ? t('editor.scoreImageDialog.retry')
              : t('editor.scoreImageDialog.generate')
          }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.score-image-dialog__notice {
  padding: 12px 14px;
  border: 1px solid rgba(255, 184, 120, 0.55);
  border-radius: 16px;
  background: rgba(255, 246, 232, 0.85);
}

.score-image-dialog__notice-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 800;
  color: #c27a2c;
}

.score-image-dialog__notice-list {
  margin: 0;
  padding-left: 1.2em;
  font-size: 13px;
  line-height: 1.7;
  color: #7a6a88;
}

.score-image-dialog__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  height: 180px;
  border: 2px dashed rgba(201, 184, 255, 0.8);
  border-radius: 18px;
  color: #7a6a88;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.score-image-dialog__drop:hover,
.score-image-dialog__drop.is-over {
  border-color: #ff9ec5;
  background: rgba(255, 240, 247, 0.9);
}

.score-image-dialog__drop-icon {
  font-size: 40px;
  color: #c9b8ff;
}

.score-image-dialog__drop-text {
  font-size: 14px;
  font-weight: 700;
}

.score-image-dialog__drop-sub {
  font-size: 12px;
  color: #9a8aa8;
}

.score-image-dialog__list-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 8px;
}

.score-image-dialog__count {
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
}

.score-image-dialog__list-actions {
  display: flex;
  gap: 8px;
}

.score-image-dialog__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid rgba(201, 184, 255, 0.65);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #6a5a88;
  background: rgba(255, 255, 255, 0.85);
  cursor: pointer;
}

.score-image-dialog__chip:disabled,
.score-image-dialog__icon-btn:disabled,
.score-image-dialog__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.score-image-dialog__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  border: 2px dashed transparent;
  border-radius: 16px;
}

.score-image-dialog__list.is-over {
  border-color: #ff9ec5;
}

.score-image-dialog__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(201, 184, 255, 0.4);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
}

.score-image-dialog__item.is-running {
  border-color: #ff9ec5;
  box-shadow: 0 0 0 3px rgba(255, 158, 197, 0.18);
}

.score-image-dialog__item.is-error {
  border-color: rgba(245, 108, 108, 0.6);
}

.score-image-dialog__index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  line-height: 24px;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
}

.score-image-dialog__thumb {
  flex-shrink: 0;
  width: 72px;
  height: 54px;
  border: 1px solid rgba(201, 184, 255, 0.35);
  border-radius: 8px;
  background: #fff;
  cursor: zoom-in;
}

.score-image-dialog__meta {
  flex: 1;
  min-width: 0;
}

.score-image-dialog__name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-image-dialog__status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: 12px;
  color: #9a8aa8;
}

.score-image-dialog__ok {
  color: #4f9a6a;
}

.score-image-dialog__err {
  color: #e05a5a;
}

.score-image-dialog__warn-badge {
  padding: 0 8px;
  border-radius: 999px;
  font-weight: 700;
  color: #c27a2c;
  background: rgba(255, 220, 170, 0.6);
  cursor: help;
}

.score-image-dialog__warn-list {
  margin: 0;
  padding-left: 1.2em;
  max-height: 240px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.6;
  color: #5c4a6a;
}

.score-image-dialog__item-actions {
  display: flex;
  gap: 4px;
}

.score-image-dialog__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  color: #6a5a88;
  background: rgba(201, 184, 255, 0.2);
  cursor: pointer;
}

.score-image-dialog__icon-btn--danger {
  color: #e05a5a;
  background: rgba(245, 108, 108, 0.12);
}

.score-image-dialog__progress {
  margin-top: 14px;
}

.score-image-dialog__progress-text {
  overflow: hidden;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-image-dialog__failed {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #e05a5a;
  background: rgba(245, 108, 108, 0.08);
}

.score-image-dialog__link {
  padding: 0;
  border: none;
  font-size: 13px;
  font-weight: 700;
  color: #8a6ad8;
  background: none;
  text-decoration: underline;
  cursor: pointer;
}

.score-image-dialog__file {
  display: none;
}

.score-image-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.score-image-dialog__btn {
  min-width: 96px;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.score-image-dialog__btn--ghost {
  border: 1px solid rgba(201, 184, 255, 0.65);
  color: #6a5a88;
  background: rgba(255, 255, 255, 0.85);
}

.score-image-dialog__btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
}
</style>
