<script lang="ts" setup>
import { normalizeExtraSymbol, type NumberNotationAnchor } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCustomSymbolStore } from '@renderer/store/customSymbol.store'
import type { CustomSymbolData, CustomSymbolKind, CustomSymbolRecord } from '@renderer/types/customSymbol'
import { customSymbolMarkup, parseSymbolSvg } from '@renderer/utils/customSymbolSvg'

const props = defineProps<{
  /** 新建时的种类；编辑时以 record.kind 为准 */
  kind: CustomSymbolKind
  /** 传入则编辑该符号，否则新建 */
  record?: CustomSymbolRecord | null
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: [record: CustomSymbolRecord, created: boolean]
}>()

const { t } = useI18n()
const store = useCustomSymbolStore()

/** 标准小节高（px），偏移量以它为单位 */
const MEASURE_HEIGHT = 45
const DEFAULT_HEIGHT: Record<CustomSymbolKind, number> = { note: 14, slot: 14, measure: 18 }
const SIZE_MAX = 400
const ANCHORS: NumberNotationAnchor[] = ['top', 'bottom', 'left', 'right']
const PLACEMENTS = ['start', 'center', 'end'] as const
const ALIGNS = ['left', 'center', 'right'] as const
const POSITIONS = ['upper', 'lower'] as const

const form = reactive({
  name: '',
  content: '',
  aspect: 1,
  w: 0,
  h: 0,
  keepRatio: true,
  vertical: 0,
  horizontal: 0,
  anchor: '' as NumberNotationAnchor | '',
  placement: 'start' as (typeof PLACEMENTS)[number],
  align: 'left' as (typeof ALIGNS)[number],
  position: 'upper' as (typeof POSITIONS)[number]
})
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const editing = computed(() => props.record ?? null)
const kind = computed<CustomSymbolKind>(() => editing.value?.kind ?? props.kind)
const title = computed(() =>
  editing.value ? t('editor.customSymbol.editTitle') : t('editor.customSymbol.createTitle')
)

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function resetForm() {
  const record = editing.value
  const k = kind.value
  const base = record
    ? { ...record.data, name: record.name, skinKey: record.skinKey }
    : { name: '', content: '', w: 1, h: 1, skinKey: '' }
  const sym = normalizeExtraSymbol(k, base as never) as unknown as Record<string, unknown>
  form.name = record?.name ?? ''
  form.content = record?.data.content ?? ''
  form.w = record?.data.w ?? 0
  form.h = record?.data.h ?? 0
  form.aspect = form.w > 0 && form.h > 0 ? form.w / form.h : 1
  form.keepRatio = true
  if (k === 'slot') {
    const offset = sym.offset as { vertical: number; horizontal: number }
    form.vertical = offset.vertical
    form.horizontal = offset.horizontal
  } else {
    form.vertical = sym.vertical as number
    form.horizontal = sym.horizontal as number
  }
  // 新建时简谱锚点留空 = 按纵向偏移正负自动取 top / bottom
  form.anchor = k === 'note' && record ? ((record.data as CustomSymbolData<'note'>).numberNotationAnchor ?? '') : ''
  if (k === 'measure') {
    form.placement = sym.placement as typeof form.placement
    form.align = sym.align as typeof form.align
    form.position = (sym.type as typeof form.position) ?? 'upper'
  }
}

watch(visible, (open) => {
  if (open) resetForm()
})

function onPickFile() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const parsed = parseSymbolSvg(await file.text())
    form.content = parsed.content
    form.aspect = parsed.aspect
    const h = form.h > 0 ? form.h : DEFAULT_HEIGHT[kind.value]
    form.h = round2(h)
    form.w = round2(Math.min(SIZE_MAX, h * parsed.aspect))
    if (!form.name.trim()) form.name = file.name.replace(/\.svg$/i, '').slice(0, 100)
  } catch {
    ElMessage.error(t('editor.customSymbol.svgInvalid'))
  }
}

function onWidthChange(value: number | undefined) {
  const w = Number(value) || 0
  form.w = w
  if (form.keepRatio && w > 0 && form.aspect > 0) form.h = round2(w / form.aspect)
}

function onHeightChange(value: number | undefined) {
  const h = Number(value) || 0
  form.h = h
  if (form.keepRatio && h > 0 && form.aspect > 0) form.w = round2(h * form.aspect)
}

function onKeepRatioChange(keep: boolean | string | number) {
  if (keep && form.w > 0 && form.h > 0) form.aspect = form.w / form.h
}

function buildData(): CustomSymbolData {
  const skin = { content: form.content, w: form.w, h: form.h }
  if (kind.value === 'note') {
    return {
      ...skin,
      vertical: form.vertical,
      horizontal: form.horizontal,
      ...(form.anchor ? { numberNotationAnchor: form.anchor } : {})
    } as CustomSymbolData<'note'>
  }
  if (kind.value === 'slot') {
    return { ...skin, offset: { vertical: form.vertical, horizontal: form.horizontal } } as CustomSymbolData<'slot'>
  }
  return {
    ...skin,
    placement: form.placement,
    align: form.align,
    type: form.position,
    vertical: form.vertical,
    horizontal: form.horizontal
  } as CustomSymbolData<'measure'>
}

async function onSave() {
  if (!form.content) {
    ElMessage.warning(t('editor.customSymbol.svgRequired'))
    return
  }
  if (!form.name.trim()) {
    ElMessage.warning(t('editor.customSymbol.nameRequired'))
    return
  }
  if (!(form.w > 0) || !(form.h > 0)) {
    ElMessage.warning(t('editor.customSymbol.sizeInvalid'))
    return
  }
  saving.value = true
  try {
    const data = buildData()
    const record = editing.value
      ? await store.update(editing.value.id, form.name, data)
      : await store.create(form.name, kind.value, data)
    ElMessage.success(t(editing.value ? 'editor.customSymbol.saved' : 'editor.customSymbol.created'))
    emit('saved', record, !editing.value)
    visible.value = false
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  } finally {
    saving.value = false
  }
}

/* ---------- 预览：示意五线谱上按规则摆放（实际以曲谱为准） ---------- */
const PREVIEW_W = 220
const PREVIEW_H = 150
const STAFF_LEFT = 20
const STAFF_RIGHT = PREVIEW_W - 20
const STAFF_TOP = (PREVIEW_H - MEASURE_HEIGHT) / 2
const STAFF_BOTTOM = STAFF_TOP + MEASURE_HEIGHT
const NOTE_X = PREVIEW_W / 2
const NOTE_Y = STAFF_TOP + MEASURE_HEIGHT / 2
const staffLines = [0, 1, 2, 3, 4].map((i) => STAFF_TOP + (i * MEASURE_HEIGHT) / 4)

const previewMarkup = computed(() =>
  form.content && form.w > 0 && form.h > 0 ? customSymbolMarkup(form.content, form.w, form.h) : ''
)

const previewOrigin = computed(() => {
  const dx = form.horizontal * MEASURE_HEIGHT
  const dy = form.vertical * MEASURE_HEIGHT
  if (kind.value === 'note') {
    return { x: NOTE_X + dx - form.w / 2, y: NOTE_Y + dy - form.h / 2 }
  }
  if (kind.value === 'slot') {
    return { x: NOTE_X + dx - form.w / 2, y: STAFF_BOTTOM + dy - form.h / 2 }
  }
  const anchorX =
    form.placement === 'start' ? STAFF_LEFT : form.placement === 'end' ? STAFF_RIGHT : NOTE_X
  const x =
    form.align === 'left' ? anchorX : form.align === 'right' ? anchorX - form.w : anchorX - form.w / 2
  const y = form.position === 'upper' ? STAFF_TOP - dy - form.h : STAFF_BOTTOM + dy
  return { x: x + dx, y }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    append-to-body
    :close-on-click-modal="false"
    class="custom-symbol-edit"
  >
    <div class="custom-symbol-edit__body">
      <div class="custom-symbol-edit__preview">
        <svg
          :width="PREVIEW_W"
          :height="PREVIEW_H"
          :viewBox="`0 0 ${PREVIEW_W} ${PREVIEW_H}`"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            v-for="y in staffLines"
            :key="y"
            :x1="STAFF_LEFT"
            :x2="STAFF_RIGHT"
            :y1="y"
            :y2="y"
            stroke="#c9c2d6"
            stroke-width="1"
          />
          <line :x1="STAFF_LEFT" :x2="STAFF_LEFT" :y1="STAFF_TOP" :y2="STAFF_BOTTOM" stroke="#c9c2d6" />
          <line :x1="STAFF_RIGHT" :x2="STAFF_RIGHT" :y1="STAFF_TOP" :y2="STAFF_BOTTOM" stroke="#c9c2d6" />
          <ellipse
            v-if="kind !== 'measure'"
            :cx="NOTE_X"
            :cy="NOTE_Y"
            rx="6.5"
            ry="5"
            fill="#c9c2d6"
            :transform="`rotate(-20 ${NOTE_X} ${NOTE_Y})`"
          />
          <g
            v-if="previewMarkup"
            :transform="`translate(${previewOrigin.x} ${previewOrigin.y})`"
            v-html="previewMarkup"
          />
        </svg>
        <span class="custom-symbol-edit__preview-hint">{{ t('editor.customSymbol.previewHint') }}</span>
      </div>

      <el-form label-width="96px" size="small" class="custom-symbol-edit__form" @submit.prevent>
        <el-form-item :label="t('editor.customSymbol.svg')">
          <el-button @click="onPickFile">
            {{ form.content ? t('editor.customSymbol.reupload') : t('editor.customSymbol.upload') }}
          </el-button>
          <input
            ref="fileInput"
            type="file"
            accept=".svg,image/svg+xml"
            class="custom-symbol-edit__file"
            @change="onFileChange"
          />
        </el-form-item>
        <el-form-item :label="t('editor.customSymbol.name')">
          <el-input v-model="form.name" maxlength="100" :placeholder="t('editor.customSymbol.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('editor.customSymbol.size')">
          <div class="custom-symbol-edit__size">
            <el-input-number
              :model-value="form.w"
              :min="0.5"
              :max="SIZE_MAX"
              :step="1"
              :precision="2"
              controls-position="right"
              @update:model-value="onWidthChange"
            />
            <span>×</span>
            <el-input-number
              :model-value="form.h"
              :min="0.5"
              :max="SIZE_MAX"
              :step="1"
              :precision="2"
              controls-position="right"
              @update:model-value="onHeightChange"
            />
            <el-checkbox v-model="form.keepRatio" @change="onKeepRatioChange">
              {{ t('editor.customSymbol.keepRatio') }}
            </el-checkbox>
          </div>
          <div class="custom-symbol-edit__hint">{{ t('editor.customSymbol.sizeHint') }}</div>
        </el-form-item>

        <template v-if="kind === 'measure'">
          <el-form-item :label="t('editor.customSymbol.position')">
            <el-radio-group v-model="form.position">
              <el-radio-button v-for="value in POSITIONS" :key="value" :value="value">
                {{ t(`editor.customSymbol.positionOptions.${value}`) }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('editor.customSymbol.placement')">
            <el-radio-group v-model="form.placement">
              <el-radio-button v-for="value in PLACEMENTS" :key="value" :value="value">
                {{ t(`editor.customSymbol.placementOptions.${value}`) }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="t('editor.customSymbol.align')">
            <el-radio-group v-model="form.align">
              <el-radio-button v-for="value in ALIGNS" :key="value" :value="value">
                {{ t(`editor.customSymbol.alignOptions.${value}`) }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>

        <el-form-item :label="t('editor.customSymbol.vertical')">
          <el-input-number
            v-model="form.vertical"
            :step="0.05"
            :precision="2"
            :min="-5"
            :max="5"
            controls-position="right"
          />
          <div class="custom-symbol-edit__hint">
            {{ t(`editor.customSymbol.offsetHint.${kind}`) }}
          </div>
        </el-form-item>
        <el-form-item :label="t('editor.customSymbol.horizontal')">
          <el-input-number
            v-model="form.horizontal"
            :step="0.05"
            :precision="2"
            :min="-5"
            :max="5"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item v-if="kind === 'note'" :label="t('editor.customSymbol.anchor')">
          <el-select v-model="form.anchor">
            <el-option :label="t('editor.customSymbol.anchorAuto')" value="" />
            <el-option
              v-for="value in ANCHORS"
              :key="value"
              :label="t(`editor.customSymbol.anchorOptions.${value}`)"
              :value="value"
            />
          </el-select>
          <div class="custom-symbol-edit__hint">{{ t('editor.customSymbol.anchorHint') }}</div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSave">{{ t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.custom-symbol-edit__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.custom-symbol-edit__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #fbf9fe;
  border: 1px dashed rgba(201, 184, 255, 0.7);
  border-radius: 12px;
}

.custom-symbol-edit__preview svg {
  overflow: visible;
}

.custom-symbol-edit__preview-hint,
.custom-symbol-edit__hint {
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}

.custom-symbol-edit__hint {
  width: 100%;
}

.custom-symbol-edit__file {
  display: none;
}

.custom-symbol-edit__size {
  display: flex;
  align-items: center;
  gap: 6px;
}

.custom-symbol-edit__size :deep(.el-input-number) {
  width: 110px;
}

.custom-symbol-edit__form :deep(.el-select) {
  width: 180px;
}
</style>
