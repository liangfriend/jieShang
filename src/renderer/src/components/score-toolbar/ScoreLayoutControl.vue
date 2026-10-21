<script setup lang="ts">
import type { MusicScore } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readInstrumentName } from '@deciphony/extensions/dr-instrument-name'
import {
  SCORE_LYRICS_FONT_SIZE_MAX,
  SCORE_LYRICS_FONT_SIZE_MIN,
  SCORE_LYRICS_FONT_SIZE_STEP,
  SCORE_S_L_SLOT_W_MAX,
  SCORE_S_L_SLOT_W_MIN,
  SCORE_S_L_SLOT_W_STEP,
  SCORE_S_R_SLOT_W_MAX,
  SCORE_S_R_SLOT_W_MIN,
  SCORE_S_R_SLOT_W_STEP,
  SCORE_T_SLOT_H_MAX,
  SCORE_T_SLOT_H_MIN,
  SCORE_T_SLOT_H_STEP
} from '@renderer/utils/scoreGdSlotHeight'
import {
  SCORE_HEIGHT_MAX,
  SCORE_HEIGHT_MIN,
  SCORE_HEIGHT_STEP,
  SCORE_SPACING_MAX,
  SCORE_SPACING_MIN,
  SCORE_SPACING_STEP,
  SCORE_WIDTH_MAX,
  SCORE_WIDTH_MIN,
  SCORE_WIDTH_STEP,
  applyLyricsFontFamily,
  applyLyricsFontSize,
  applySLSlotWidth,
  applySRSlotWidth,
  applyScoreHeight,
  applyScoreLayoutDefaults,
  applyScoreStaffSpacing,
  applyScoreWidth,
  applyInstrumentNameFontFamily,
  applyTitleFontFamily,
  applyTSlotHeight,
  loadScoreLayoutDefaults,
  readScoreLayoutDraft,
  readShowInstrumentName,
  saveScoreLayoutDefaults,
  type ScoreLayoutDefaults,
  type ScoreStaffSpacing
} from '@renderer/utils/scoreSpacingDefaults'
import { SCORE_FONT_FAMILY_OPTIONS } from '@renderer/utils/scoreFontOptions'
import ScoreLayoutPreview from './ScoreLayoutPreview.vue'

defineOptions({ name: 'ScoreLayoutControl' })

const props = withDefaults(
  defineProps<{
    musicScore: MusicScore
    disabled?: boolean
    /** 仅保留对话框（由菜单栏等外部触发 openDialog） */
    hideTrigger?: boolean
  }>(),
  {
    disabled: false,
    hideTrigger: false
  }
)

const { t } = useI18n()
const visible = ref(false)
/** 当前曲谱布局（改完立即写入谱面） */
const draft = ref<ScoreLayoutDefaults>(readScoreLayoutDraft(props.musicScore))
/** 默认布局（改完自动写入 localStorage；点「应用」套到当前曲谱） */
const defaultsDraft = ref<ScoreLayoutDefaults>(loadScoreLayoutDefaults())

const fontOptions = SCORE_FONT_FAMILY_OPTIONS

const fields: { key: keyof ScoreStaffSpacing; labelKey: string; group: 'grand' | 'single' }[] = [
  { key: 'uSpace', labelKey: 'editor.layoutDialog.uSpace', group: 'grand' },
  { key: 'dSpace', labelKey: 'editor.layoutDialog.dSpace', group: 'grand' },
  { key: 'uSpaceO', labelKey: 'editor.layoutDialog.uSpaceO', group: 'single' },
  { key: 'uSpaceI', labelKey: 'editor.layoutDialog.uSpaceI', group: 'single' },
  { key: 'dSpaceI', labelKey: 'editor.layoutDialog.dSpaceI', group: 'single' },
  { key: 'dSpaceO', labelKey: 'editor.layoutDialog.dSpaceO', group: 'single' }
]

const grandFields = computed(() => fields.filter((f) => f.group === 'grand'))
const singleFields = computed(() => fields.filter((f) => f.group === 'single'))

watch(visible, (open) => {
  if (!open) return
  draft.value = readScoreLayoutDraft(props.musicScore)
  defaultsDraft.value = loadScoreLayoutDefaults()
})

function onFieldChange(key: keyof ScoreStaffSpacing, value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  draft.value = { ...draft.value, [key]: value }
  applyScoreStaffSpacing(props.musicScore, draft.value)
}

function persistDefaults(next: ScoreLayoutDefaults) {
  defaultsDraft.value = saveScoreLayoutDefaults(next)
}

function onDefaultFieldChange(key: keyof ScoreStaffSpacing, value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  persistDefaults({ ...defaultsDraft.value, [key]: value })
}

function onLyricsFontSizeChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  draft.value = { ...draft.value, lyricsFontSize: value }
  applyLyricsFontSize(props.musicScore, value)
}

function onDefaultLyricsFontSizeChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  persistDefaults({ ...defaultsDraft.value, lyricsFontSize: value })
}

function onLyricsFontFamilyChange(value: string | undefined) {
  const next = value ?? ''
  draft.value = { ...draft.value, lyricsFontFamily: next }
  applyLyricsFontFamily(props.musicScore, next)
}

function onDefaultLyricsFontFamilyChange(value: string | undefined) {
  persistDefaults({ ...defaultsDraft.value, lyricsFontFamily: value ?? '' })
}

function onTitleFontFamilyChange(value: string | undefined) {
  const next = value ?? ''
  draft.value = { ...draft.value, titleFontFamily: next }
  applyTitleFontFamily(props.musicScore, next)
}

function onDefaultTitleFontFamilyChange(value: string | undefined) {
  persistDefaults({ ...defaultsDraft.value, titleFontFamily: value ?? '' })
}

function onInstrumentNameFontFamilyChange(value: string | undefined) {
  const next = value ?? ''
  draft.value = { ...draft.value, instrumentNameFontFamily: next }
  applyInstrumentNameFontFamily(props.musicScore, next)
}

function onDefaultInstrumentNameFontFamilyChange(value: string | undefined) {
  persistDefaults({ ...defaultsDraft.value, instrumentNameFontFamily: value ?? '' })
}

function onHeightChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  applyScoreHeight(props.musicScore, value)
}

function onTSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  draft.value = { ...draft.value, tSlotH: value }
  applyTSlotHeight(props.musicScore, value)
}

function onDefaultTSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  persistDefaults({ ...defaultsDraft.value, tSlotH: value })
}

function onWidthChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  applyScoreWidth(props.musicScore, value)
}

function onSLSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  draft.value = { ...draft.value, sLSlotW: value }
  applySLSlotWidth(props.musicScore, value)
}

function onDefaultSLSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  persistDefaults({ ...defaultsDraft.value, sLSlotW: value })
}

function onSRSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  draft.value = { ...draft.value, sRSlotW: value }
  applySRSlotWidth(props.musicScore, value)
}

function onDefaultSRSlotChange(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return
  persistDefaults({ ...defaultsDraft.value, sRSlotW: value })
}

/** 预览里左留白示意的音色名：开启显示音色时取首个设置了音色名的单谱表 */
const previewInstrumentName = computed(() => {
  if (!readShowInstrumentName(props.musicScore)) return undefined
  for (const grand of props.musicScore.grandStaffs) {
    for (const staff of grand.staves) {
      const name = readInstrumentName(staff)
      if (name) return name
    }
  }
  return undefined
})

function openDialog() {
  if (props.disabled) return
  visible.value = true
}

defineExpose({ openDialog })


/** 把当前曲谱布局写入软件默认 */
function setAsDefault() {
  defaultsDraft.value = saveScoreLayoutDefaults(draft.value)
  ElMessage.success(t('editor.layoutDialog.setDefaultSuccess'))
}

/** 把默认布局应用到当前曲谱（不含页面宽高） */
function applyDefault() {
  draft.value = applyScoreLayoutDefaults(props.musicScore, defaultsDraft.value)
  ElMessage.success(t('editor.layoutDialog.applyDefaultSuccess'))
}
</script>

<template>
  <el-button
    v-if="!hideTrigger"
    class="toolbar-btn"
    size="small"
    :disabled="disabled"
    @click="openDialog"
  >
    {{ t('editor.toolbar.layout') }}
  </el-button>

  <el-dialog
    v-model="visible"
    :title="t('editor.layoutDialog.title')"
    width="1200px"
    class="score-layout-dialog cute-dialog"
    modal-class="score-layout-dialog-modal"
    :transition="{ name: 'score-layout-none', css: false }"
    append-to-body
    align-center
    destroy-on-close
  >
    <div class="score-layout-dialog__columns">
      <!-- 当前曲谱布局 -->
      <section class="score-layout-dialog__panel">
        <header class="score-layout-dialog__panel-head">
          <h2 class="score-layout-dialog__panel-title">{{ t('editor.layoutDialog.currentPanel') }}</h2>
          <p class="score-layout-dialog__panel-desc">{{ t('editor.layoutDialog.currentPanelHint') }}</p>
        </header>

        <div class="score-layout-dialog__panel-body">
          <div class="score-layout-dialog__form">
            <section class="score-layout-dialog__section">
              <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.page') }}</h3>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.pageWidth') }}</span>
                <el-input-number
                  :model-value="musicScore.width"
                  :min="SCORE_WIDTH_MIN"
                  :max="SCORE_WIDTH_MAX"
                  :step="SCORE_WIDTH_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onWidthChange"
                />
              </div>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.sLSlotW') }}</span>
                <el-input-number
                  :model-value="draft.sLSlotW"
                  :min="SCORE_S_L_SLOT_W_MIN"
                  :max="SCORE_S_L_SLOT_W_MAX"
                  :step="SCORE_S_L_SLOT_W_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onSLSlotChange"
                />
              </div>
              <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
                {{ t('editor.layoutDialog.sLSlotWHint') }}
              </p>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.instrumentNameFont') }}</span>
                <el-select
                  class="score-layout-dialog__font"
                  :model-value="draft.instrumentNameFontFamily"
                  size="small"
                  @update:model-value="onInstrumentNameFontFamilyChange"
                >
                  <el-option
                    v-for="opt in fontOptions"
                    :key="`cur-instrument-${opt.value || 'default'}`"
                    :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                    :value="opt.value"
                  />
                </el-select>
              </div>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.sRSlotW') }}</span>
                <el-input-number
                  :model-value="draft.sRSlotW"
                  :min="SCORE_S_R_SLOT_W_MIN"
                  :max="SCORE_S_R_SLOT_W_MAX"
                  :step="SCORE_S_R_SLOT_W_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onSRSlotChange"
                />
              </div>
              <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
                {{ t('editor.layoutDialog.sRSlotWHint') }}
              </p>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.pageHeight') }}</span>
                <el-input-number
                  :model-value="musicScore.height"
                  :min="SCORE_HEIGHT_MIN"
                  :max="SCORE_HEIGHT_MAX"
                  :step="SCORE_HEIGHT_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onHeightChange"
                />
              </div>
              <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
                {{ t('editor.layoutDialog.pageHeightHint') }}
              </p>
            </section>

            <section class="score-layout-dialog__section">
              <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.titleArea') }}</h3>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.tSlotH') }}</span>
                <el-input-number
                  :model-value="draft.tSlotH"
                  :min="SCORE_T_SLOT_H_MIN"
                  :max="SCORE_T_SLOT_H_MAX"
                  :step="SCORE_T_SLOT_H_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onTSlotChange"
                />
              </div>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.titleFont') }}</span>
                <el-select
                  class="score-layout-dialog__font"
                  :model-value="draft.titleFontFamily"
                  size="small"
                  @update:model-value="onTitleFontFamilyChange"
                >
                  <el-option
                    v-for="opt in fontOptions"
                    :key="`cur-title-${opt.value || 'default'}`"
                    :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                    :value="opt.value"
                  />
                </el-select>
              </div>
            </section>

            <section class="score-layout-dialog__section">
              <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.lyricsArea') }}</h3>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.lyricsFont') }}</span>
                <el-select
                  class="score-layout-dialog__font"
                  :model-value="draft.lyricsFontFamily"
                  size="small"
                  @update:model-value="onLyricsFontFamilyChange"
                >
                  <el-option
                    v-for="opt in fontOptions"
                    :key="`cur-lyrics-${opt.value || 'default'}`"
                    :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                    :value="opt.value"
                  />
                </el-select>
              </div>
              <div class="score-layout-dialog__row">
                <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.lyricsFontSize') }}</span>
                <el-input-number
                  :model-value="draft.lyricsFontSize"
                  :min="SCORE_LYRICS_FONT_SIZE_MIN"
                  :max="SCORE_LYRICS_FONT_SIZE_MAX"
                  :step="SCORE_LYRICS_FONT_SIZE_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onLyricsFontSizeChange"
                />
              </div>
              <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
                {{ t('editor.layoutDialog.lyricsFontSizeHint') }}
              </p>
            </section>

            <section class="score-layout-dialog__section">
              <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.grandStaff') }}</h3>
              <div
                v-for="field in grandFields"
                :key="`cur-${field.key}`"
                class="score-layout-dialog__row"
              >
                <span class="score-layout-dialog__label">{{ t(field.labelKey) }}</span>
                <el-input-number
                  :model-value="draft[field.key]"
                  :min="SCORE_SPACING_MIN"
                  :max="SCORE_SPACING_MAX"
                  :step="SCORE_SPACING_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onFieldChange(field.key, $event)"
                />
              </div>
            </section>

            <section class="score-layout-dialog__section">
              <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.singleStaff') }}</h3>
              <div
                v-for="field in singleFields"
                :key="`cur-${field.key}`"
                class="score-layout-dialog__row"
              >
                <span class="score-layout-dialog__label">{{ t(field.labelKey) }}</span>
                <el-input-number
                  :model-value="draft[field.key]"
                  :min="SCORE_SPACING_MIN"
                  :max="SCORE_SPACING_MAX"
                  :step="SCORE_SPACING_STEP"
                  controls-position="right"
                  size="small"
                  @update:model-value="onFieldChange(field.key, $event)"
                />
              </div>
            </section>
          </div>

          <aside class="score-layout-dialog__preview">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.preview') }}</h3>
            <ScoreLayoutPreview
              :title="musicScore.title"
              :width="musicScore.width"
              :height="musicScore.height"
              :t-slot-h="draft.tSlotH"
              :s-l-slot-w="draft.sLSlotW"
              :s-r-slot-w="draft.sRSlotW"
              :instrument-name="previewInstrumentName"
              :instrument-name-font-family="draft.instrumentNameFontFamily || undefined"
            />
          </aside>
        </div>

        <footer class="score-layout-dialog__panel-foot">
          <button
            type="button"
            class="score-layout-dialog__btn score-layout-dialog__btn--primary"
            :title="t('editor.layoutDialog.setDefaultHint')"
            @click="setAsDefault"
          >
            {{ t('editor.layoutDialog.setDefault') }}
          </button>
        </footer>
      </section>

      <!-- 默认布局 -->
      <section class="score-layout-dialog__panel score-layout-dialog__panel--defaults">
        <header class="score-layout-dialog__panel-head">
          <h2 class="score-layout-dialog__panel-title">{{ t('editor.layoutDialog.defaultPanel') }}</h2>
          <p class="score-layout-dialog__panel-desc">{{ t('editor.layoutDialog.defaultPanelHint') }}</p>
        </header>

        <div class="score-layout-dialog__form score-layout-dialog__form--solo">
          <section class="score-layout-dialog__section">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.page') }}</h3>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.sLSlotW') }}</span>
              <el-input-number
                :model-value="defaultsDraft.sLSlotW"
                :min="SCORE_S_L_SLOT_W_MIN"
                :max="SCORE_S_L_SLOT_W_MAX"
                :step="SCORE_S_L_SLOT_W_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultSLSlotChange"
              />
            </div>
            <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
              {{ t('editor.layoutDialog.sLSlotWHint') }}
            </p>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.instrumentNameFont') }}</span>
              <el-select
                class="score-layout-dialog__font"
                :model-value="defaultsDraft.instrumentNameFontFamily"
                size="small"
                @update:model-value="onDefaultInstrumentNameFontFamilyChange"
              >
                <el-option
                  v-for="opt in fontOptions"
                  :key="`def-instrument-${opt.value || 'default'}`"
                  :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                  :value="opt.value"
                />
              </el-select>
            </div>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.sRSlotW') }}</span>
              <el-input-number
                :model-value="defaultsDraft.sRSlotW"
                :min="SCORE_S_R_SLOT_W_MIN"
                :max="SCORE_S_R_SLOT_W_MAX"
                :step="SCORE_S_R_SLOT_W_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultSRSlotChange"
              />
            </div>
            <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
              {{ t('editor.layoutDialog.sRSlotWHint') }}
            </p>
            <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
              {{ t('editor.layoutDialog.defaultNoPageSizeHint') }}
            </p>
          </section>

          <section class="score-layout-dialog__section">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.titleArea') }}</h3>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.tSlotH') }}</span>
              <el-input-number
                :model-value="defaultsDraft.tSlotH"
                :min="SCORE_T_SLOT_H_MIN"
                :max="SCORE_T_SLOT_H_MAX"
                :step="SCORE_T_SLOT_H_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultTSlotChange"
              />
            </div>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.titleFont') }}</span>
              <el-select
                class="score-layout-dialog__font"
                :model-value="defaultsDraft.titleFontFamily"
                size="small"
                @update:model-value="onDefaultTitleFontFamilyChange"
              >
                <el-option
                  v-for="opt in fontOptions"
                  :key="`def-title-${opt.value || 'default'}`"
                  :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                  :value="opt.value"
                />
              </el-select>
            </div>
          </section>

          <section class="score-layout-dialog__section">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.lyricsArea') }}</h3>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.lyricsFont') }}</span>
              <el-select
                class="score-layout-dialog__font"
                :model-value="defaultsDraft.lyricsFontFamily"
                size="small"
                @update:model-value="onDefaultLyricsFontFamilyChange"
              >
                <el-option
                  v-for="opt in fontOptions"
                  :key="`def-lyrics-${opt.value || 'default'}`"
                  :label="opt.value ? opt.label : t('editor.layoutDialog.fontDefault')"
                  :value="opt.value"
                />
              </el-select>
            </div>
            <div class="score-layout-dialog__row">
              <span class="score-layout-dialog__label">{{ t('editor.layoutDialog.lyricsFontSize') }}</span>
              <el-input-number
                :model-value="defaultsDraft.lyricsFontSize"
                :min="SCORE_LYRICS_FONT_SIZE_MIN"
                :max="SCORE_LYRICS_FONT_SIZE_MAX"
                :step="SCORE_LYRICS_FONT_SIZE_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultLyricsFontSizeChange"
              />
            </div>
            <p class="score-layout-dialog__hint score-layout-dialog__hint--inline">
              {{ t('editor.layoutDialog.lyricsFontSizeHint') }}
            </p>
          </section>

          <section class="score-layout-dialog__section">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.grandStaff') }}</h3>
            <div
              v-for="field in grandFields"
              :key="`def-${field.key}`"
              class="score-layout-dialog__row"
            >
              <span class="score-layout-dialog__label">{{ t(field.labelKey) }}</span>
              <el-input-number
                :model-value="defaultsDraft[field.key]"
                :min="SCORE_SPACING_MIN"
                :max="SCORE_SPACING_MAX"
                :step="SCORE_SPACING_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultFieldChange(field.key, $event)"
              />
            </div>
          </section>

          <section class="score-layout-dialog__section">
            <h3 class="score-layout-dialog__title">{{ t('editor.layoutDialog.singleStaff') }}</h3>
            <div
              v-for="field in singleFields"
              :key="`def-${field.key}`"
              class="score-layout-dialog__row"
            >
              <span class="score-layout-dialog__label">{{ t(field.labelKey) }}</span>
              <el-input-number
                :model-value="defaultsDraft[field.key]"
                :min="SCORE_SPACING_MIN"
                :max="SCORE_SPACING_MAX"
                :step="SCORE_SPACING_STEP"
                controls-position="right"
                size="small"
                @update:model-value="onDefaultFieldChange(field.key, $event)"
              />
            </div>
          </section>
        </div>

        <footer class="score-layout-dialog__panel-foot">
          <button
            type="button"
            class="score-layout-dialog__btn score-layout-dialog__btn--primary"
            :title="t('editor.layoutDialog.applyDefaultHint')"
            @click="applyDefault"
          >
            {{ t('editor.layoutDialog.apply') }}
          </button>
        </footer>
      </section>
    </div>
  </el-dialog>
</template>

<style scoped>
/* 弹窗本身全透明；凡是文字都垫一块底，和背后的谱面区分开 */
.score-layout-dialog__title,
.score-layout-dialog__label,
.score-layout-dialog__hint,
.score-layout-dialog__panel-title,
.score-layout-dialog__panel-desc {
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(120, 90, 140, 0.12);
}

.score-layout-dialog__hint {
  font-size: 12px;
  line-height: 1.5;
  color: #8a7a98;
}

.score-layout-dialog__hint--inline {
  margin: -4px 0 8px;
}

.score-layout-dialog__columns {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: 16px;
  align-items: stretch;
  max-height: 72vh;
}

.score-layout-dialog__panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border: 1.5px solid rgba(255, 143, 186, 0.75);
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
}

.score-layout-dialog__panel--defaults {
  border-color: rgba(176, 152, 255, 0.8);
}

.score-layout-dialog__panel-head {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(255, 143, 186, 0.6);
}

.score-layout-dialog__panel--defaults .score-layout-dialog__panel-head {
  border-bottom-color: rgba(176, 152, 255, 0.65);
}

.score-layout-dialog__panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #5c4a6a;
}

.score-layout-dialog__panel-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #8a7a98;
}

.score-layout-dialog__panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 10px 12px;
  overflow: hidden;
}

.score-layout-dialog__form {
  flex: 1;
  min-width: 0;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.score-layout-dialog__form--solo {
  flex: 1;
  min-height: 0;
  padding: 10px 12px;
  overflow-y: auto;
}

/* 示意图 220 + 总高度竖标 28 + gap/padding；内容超出时本栏滚动，避免被分区裁切 */
.score-layout-dialog__preview {
  flex: 0 0 290px;
  box-sizing: border-box;
  width: 290px;
  max-height: 100%;
  padding: 4px 6px 10px 12px;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px dashed rgba(255, 143, 186, 0.6);
}

.score-layout-dialog__section {
  padding: 8px 0 4px;
  border-bottom: 1px dashed rgba(255, 143, 186, 0.6);
}

.score-layout-dialog__panel--defaults .score-layout-dialog__section {
  border-bottom-color: rgba(176, 152, 255, 0.65);
}

.score-layout-dialog__section:last-of-type {
  border-bottom: none;
}

.score-layout-dialog__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 800;
  color: #5c4a6a;
}

.score-layout-dialog__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.score-layout-dialog__label {
  flex: 0 0 auto;
  font-size: 13px;
  color: #6a5a78;
  white-space: nowrap;
}

.score-layout-dialog__row :deep(.el-input-number) {
  width: 120px;
}

.score-layout-dialog__font {
  flex: 0 1 168px;
  min-width: 0;
  width: 168px;
}

.score-layout-dialog__panel-foot {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px 12px;
  border-top: 1px solid rgba(255, 143, 186, 0.6);
}

.score-layout-dialog__panel--defaults .score-layout-dialog__panel-foot {
  border-top-color: rgba(176, 152, 255, 0.65);
}

.score-layout-dialog__btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  color: #8a5a72;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.score-layout-dialog__btn--primary {
  border-color: rgba(201, 184, 255, 0.65);
  background: linear-gradient(135deg, rgba(255, 214, 232, 0.95), rgba(230, 220, 255, 0.95));
  color: #5c4a6a;
}
</style>

<style>
.score-layout-dialog.cute-dialog.el-dialog {
  overflow: visible;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  box-shadow: none;
}

.score-layout-dialog.cute-dialog .el-dialog__header {
  padding: 12px 24px 8px;
  background: transparent;
}

.score-layout-dialog.cute-dialog .el-dialog__title {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 6px rgba(120, 90, 140, 0.15);
  font-weight: 800;
  color: #5c4a6a;
}

.score-layout-dialog.cute-dialog .el-dialog__headerbtn {
  top: 10px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 6px rgba(120, 90, 140, 0.15);
}

.score-layout-dialog.cute-dialog .el-dialog__body {
  padding: 8px 24px 20px;
  background: transparent;
}

.score-layout-dialog.cute-dialog .el-dialog__footer {
  display: none;
}

.score-layout-dialog-modal {
  background-color: rgba(92, 74, 106, 0.18) !important;
}
</style>
