<script setup lang="ts">
import musicScoreVue from '@deciphony/renderer'
import type { MusicScore, Skin, TimeSignatureTypeEnum } from '@deciphony/renderer'
import {
  musicScoreToQuickNumberNotation,
  quickNumberNotationToMusicScore,
  type QuickTextToMusicScoreOptions
} from '@deciphony/extensions/dr-quick-numberNotation'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveScoreKeySignature } from '@renderer/utils/scoreNotationTransfer'

defineOptions({ name: 'QuickNumberNotationDrawer' })

type RuleItem = { syntax: string; desc: string }
type RuleSection = { title: string; items: RuleItem[] }

const props = defineProps<{
  musicScore: MusicScore
  skin?: Skin
  skinName?: string
}>()

const emit = defineEmits<{
  (e: 'sync', score: MusicScore): void
}>()

const visible = defineModel<boolean>({ default: false })

const { t, tm } = useI18n()

const text = ref('')
const preview = shallowRef<MusicScore | null>(null)
const previewWarnings = ref<string[]>([])
const convertWarnings = ref<string[]>([])
const rulesVisible = ref(false)

const warnings = computed(() => [...convertWarnings.value, ...previewWarnings.value])
const ruleSections = computed(() => tm('editor.quickInput.ruleSections') as RuleSection[])
const ruleExample = computed(() => (tm('editor.quickInput.ruleExample') as string[]).join('\n'))

function firstMeasureTimeSignature(score: MusicScore): TimeSignatureTypeEnum | undefined {
  for (const grandStaff of score.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      for (const measure of staff.measures ?? []) {
        const type = measure.timeSignature_f?.type
        if (type) return type
      }
    }
  }
  return undefined
}

/**
 * 预览 / 同步沿用当前曲谱的元信息（标题、调号、拍号、速度…），高度交给扩展按行数估算。
 * 不带 id：预览与编辑区同时渲染，同 id 会撞 SVG 元素 id；同步时再换回当前曲谱 id。
 */
function currentScoreMeta(): QuickTextToMusicScoreOptions {
  const score = props.musicScore
  const { title, description, bpm, beatUnit, width, topSpaceHeight, data } = score
  return JSON.parse(
    JSON.stringify({
      title,
      description,
      bpm,
      beatUnit,
      width,
      topSpaceHeight,
      data,
      keySignature: resolveScoreKeySignature(score),
      timeSignature: score.timeSignature ?? firstMeasureTimeSignature(score)
    })
  ) as QuickTextToMusicScoreOptions
}

function handleScoreToText() {
  try {
    const result = musicScoreToQuickNumberNotation(props.musicScore)
    text.value = result.text
    convertWarnings.value = result.warnings
    ElMessage.success(t('editor.quickInput.textFromScore'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.quickInput.scoreToTextFailed'))
  }
}

function handleUpdatePreview() {
  const result = quickNumberNotationToMusicScore(text.value, currentScoreMeta())
  preview.value = result.musicScore
  previewWarnings.value = result.warnings
}

function handleSync() {
  if (preview.value) emit('sync', { ...preview.value, id: props.musicScore.id })
}

function onKeyDown(event: KeyboardEvent) {
  if (!visible.value) return
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
  if (event.key.toLowerCase() !== 's') return
  event.preventDefault()
  if (!event.repeat) handleUpdatePreview()
}

watch(visible, (open) => {
  if (open && !preview.value) handleUpdatePreview()
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown, true)
})
</script>

<template>
  <el-drawer
    v-model="visible"
    direction="btt"
    size="94%"
    class="quick-input-drawer"
    :with-header="false"
  >
    <div class="quick-input">
      <header class="quick-input__header">
        <h2 class="quick-input__title">{{ t('editor.quickInput.title') }}</h2>
        <div class="quick-input__actions">
          <button type="button" class="quick-input__btn" @click="handleScoreToText">
            {{ t('editor.quickInput.scoreToText') }}
          </button>
          <button type="button" class="quick-input__btn" @click="handleUpdatePreview">
            {{ t('editor.quickInput.updatePreview') }}
            <kbd class="quick-input__kbd">Ctrl+S</kbd>
          </button>
          <button
            type="button"
            class="quick-input__btn quick-input__btn--primary"
            :disabled="!preview"
            @click="handleSync"
          >
            {{ t('editor.quickInput.syncToScore') }}
          </button>
          <button type="button" class="quick-input__btn" @click="rulesVisible = true">
            {{ t('editor.quickInput.rules') }}
          </button>
          <button
            type="button"
            class="quick-input__close"
            :aria-label="t('common.back')"
            @click="visible = false"
          >
            ×
          </button>
        </div>
      </header>

      <div class="quick-input__body">
        <section class="quick-input__editor">
          <h3 class="quick-input__section-title">{{ t('editor.quickInput.textTitle') }}</h3>
          <textarea
            v-model="text"
            class="quick-input__textarea"
            spellcheck="false"
            :placeholder="t('editor.quickInput.textPlaceholder')"
          />
          <div v-if="warnings.length" class="quick-input__warnings">
            <h3 class="quick-input__section-title">
              {{ t('editor.quickInput.warningsTitle', { count: warnings.length }) }}
            </h3>
            <ul>
              <li v-for="(item, index) in warnings" :key="index">{{ item }}</li>
            </ul>
          </div>
        </section>

        <section class="quick-input__preview">
          <h3 class="quick-input__section-title">{{ t('editor.quickInput.previewTitle') }}</h3>
          <div class="quick-input__paper">
            <musicScoreVue
              v-if="preview && skin"
              :key="skinName"
              :data="preview"
              :skin="skin"
              :skin-name="skinName"
            />
          </div>
        </section>
      </div>
    </div>
  </el-drawer>

  <el-dialog
    v-model="rulesVisible"
    :title="t('editor.quickInput.rulesTitle')"
    width="620px"
    class="quick-input-rules cute-dialog"
    append-to-body
    align-center
  >
    <section
      v-for="section in ruleSections"
      :key="section.title"
      class="quick-input-rules__section"
    >
      <h3 class="quick-input-rules__title">{{ section.title }}</h3>
      <dl class="quick-input-rules__list">
        <template v-for="item in section.items" :key="item.syntax">
          <dt><code>{{ item.syntax }}</code></dt>
          <dd>{{ item.desc }}</dd>
        </template>
      </dl>
    </section>
    <section class="quick-input-rules__section">
      <h3 class="quick-input-rules__title">{{ t('editor.quickInput.ruleExampleTitle') }}</h3>
      <pre class="quick-input-rules__example">{{ ruleExample }}</pre>
    </section>

    <template #footer>
      <button type="button" class="quick-input__btn quick-input__btn--primary" @click="rulesVisible = false">
        {{ t('common.gotIt') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.quick-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.quick-input__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.quick-input__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #5c4a6a;
}

.quick-input__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.quick-input__btn {
  min-height: 32px;
  padding: 0 16px;
  border: 1px solid rgba(255, 184, 208, 0.6);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.quick-input__btn:hover:not(:disabled) {
  border-color: #ff8fb8;
  background: rgba(255, 214, 232, 0.85);
}

.quick-input__kbd {
  margin-left: 4px;
  padding: 0 5px;
  border: 1px solid rgba(201, 184, 255, 0.6);
  border-radius: 5px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  color: #8a7a98;
  background: rgba(248, 240, 255, 0.9);
}

.quick-input__btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
}

.quick-input__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  filter: brightness(1.05);
}

.quick-input__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-input__close {
  width: 32px;
  height: 32px;
  margin-left: 4px;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  color: #7a6a88;
  background: transparent;
  cursor: pointer;
}

.quick-input__close:hover {
  background: rgba(255, 214, 232, 0.7);
}

.quick-input__body {
  display: grid;
  grid-template-columns: minmax(320px, 2fr) minmax(0, 3fr);
  gap: 14px;
  flex: 1 1 auto;
  min-height: 0;
}

.quick-input__editor,
.quick-input__preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.quick-input__section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #7a6a88;
}

.quick-input__textarea {
  flex: 1 1 auto;
  min-height: 160px;
  padding: 12px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  font: 15px/1.7 Consolas, 'Courier New', monospace;
  color: #3d3048;
  background: #fff;
  resize: none;
  outline: none;
  box-sizing: border-box;
}

.quick-input__textarea:focus {
  border-color: #ff8fb8;
  box-shadow: 0 0 0 3px rgba(255, 158, 197, 0.2);
}

.quick-input__warnings {
  flex: 0 1 auto;
  max-height: 30%;
  overflow: auto;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 236, 200, 0.55);
}

.quick-input__warnings ul {
  margin: 6px 0 0;
  padding-left: 1.2em;
  font-size: 12px;
  line-height: 1.7;
  color: #8a5a00;
}

.quick-input__paper {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(201, 184, 255, 0.45);
}

.quick-input__paper > :deep(svg) {
  margin-inline: auto;
}

.quick-input-rules__section {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(255, 184, 208, 0.35);
}

.quick-input-rules__section:last-of-type {
  border-bottom: none;
}

.quick-input-rules__title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.quick-input-rules__list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 12px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #7a6a88;
}

.quick-input-rules__list dt {
  margin: 0;
}

.quick-input-rules__list dd {
  margin: 0;
}

.quick-input-rules__list code,
.quick-input-rules__example {
  font-family: Consolas, 'Courier New', monospace;
  color: #5c4a6a;
}

.quick-input-rules__list code {
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(201, 184, 255, 0.22);
}

.quick-input-rules__example {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  background: rgba(201, 184, 255, 0.16);
}
</style>

<!-- drawer 默认 teleport 到 body，scoped 打不到 -->
<style>
.quick-input-drawer.el-drawer {
  border-radius: 24px 24px 0 0;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.quick-input-drawer .el-drawer__body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 18px 22px;
  overflow: hidden;
  box-sizing: border-box;
}

.quick-input-drawer .quick-input {
  flex: 1 1 auto;
}
</style>
