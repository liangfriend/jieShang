<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@deciphony/work'

defineOptions({ name: 'WorkSettingsDialog' })

export type WorkPageSizePayload = { width: number; height: number }

const props = defineProps<{
  modelValue: boolean
  /** 默认页（新页）尺寸 */
  defaultWidth: number
  defaultHeight: number
  /** 当前页尺寸 */
  currentWidth: number
  currentHeight: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  /** 应用默认页：写入新页尺寸 */
  'apply-default': [payload: WorkPageSizePayload]
  /** 用默认页那一行的尺寸，全页应用 */
  'apply-default-all': [payload: WorkPageSizePayload]
  /** 应用当前页：只改当前页 */
  'apply-current': [payload: WorkPageSizePayload]
  /** 用当前页那一行的尺寸，全页应用 */
  'apply-current-all': [payload: WorkPageSizePayload]
}>()

type StandardSizeGroup = 'paper' | 'screen'

type StandardSize = {
  id: string
  name: string
  group: StandardSizeGroup
  orientation?: 'portrait' | 'landscape'
  width: number
  height: number
}

/** 纸张按 96 DPI 由毫米换算为页面像素（A4 = DEFAULT_PAGE_WIDTH × DEFAULT_PAGE_HEIGHT） */
const PAPER_SIZES: Array<{ name: string; width: number; height: number }> = [
  { name: 'A3', width: 1123, height: 1587 },
  { name: 'A4', width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT },
  { name: 'A5', width: 559, height: 794 },
  { name: 'B4', width: 945, height: 1334 },
  { name: 'B5', width: 665, height: 945 },
  { name: 'Letter', width: 816, height: 1056 }
]

const STANDARD_SIZES: StandardSize[] = [
  ...PAPER_SIZES.flatMap(({ name, width, height }): StandardSize[] => [
    { id: `${name}-portrait`, name, group: 'paper', orientation: 'portrait', width, height },
    { id: `${name}-landscape`, name, group: 'paper', orientation: 'landscape', width: height, height: width }
  ]),
  { id: 'screen-16-9', name: '16:9', group: 'screen', width: 1280, height: 720 },
  { id: 'screen-4-3', name: '4:3', group: 'screen', width: 1024, height: 768 }
]

const STANDARD_SIZE_GROUPS: StandardSizeGroup[] = ['paper', 'screen']

const { t } = useI18n()
const draftDefaultWidth = ref(DEFAULT_PAGE_WIDTH)
const draftDefaultHeight = ref(DEFAULT_PAGE_HEIGHT)
const draftCurrentWidth = ref(DEFAULT_PAGE_WIDTH)
const draftCurrentHeight = ref(DEFAULT_PAGE_HEIGHT)
const standardSizeId = ref('')

const selectedStandardSize = computed(
  () => STANDARD_SIZES.find((s) => s.id === standardSizeId.value) ?? null
)

function standardSizeLabel(size: StandardSize): string {
  const orientation = size.orientation
    ? ` ${t(`work.settingsDialog.${size.orientation}`)}`
    : ''
  return `${size.name}${orientation} (${size.width} × ${size.height})`
}

function findStandardSizeId(width: number, height: number): string {
  return STANDARD_SIZES.find((s) => s.width === width && s.height === height)?.id ?? ''
}

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    draftDefaultWidth.value = Math.round(props.defaultWidth) || DEFAULT_PAGE_WIDTH
    draftDefaultHeight.value = Math.round(props.defaultHeight) || DEFAULT_PAGE_HEIGHT
    draftCurrentWidth.value = Math.round(props.currentWidth) || DEFAULT_PAGE_WIDTH
    draftCurrentHeight.value = Math.round(props.currentHeight) || DEFAULT_PAGE_HEIGHT
    standardSizeId.value = findStandardSizeId(draftCurrentWidth.value, draftCurrentHeight.value)
  }
)

function normalizeSize(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.round(value)
}

async function readPair(
  widthRef: { value: number },
  heightRef: { value: number }
): Promise<WorkPageSizePayload> {
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await nextTick()
  const width = normalizeSize(widthRef.value, DEFAULT_PAGE_WIDTH)
  const height = normalizeSize(heightRef.value, DEFAULT_PAGE_HEIGHT)
  widthRef.value = width
  heightRef.value = height
  return { width, height }
}

async function onApplyDefault() {
  emit('apply-default', await readPair(draftDefaultWidth, draftDefaultHeight))
}

async function onApplyDefaultAll() {
  emit('apply-default-all', await readPair(draftDefaultWidth, draftDefaultHeight))
}

async function onApplyCurrent() {
  emit('apply-current', await readPair(draftCurrentWidth, draftCurrentHeight))
}

async function onApplyCurrentAll() {
  emit('apply-current-all', await readPair(draftCurrentWidth, draftCurrentHeight))
}

function takeStandardSize(): WorkPageSizePayload | null {
  const size = selectedStandardSize.value
  if (!size) return null
  draftCurrentWidth.value = size.width
  draftCurrentHeight.value = size.height
  return { width: size.width, height: size.height }
}

function onApplyStandard() {
  const payload = takeStandardSize()
  if (payload) emit('apply-current', payload)
}

function onApplyStandardAll() {
  const payload = takeStandardSize()
  if (payload) emit('apply-current-all', payload)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('work.settingsDialog.title')"
    width="560px"
    class="cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div class="settings-block">
      <div class="settings-row">
        <span class="settings-row__label">{{ t('work.settingsDialog.defaultPageSize') }}</span>
        <el-input-number
          v-model="draftDefaultWidth"
          class="settings-row__input"
          :min="100"
          :max="10000"
          :step="1"
          controls-position="right"
        />
        <span class="settings-row__times">×</span>
        <el-input-number
          v-model="draftDefaultHeight"
          class="settings-row__input"
          :min="100"
          :max="10000"
          :step="1"
          controls-position="right"
        />
        <button type="button" class="action-btn" @click="onApplyDefault">
          {{ t('work.settingsDialog.applyDefault') }}
        </button>
        <button type="button" class="action-btn" @click="onApplyDefaultAll">
          {{ t('work.settingsDialog.applyAll') }}
        </button>
      </div>
      <p class="settings-hint">{{ t('work.settingsDialog.defaultHint') }}</p>
    </div>

    <div class="settings-block">
      <div class="settings-row">
        <span class="settings-row__label">{{ t('work.settingsDialog.currentPageSize') }}</span>
        <el-input-number
          v-model="draftCurrentWidth"
          class="settings-row__input"
          :min="100"
          :max="10000"
          :step="1"
          controls-position="right"
        />
        <span class="settings-row__times">×</span>
        <el-input-number
          v-model="draftCurrentHeight"
          class="settings-row__input"
          :min="100"
          :max="10000"
          :step="1"
          controls-position="right"
        />
        <button type="button" class="action-btn" @click="onApplyCurrent">
          {{ t('work.settingsDialog.applyCurrent') }}
        </button>
        <button type="button" class="action-btn" @click="onApplyCurrentAll">
          {{ t('work.settingsDialog.applyAll') }}
        </button>
      </div>
      <p class="settings-hint">{{ t('work.settingsDialog.currentHint') }}</p>
    </div>

    <div class="settings-block">
      <div class="settings-row">
        <span class="settings-row__label">{{ t('work.settingsDialog.standardSize') }}</span>
        <el-select
          v-model="standardSizeId"
          class="settings-row__select"
          :placeholder="t('work.settingsDialog.standardPlaceholder')"
        >
          <el-option-group
            v-for="group in STANDARD_SIZE_GROUPS"
            :key="group"
            :label="t(`work.settingsDialog.standardGroup.${group}`)"
          >
            <el-option
              v-for="size in STANDARD_SIZES.filter((s) => s.group === group)"
              :key="size.id"
              :label="standardSizeLabel(size)"
              :value="size.id"
            />
          </el-option-group>
        </el-select>
        <button
          type="button"
          class="action-btn"
          :disabled="!selectedStandardSize"
          @click="onApplyStandard"
        >
          {{ t('work.settingsDialog.applyCurrent') }}
        </button>
        <button
          type="button"
          class="action-btn"
          :disabled="!selectedStandardSize"
          @click="onApplyStandardAll"
        >
          {{ t('work.settingsDialog.applyAll') }}
        </button>
      </div>
      <p class="settings-hint">{{ t('work.settingsDialog.standardHint') }}</p>
    </div>
  </el-dialog>
</template>

<style scoped>
.settings-block + .settings-block {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(201, 184, 255, 0.45);
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.settings-row__label {
  flex-shrink: 0;
  min-width: 72px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.settings-row__input {
  width: 110px;
}

.settings-row__times {
  font-weight: 800;
  color: #9a8aa8;
}

.action-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.65);
  background: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.settings-row__select {
  width: 238px;
}

.action-btn:hover:not(:disabled) {
  border-color: rgba(201, 184, 255, 0.9);
  color: #6a5a88;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #9a8aa8;
}
</style>
