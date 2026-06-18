<script lang="ts" setup>
import type {MusicScore} from 'deciphony-renderer'
import {computed} from 'vue'
import {
  DEFAULT_SLUR_THICKNESS,
  getSlurThickness,
  listSlursStartingAtNotesInfo,
  removeSlur,
  setSlurThickness,
  SLUR_SPAN_OPTIONS,
  SLUR_THICKNESS_MAX,
  SLUR_THICKNESS_MIN,
  type SlurSpan,
} from '../renderEditSlurProperties'

const props = defineProps<{
  musicScore: MusicScore
  notesInfoId: string
}>()

const emit = defineEmits<{
  add: [span: SlurSpan]
}>()

const slurs = computed(() => {
  void props.musicScore.affiliatedSymbols.length
  return listSlursStartingAtNotesInfo(props.musicScore, props.notesInfoId)
})

function onAdd(span: SlurSpan) {
  emit('add', span)
}

function onDelete(slurId: string) {
  removeSlur(props.musicScore, slurId)
}

function onThicknessChange(slurId: string, value: number | undefined) {
  const slur = slurs.value.find((item) => item.id === slurId)
  if (!slur) return
  setSlurThickness(slur, value ?? DEFAULT_SLUR_THICKNESS)
}
</script>

<template>
  <section class="note-slur-list">
    <div class="note-slur-list__label">连音线</div>

    <div v-if="slurs.length" class="note-slur-list__items">
      <div v-for="slur in slurs" :key="slur.id" class="note-slur-list__item">
        <el-input-number
          class="note-slur-list__input"
          :model-value="getSlurThickness(slur)"
          :min="SLUR_THICKNESS_MIN"
          :max="SLUR_THICKNESS_MAX"
          :step="1"
          size="small"
          controls-position="right"
          @update:model-value="onThicknessChange(slur.id, $event)"
        />
        <el-button size="small" type="danger" plain @click="onDelete(slur.id)">删除</el-button>
      </div>
    </div>

    <div class="note-slur-list__row">
      <el-button
        v-for="span in SLUR_SPAN_OPTIONS"
        :key="span"
        size="small"
        @click="onAdd(span)"
      >
        {{ span }}
      </el-button>
    </div>
  </section>
</template>

<style scoped>
.note-slur-list {
  margin-bottom: 14px;
}

.note-slur-list__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.note-slur-list__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.note-slur-list__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.note-slur-list__input {
  flex: 1;
}

.note-slur-list__input :deep(.el-input-number) {
  width: 100%;
}

.note-slur-list__row {
  display: flex;
  gap: 8px;
}
</style>
