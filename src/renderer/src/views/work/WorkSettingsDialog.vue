<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@deciphony/work'

defineOptions({ name: 'WorkSettingsDialog' })

const props = defineProps<{
  modelValue: boolean
  pageWidth: number
  pageHeight: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:pageWidth': [value: number]
  'update:pageHeight': [value: number]
  'apply-all': [payload: { width: number; height: number }]
}>()

const { t } = useI18n()
const draftWidth = ref(DEFAULT_PAGE_WIDTH)
const draftHeight = ref(DEFAULT_PAGE_HEIGHT)

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    draftWidth.value = Math.round(props.pageWidth) || DEFAULT_PAGE_WIDTH
    draftHeight.value = Math.round(props.pageHeight) || DEFAULT_PAGE_HEIGHT
  }
)

function normalizeSize(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.round(value)
}

function commitDraft() {
  const width = normalizeSize(draftWidth.value, DEFAULT_PAGE_WIDTH)
  const height = normalizeSize(draftHeight.value, DEFAULT_PAGE_HEIGHT)
  draftWidth.value = width
  draftHeight.value = height
  emit('update:pageWidth', width)
  emit('update:pageHeight', height)
  return { width, height }
}

function onApplyAll() {
  emit('apply-all', commitDraft())
}

function onConfirm() {
  commitDraft()
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('work.settingsDialog.title')"
    width="480px"
    class="cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div class="settings-row">
      <span class="settings-row__label">{{ t('work.settingsDialog.newPageSize') }}</span>
      <el-input-number
        v-model="draftWidth"
        class="settings-row__input"
        :min="100"
        :max="10000"
        :step="1"
        controls-position="right"
      />
      <span class="settings-row__times">×</span>
      <el-input-number
        v-model="draftHeight"
        class="settings-row__input"
        :min="100"
        :max="10000"
        :step="1"
        controls-position="right"
      />
      <button type="button" class="apply-btn" @click="onApplyAll">
        {{ t('work.settingsDialog.applyAll') }}
      </button>
    </div>
    <p class="settings-hint">{{ t('work.settingsDialog.hint') }}</p>

    <template #footer>
      <div class="footer">
        <button type="button" class="ghost-btn" @click="visible = false">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="primary-btn" @click="onConfirm">
          {{ t('work.settingsDialog.confirm') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.settings-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.settings-row__label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
  margin-right: 4px;
}

.settings-row__input {
  width: 120px;
}

.settings-row__times {
  font-weight: 800;
  color: #9a8aa8;
}

.apply-btn {
  margin-left: auto;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.65);
  background: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.settings-hint {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #9a8aa8;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ghost-btn,
.primary-btn {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn {
  border: 1px solid rgba(201, 184, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #6a5a88;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}
</style>
