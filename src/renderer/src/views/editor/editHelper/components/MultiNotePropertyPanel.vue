<script lang="ts" setup>
import type { MusicScore } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  deleteMultiSelected,
  isMultiSelectedRest,
  multiSelectedCanShiftPitch,
  multiSelectedDotCount,
  multiSelectedHasStem,
  multiSelectedStemDirection,
  scaleMultiSelectedChronaxie,
  setMultiSelectedDot,
  setMultiSelectedStemDirection,
  shiftMultiSelectedBySemitones,
  type DotCount,
  type MultiSelectedItem,
  type StemDirection
} from '../renderEditMultiSelect'
import {
  AUGMENTATION_DOT_VALUES,
  STEM_DIRECTION_VALUES
} from '../standardStaff/renderEditNoteHeadProperties'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import PanelSegmented from './panel/PanelSegmented.vue'
import { useNoteSegmentOptions } from './panel/noteOptions'

const props = defineProps<{
  musicScore: MusicScore
  items: MultiSelectedItem[]
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()

const restCount = computed(() => props.items.filter(isMultiSelectedRest).length)
const canShiftPitch = computed(() => multiSelectedCanShiftPitch(props.items))
const noteCount = computed(() => props.items.length - restCount.value)
const summary = computed(() => {
  if (!restCount.value) return t('editor.multiNote.summary', { n: noteCount.value })
  if (!noteCount.value) return t('editor.multiNote.summaryRests', { n: restCount.value })
  return t('editor.multiNote.summaryWithRests', { notes: noteCount.value, rests: restCount.value })
})

const emit = defineEmits<{
  deleted: []
}>()

const lowerBy = ref(1)
const raiseBy = ref(1)

function shift(semitones: number) {
  try {
    if (!shiftMultiSelectedBySemitones(props.musicScore, props.items, semitones)) {
      ElMessage.info(t('editor.multiNote.nothingChanged'))
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.semitoneShiftFailed'))
  }
}

function scale(factor: 2 | 0.5) {
  if (!scaleMultiSelectedChronaxie(props.items, factor)) {
    ElMessage.info(
      t(factor === 2 ? 'editor.multiNote.alreadyLongest' : 'editor.multiNote.alreadyShortest')
    )
  }
}

/** 选中项不一定是响应式代理，写完附点后手动触发重算 */
const dotVersion = ref(0)
const dotCount = computed(() => {
  void dotVersion.value
  return multiSelectedDotCount(props.items)
})

function setDot(count: DotCount) {
  setMultiSelectedDot(props.items, count)
  dotVersion.value++
}

const hasStem = computed(() => multiSelectedHasStem(props.items))
const stemVersion = ref(0)
const stemDirection = computed(() => {
  void stemVersion.value
  return multiSelectedStemDirection(props.items)
})

function setStemDirection(direction: StemDirection) {
  setMultiSelectedStemDirection(props.items, direction)
  stemVersion.value++
}

function onDelete() {
  deleteMultiSelected(props.musicScore, props.items)
  emit('deleted')
}
</script>

<template>
  <div class="multi-note-props">
    <p class="multi-note-props__summary">
      {{ summary }}
    </p>

    <PanelGroup v-if="canShiftPitch" :title="t('editor.multiNote.pitch')">
      <p v-if="restCount" class="multi-note-props__hint">{{ t('editor.multiNote.restsSkipPitch') }}</p>
      <PanelField :label="t('editor.multiNote.lower')">
        <div class="multi-note-props__row">
          <el-input-number v-model="lowerBy" :min="1" :max="48" :step="1" size="small" />
          <el-button size="small" @click="shift(-lowerBy)">{{ t('common.confirm') }}</el-button>
        </div>
      </PanelField>
      <PanelField :label="t('editor.multiNote.raise')">
        <div class="multi-note-props__row">
          <el-input-number v-model="raiseBy" :min="1" :max="48" :step="1" size="small" />
          <el-button size="small" @click="shift(raiseBy)">{{ t('common.confirm') }}</el-button>
        </div>
      </PanelField>
    </PanelGroup>

    <PanelGroup :title="t('editor.multiNote.duration')">
      <div class="multi-note-props__grid">
        <el-button size="small" @click="scale(2)">{{ t('editor.multiNote.double') }}</el-button>
        <el-button size="small" @click="scale(0.5)">{{ t('editor.multiNote.halve') }}</el-button>
      </div>
      <PanelField :label="t('editor.note.augmentationDot')">
        <PanelSegmented
          :model-value="dotCount"
          :options="options.dots(AUGMENTATION_DOT_VALUES)"
          @update:model-value="setDot"
        />
      </PanelField>
    </PanelGroup>

    <PanelGroup v-if="hasStem" :title="t('editor.multiNote.stem')">
      <PanelField :label="t('editor.note.stemDirection')">
        <PanelSegmented
          :model-value="stemDirection"
          :options="options.stems(STEM_DIRECTION_VALUES)"
          @update:model-value="setStemDirection"
        />
      </PanelField>
    </PanelGroup>

    <PanelGroup :title="t('editor.multiNote.actions')">
      <el-button class="multi-note-props__delete" size="small" type="danger" plain @click="onDelete">
        {{ t('editor.multiNote.delete') }}
      </el-button>
    </PanelGroup>
  </div>
</template>

<style scoped>
.multi-note-props {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.multi-note-props__summary {
  margin: 0;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #7c4dff;
  background: rgba(155, 109, 255, 0.1);
  border: 1px solid rgba(155, 109, 255, 0.3);
  border-radius: 10px;
}

.multi-note-props__hint {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.multi-note-props__row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.multi-note-props__row :deep(.el-input-number) {
  flex: 1;
  min-width: 0;
}

.multi-note-props__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.multi-note-props__grid :deep(.el-button + .el-button) {
  margin-left: 0;
}

.multi-note-props__delete {
  width: 100%;
}
</style>
