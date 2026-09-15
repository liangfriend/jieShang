<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'
import { DrawToolEnum } from '@deciphony/work'
import {
  displayScoreName,
  loadScoreFromDatabase,
  parseScoreJson,
  searchScoresFromDatabase,
  type ScoreListItem
} from '@renderer/utils/fileHelper'

defineOptions({ name: 'WorkEditToolbar' })

const DEFAULT_PEN_WIDTH = 3
const DEFAULT_ERASER_WIDTH = 20

const props = defineProps<{
  drawing: boolean
  drawTool: DrawToolEnum
  drawLineWidth: number
}>()

const emit = defineEmits<{
  openAssets: []
  addText: [payload: { text: string; fontSize: number; color: string }]
  addScore: [payload: { musicScore: unknown; scale: number }]
  'toggle-draw': []
  'update:drawTool': [tool: DrawToolEnum]
  'update:drawLineWidth': [width: number]
  'clear-drawings': []
}>()

const { t } = useI18n()

const textContent = ref('')
const fontSize = ref(16)
const color = ref('#5c4a6a')

const scoreKeyword = ref('')
const scores = ref<ScoreListItem[]>([])
const selectedScoreId = ref<number | null>(null)
const scoreScale = ref(0.5)
const scoreLoading = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchScores() {
  scoreLoading.value = true
  try {
    scores.value = await searchScoresFromDatabase(scoreKeyword.value)
  } finally {
    scoreLoading.value = false
  }
}

function scheduleScoreSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void fetchScores()
  }, 300)
}

watch(scoreKeyword, scheduleScoreSearch)

onMounted(() => {
  void fetchScores()
})

function onAddText() {
  const text = textContent.value.trim()
  if (!text) return
  emit('addText', {
    text,
    fontSize: Number(fontSize.value) || 16,
    color: color.value || '#5c4a6a'
  })
}

async function onAddScore() {
  if (selectedScoreId.value == null) return
  const record = await loadScoreFromDatabase(selectedScoreId.value)
  if (!record?.data) return
  const musicScore = parseScoreJson(record.data)
  emit('addScore', {
    musicScore,
    scale: Number(scoreScale.value) > 0 ? Number(scoreScale.value) : 0.5
  })
}

function selectTool(tool: DrawToolEnum) {
  emit('update:drawTool', tool)
  if (tool === DrawToolEnum.Pen && props.drawLineWidth === DEFAULT_ERASER_WIDTH) {
    emit('update:drawLineWidth', DEFAULT_PEN_WIDTH)
  }
  if (tool === DrawToolEnum.Eraser && props.drawLineWidth === DEFAULT_PEN_WIDTH) {
    emit('update:drawLineWidth', DEFAULT_ERASER_WIDTH)
  }
}

function onLineWidthChange(value: number | undefined) {
  const w = Number(value)
  if (!Number.isFinite(w) || w <= 0) return
  emit('update:drawLineWidth', w)
}
</script>

<template>
  <aside class="edit-toolbar">
    <h2 class="edit-toolbar__title">{{ t('work.toolbar.title') }}</h2>

    <section class="panel">
      <h3>{{ t('work.toolbar.draw') }}</h3>
      <p class="hint">{{ t('work.toolbar.drawHint') }}</p>
      <button
        type="button"
        class="primary-btn"
        :class="{ 'primary-btn--ghost': drawing }"
        @click="emit('toggle-draw')"
      >
        {{ drawing ? t('work.toolbar.endDraw') : t('work.toolbar.startDraw') }}
      </button>

      <div class="tool-row" :class="{ 'is-disabled': !drawing }">
        <button
          type="button"
          class="tool-chip"
          :class="{ 'is-on': drawTool === DrawToolEnum.Pen }"
          :disabled="!drawing"
          @click="selectTool(DrawToolEnum.Pen)"
        >
          {{ t('work.toolbar.pen') }}
        </button>
        <button
          type="button"
          class="tool-chip"
          :class="{ 'is-on': drawTool === DrawToolEnum.Eraser }"
          :disabled="!drawing"
          @click="selectTool(DrawToolEnum.Eraser)"
        >
          {{ t('work.toolbar.eraser') }}
        </button>
      </div>

      <label class="field field--inline" :class="{ 'is-disabled': !drawing }">
        <span>{{ t('work.toolbar.lineWidth') }}</span>
        <el-input-number
          :model-value="drawLineWidth"
          :min="1"
          :max="80"
          :step="1"
          :disabled="!drawing"
          controls-position="right"
          @update:model-value="onLineWidthChange"
        />
      </label>

      <button
        type="button"
        class="ghost-btn"
        :disabled="!drawing"
        @click="emit('clear-drawings')"
      >
        {{ t('work.toolbar.clearDrawings') }}
      </button>
    </section>

    <section class="panel">
      <h3>{{ t('work.toolbar.assets') }}</h3>
      <p class="hint">{{ t('work.toolbar.assetsHint') }}</p>
      <button type="button" class="primary-btn" @click="emit('openAssets')">
        {{ t('work.toolbar.openAssets') }}
      </button>
    </section>

    <section class="panel">
      <h3>{{ t('work.toolbar.text') }}</h3>
      <label class="field">
        <span>{{ t('work.toolbar.textContent') }}</span>
        <el-input
          v-model="textContent"
          type="textarea"
          :rows="2"
          :placeholder="t('work.toolbar.textPlaceholder')"
        />
      </label>
      <label class="field field--inline">
        <span>{{ t('work.toolbar.fontSize') }}</span>
        <el-input-number v-model="fontSize" :min="8" :max="200" controls-position="right" />
      </label>
      <label class="field field--inline">
        <span>{{ t('work.toolbar.color') }}</span>
        <el-color-picker v-model="color" />
      </label>
      <button type="button" class="primary-btn" :disabled="!textContent.trim()" @click="onAddText">
        {{ t('work.toolbar.addText') }}
      </button>
    </section>

    <section class="panel">
      <h3>{{ t('work.toolbar.score') }}</h3>
      <el-input
        v-model="scoreKeyword"
        clearable
        :placeholder="t('work.toolbar.scoreSearch')"
        :prefix-icon="Search"
      />
      <div v-loading="scoreLoading" class="score-list">
        <p v-if="!scoreLoading && !scores.length" class="hint">{{ t('work.toolbar.noScores') }}</p>
        <button
          v-for="score in scores"
          :key="score.id"
          type="button"
          class="score-item"
          :class="{ 'is-on': selectedScoreId === score.id }"
          @click="selectedScoreId = score.id"
        >
          {{ displayScoreName(score.name) }}
        </button>
      </div>
      <label class="field field--inline">
        <span>{{ t('work.toolbar.scoreScale') }}</span>
        <el-input-number
          v-model="scoreScale"
          :min="0.1"
          :max="2"
          :step="0.1"
          controls-position="right"
        />
      </label>
      <button
        type="button"
        class="primary-btn"
        :disabled="selectedScoreId == null"
        @click="onAddScore"
      >
        {{ t('work.toolbar.addScore') }}
      </button>
    </section>
  </aside>
</template>

<style scoped>
.edit-toolbar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 12px;
  overflow: auto;
  border-left: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.92);
  box-sizing: border-box;
}

.edit-toolbar__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #5c4a6a;
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

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.field--inline {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.field.is-disabled,
.tool-row.is-disabled {
  opacity: 0.55;
}

.tool-row {
  display: flex;
  gap: 8px;
}

.tool-chip {
  flex: 1;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.tool-chip.is-on {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.tool-chip:disabled {
  cursor: not-allowed;
}

.primary-btn,
.ghost-btn {
  min-height: 34px;
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

.primary-btn--ghost {
  border: 1px solid rgba(255, 184, 208, 0.65);
  color: #5c4a6a;
  background: rgba(255, 255, 255, 0.92);
}

.primary-btn:disabled,
.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ghost-btn {
  border: 1px solid rgba(201, 184, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #6a5a88;
}

.score-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 160px;
  overflow: auto;
  min-height: 48px;
}

.score-item {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(255, 248, 251, 0.95);
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.score-item.is-on {
  border-color: #ff8fb8;
}
</style>
