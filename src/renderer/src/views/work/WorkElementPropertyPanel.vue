<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CropArea, SCropRect, SImageElement, SScore, STextElement } from '@deciphony/work'

defineOptions({ name: 'WorkElementPropertyPanel' })

export type WorkPropertyTarget =
  | { kind: 'score'; item: SScore }
  | { kind: 'image'; item: SImageElement }
  | { kind: 'text'; item: STextElement }

export type WorkFramePatch = Partial<Pick<SScore, 'x' | 'y' | 'width' | 'height' | 'rotation'>>

export type WorkTextStylePatch = Partial<Pick<STextElement, 'fontSize' | 'color'>>

export type WorkCropPayload = {
  kind: 'score' | 'image'
  id: string
  area: CropArea
  keepFrame: boolean
}

/** 按标题 / 复谱表区间裁剪：0=标题，1..n=第几个复谱表 */
export type WorkGrandStaffCropPayload = {
  id: string
  from: number
  to: number
  keepFrame: boolean
  /** true：钉死框 x/y，只缩宽高；false：裁出区域留在页面原位 */
  keepY: boolean
}

const MIN_FRAME_SIZE = 1
/** 裁剪坐标停止输入多久后生效 */
const CROP_DEBOUNCE = 400

const props = defineProps<{
  target: WorkPropertyTarget
  /** 图片资源显示名 */
  assetName?: string
  /** 该项正处于拖拽裁剪模式 */
  cropping?: boolean
}>()

const emit = defineEmits<{
  patch: [patch: WorkFramePatch]
  'text-style': [patch: WorkTextStylePatch]
  crop: [payload: WorkCropPayload]
  'crop-by-grand-staff': [payload: WorkGrandStaffCropPayload]
  'clear-crop': [payload: { keepFrame: boolean }]
  'toggle-crop-mode': []
}>()

const { t } = useI18n()

const lockRatio = ref(true)
const keepFrame = ref(false)
const cropStartX = ref(0)
const cropStartY = ref(0)
const cropEndX = ref(0)
const cropEndY = ref(0)
const bandFrom = ref(0)
const bandTo = ref(0)
/** 按复谱表裁剪：锁定框左上角，起点下移时 y 不变 */
const keepY = ref(false)

const item = computed(() => props.target.item)

/** 裁剪源尺寸：图片 = 原始像素（未读取时为 null），曲谱 = musicScore.width/height */
const sourceSize = computed<{ width: number; height: number } | null>(() => {
  const target = props.target
  if (target.kind === 'text') return null
  if (target.kind === 'score') {
    const { width, height } = target.item.musicScore
    return { width: width || 1, height: height || 1 }
  }
  const { naturalWidth, naturalHeight } = target.item
  return naturalWidth && naturalHeight ? { width: naturalWidth, height: naturalHeight } : null
})

const crop = computed<SCropRect | undefined>(() =>
  props.target.kind === 'text' ? undefined : props.target.item.crop
)

const TEXT_FONT_SIZE_MIN = 8
const TEXT_FONT_SIZE_MAX = 200

function onTextFontSize(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  emit('text-style', { fontSize: Math.min(TEXT_FONT_SIZE_MAX, Math.max(TEXT_FONT_SIZE_MIN, value)) })
}

function onTextColor(value: string | null) {
  if (value) emit('text-style', { color: value })
}

/** 0=标题，1..n=复谱表；选项随当前曲谱变化 */
const grandStaffBandOptions = computed(() => {
  if (props.target.kind !== 'score') return []
  const n = props.target.item.musicScore.grandStaffs?.length ?? 0
  const opts = [{ value: 0, label: t('work.props.bandTitle') }]
  for (let i = 1; i <= n; i++) {
    opts.push({ value: i, label: t('work.props.bandGrandStaff', { n: i }) })
  }
  return opts
})

const maxBandIndex = computed(() => Math.max(0, grandStaffBandOptions.value.length - 1))

watch(
  () => (props.target.kind === 'score' ? `${props.target.item.id}:${maxBandIndex.value}` : ''),
  () => {
    if (props.target.kind !== 'score') return
    bandFrom.value = 0
    bandTo.value = maxBandIndex.value
  },
  { immediate: true }
)

function onApplyGrandStaffCrop() {
  if (props.target.kind !== 'score') return
  emit('crop-by-grand-staff', {
    id: item.value.id,
    from: bandFrom.value,
    to: bandTo.value,
    keepFrame: keepFrame.value,
    keepY: keepY.value
  })
}

function round(value: number | undefined): number {
  return Math.round((value ?? 0) * 100) / 100
}

function syncCropDraft() {
  const rect = crop.value
  const source = sourceSize.value
  cropStartX.value = round(rect?.x ?? 0)
  cropStartY.value = round(rect?.y ?? 0)
  cropEndX.value = round(rect ? rect.x + rect.width : (source?.width ?? 0))
  cropEndY.value = round(rect ? rect.y + rect.height : (source?.height ?? 0))
}

watch(
  () => [item.value, crop.value?.x, crop.value?.y, crop.value?.width, crop.value?.height, sourceSize.value?.width, sourceSize.value?.height],
  syncCropDraft,
  { immediate: true }
)

function onNumber(key: 'x' | 'y' | 'rotation', value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  emit('patch', { [key]: value })
}

function onSize(key: 'width' | 'height', value: number | undefined) {
  if (value == null || !Number.isFinite(value) || value < MIN_FRAME_SIZE) return
  const { width, height } = item.value
  if (!lockRatio.value || !width || !height) {
    emit('patch', { [key]: value })
    return
  }
  const ratio = width / height
  emit(
    'patch',
    key === 'width' ? { width: value, height: value / ratio } : { width: value * ratio, height: value }
  )
}

type CropField = 'startX' | 'startY' | 'endX' | 'endY'

const cropDrafts = { startX: cropStartX, startY: cropStartY, endX: cropEndX, endY: cropEndY }

let pendingCrop: WorkCropPayload | null = null
let cropTimer: ReturnType<typeof setTimeout> | null = null

function flushCrop() {
  if (cropTimer) clearTimeout(cropTimer)
  cropTimer = null
  const payload = pendingCrop
  pendingCrop = null
  if (payload) emit('crop', payload)
}

/** 当前可见区域与输入一致时不再裁剪（避免无改动也写入 crop） */
function isCurrentArea(area: CropArea): boolean {
  const source = sourceSize.value
  const rect = crop.value ?? (source && { x: 0, y: 0, ...source })
  if (!rect) return false
  return (
    round(rect.x) === round(area.startX) &&
    round(rect.y) === round(area.startY) &&
    round(rect.x + rect.width) === round(area.endX) &&
    round(rect.y + rect.height) === round(area.endY)
  )
}

function onCropField(key: CropField, value: number | undefined | null) {
  if (value == null || !Number.isFinite(value)) return
  cropDrafts[key].value = value
  const area: CropArea = {
    startX: cropStartX.value,
    startY: cropStartY.value,
    endX: cropEndX.value,
    endY: cropEndY.value
  }
  if (cropTimer) clearTimeout(cropTimer)
  cropTimer = null
  if (isCurrentArea(area) || props.target.kind === 'text') {
    pendingCrop = null
    return
  }
  pendingCrop = { kind: props.target.kind, id: item.value.id, area, keepFrame: keepFrame.value }
  cropTimer = setTimeout(flushCrop, CROP_DEBOUNCE)
}

/** 切换选中项 / 面板关闭时，未生效的裁剪立即作用到原目标 */
watch(() => item.value.id, flushCrop)
onBeforeUnmount(flushCrop)
</script>

<template>
  <aside class="prop-panel">
    <h2 class="prop-panel__title">
      {{ t('work.props.title') }}
      <span class="prop-panel__kind">
        {{ t(`work.props.${target.kind}`) }}
      </span>
    </h2>

    <section v-if="target.kind === 'text'" class="panel">
      <h3>{{ t('work.props.textStyle') }}</h3>
      <label class="field">
        <span>{{ t('work.toolbar.fontSize') }}</span>
        <el-input-number
          :model-value="target.item.fontSize ?? 24"
          :min="TEXT_FONT_SIZE_MIN"
          :max="TEXT_FONT_SIZE_MAX"
          size="small"
          controls-position="right"
          @update:model-value="onTextFontSize($event)"
        />
      </label>
      <label class="field field--switch">
        <span>{{ t('work.toolbar.color') }}</span>
        <el-color-picker
          :model-value="target.item.color ?? '#303133'"
          size="small"
          @update:model-value="onTextColor($event)"
        />
      </label>
      <p class="hint">{{ t('work.props.textHint') }}</p>
    </section>

    <section class="panel">
      <h3>{{ t('work.props.frame') }}</h3>
      <div class="grid">
        <label class="field">
          <span>X</span>
          <el-input-number
            :model-value="round(item.x)"
            size="small"
            controls-position="right"
            @update:model-value="onNumber('x', $event)"
          />
        </label>
        <label class="field">
          <span>Y</span>
          <el-input-number
            :model-value="round(item.y)"
            size="small"
            controls-position="right"
            @update:model-value="onNumber('y', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.width') }}</span>
          <el-input-number
            :model-value="round(item.width)"
            :min="MIN_FRAME_SIZE"
            size="small"
            controls-position="right"
            @update:model-value="onSize('width', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.height') }}</span>
          <el-input-number
            :model-value="round(item.height)"
            :min="MIN_FRAME_SIZE"
            size="small"
            controls-position="right"
            @update:model-value="onSize('height', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.rotation') }}</span>
          <el-input-number
            :model-value="round(item.rotation)"
            :min="-360"
            :max="360"
            size="small"
            controls-position="right"
            @update:model-value="onNumber('rotation', $event)"
          />
        </label>
        <label class="field field--check">
          <el-checkbox v-model="lockRatio" size="small">{{ t('work.props.lockRatio') }}</el-checkbox>
        </label>
      </div>
    </section>

    <section v-if="target.kind !== 'text'" class="panel">
      <h3>{{ t('work.props.info') }}</h3>
      <dl class="info">
        <template v-if="target.kind === 'image'">
          <dt>{{ t('work.props.assetName') }}</dt>
          <dd>{{ assetName || target.item.src }}</dd>
        </template>
        <template v-else-if="target.kind === 'score'">
          <dt>{{ t('work.props.vocal') }}</dt>
          <dd>{{ target.item.vocalPerformance?.name || t('work.props.none') }}</dd>
          <dt>{{ t('work.props.accompaniment') }}</dt>
          <dd>{{ target.item.accompaniment?.name || t('work.props.none') }}</dd>
        </template>
        <dt>{{ target.kind === 'score' ? t('work.props.scoreSize') : t('work.props.sourceSize') }}</dt>
        <dd>
          {{ sourceSize ? `${round(sourceSize.width)} × ${round(sourceSize.height)}` : t('work.props.sourceUnknown') }}
        </dd>
      </dl>
    </section>

    <section v-if="target.kind !== 'text'" class="panel">
      <h3>{{ t('work.props.crop') }}</h3>
      <button
        type="button"
        class="primary-btn"
        :class="{ 'primary-btn--cropping': cropping }"
        @click="emit('toggle-crop-mode')"
      >
        {{ cropping ? t('work.props.finishCropMode') : t('work.props.cropMode') }}
      </button>
      <p class="hint">
        {{ cropping ? t('work.props.cropModeActiveHint') : t('work.props.cropModeHint') }}
      </p>
      <template v-if="target.kind === 'score'">
        <p class="hint">{{ t('work.props.bandCropHint') }}</p>
        <div class="grid">
          <label class="field">
            <span>{{ t('work.props.bandFrom') }}</span>
            <el-select v-model="bandFrom" size="small">
              <el-option
                v-for="opt in grandStaffBandOptions"
                :key="`from-${opt.value}`"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </label>
          <label class="field">
            <span>{{ t('work.props.bandTo') }}</span>
            <el-select v-model="bandTo" size="small">
              <el-option
                v-for="opt in grandStaffBandOptions"
                :key="`to-${opt.value}`"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </label>
        </div>
        <label class="field field--switch">
          <span>{{ t('work.props.keepY') }}</span>
          <el-switch v-model="keepY" size="small" />
        </label>
        <p class="hint">{{ t('work.props.keepYHint') }}</p>
        <button type="button" class="ghost-btn" @click="onApplyGrandStaffCrop">
          {{ t('work.props.applyBandCrop') }}
        </button>
      </template>
      <p class="hint">{{ t('work.props.cropHint') }}</p>
      <div class="grid">
        <label class="field">
          <span>{{ t('work.props.startX') }}</span>
          <el-input-number
            :model-value="cropStartX"
            :min="0"
            :max="sourceSize?.width ?? Infinity"
            size="small"
            controls-position="right"
            @update:model-value="onCropField('startX', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.startY') }}</span>
          <el-input-number
            :model-value="cropStartY"
            :min="0"
            :max="sourceSize?.height ?? Infinity"
            size="small"
            controls-position="right"
            @update:model-value="onCropField('startY', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.endX') }}</span>
          <el-input-number
            :model-value="cropEndX"
            :min="0"
            :max="sourceSize?.width ?? Infinity"
            size="small"
            controls-position="right"
            @update:model-value="onCropField('endX', $event)"
          />
        </label>
        <label class="field">
          <span>{{ t('work.props.endY') }}</span>
          <el-input-number
            :model-value="cropEndY"
            :min="0"
            :max="sourceSize?.height ?? Infinity"
            size="small"
            controls-position="right"
            @update:model-value="onCropField('endY', $event)"
          />
        </label>
      </div>
      <el-checkbox v-model="keepFrame" size="small">{{ t('work.props.keepFrame') }}</el-checkbox>
      <button
        type="button"
        class="ghost-btn"
        :disabled="!crop"
        @click="emit('clear-crop', { keepFrame })"
      >
        {{ t('work.props.clearCrop') }}
      </button>
    </section>
  </aside>
</template>

<style scoped>
.prop-panel {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  overflow: auto;
  border: 1px solid rgba(255, 184, 208, 0.45);
  border-radius: 16px;
  background: rgba(255, 248, 251, 0.96);
  box-shadow: 0 8px 24px rgba(138, 90, 114, 0.18);
  box-sizing: border-box;
}

.prop-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #5c4a6a;
}

.prop-panel__kind {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.78);
}

.panel h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #8a5a72;
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #9a8aa8;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.field :deep(.el-input-number),
.field :deep(.el-select) {
  width: 100%;
}

.field--check {
  justify-content: flex-end;
}

.field--switch {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  margin: 0;
  font-size: 12px;
}

.info dt {
  font-weight: 700;
  color: #8a5a72;
}

.info dd {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #5c4a6a;
}

.primary-btn,
.ghost-btn {
  min-height: 32px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

/* 与插件裁剪模式的橙色框一致 */
.primary-btn--cropping {
  background: #e6a23c;
}

.ghost-btn {
  border: 1px solid rgba(201, 184, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #6a5a88;
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
