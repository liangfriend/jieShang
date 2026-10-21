<script lang="ts" setup>
import type {Bend, SlotData, TabNoteInfo} from '@deciphony/renderer'
import {BendTypeEnum} from '@deciphony/renderer'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {setTabNoteInfoBend} from '@deciphony/extensions/dr-edit'
import {BEND_TYPE_OPTIONS, TAB_SEMITONE_OPTIONS} from '../renderEditTabAddState'
import PanelGroup from '../../components/panel/PanelGroup.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const {t} = useI18n()

const info = computed(() => props.editSlot.info as unknown as TabNoteInfo)
/** 删除后 info.bend 不再是选中的那一个，面板随之收起 */
const bend = computed<Bend | null>(() => {
  const self = props.editSlot.self as unknown as Bend
  const current = 'bend' in info.value ? info.value.bend : undefined
  return current && current.id === self.id ? current : null
})

function writeBend(next: Partial<Pick<Bend, 'type' | 'periodOne' | 'periodTwo'>>) {
  if (!bend.value) return
  setTabNoteInfoBend(info.value, {
    type: next.type ?? bend.value.type,
    periodOne: next.periodOne ?? bend.value.periodOne,
    periodTwo: next.periodTwo ?? bend.value.periodTwo,
  })
}

const bendType = computed({
  get: () => bend.value?.type ?? BendTypeEnum.Bend,
  set: (type: BendTypeEnum) => writeBend({type}),
})

const periodOne = computed({
  get: () => bend.value?.periodOne ?? 0,
  set: (periodOne: number) => writeBend({periodOne}),
})

const periodTwo = computed({
  get: () => bend.value?.periodTwo ?? 0,
  set: (periodTwo: number) => writeBend({periodTwo}),
})

function readOffset(axis: 'relativeX' | 'relativeY') {
  return Math.round((bend.value?.[axis] ?? 0) * 10) / 10
}

function writeOffset(axis: 'relativeX' | 'relativeY', value: number | undefined) {
  if (bend.value) bend.value[axis] = Number.isFinite(value) ? Number(value) : 0
}

const hasOffset = computed(() => (bend.value?.relativeX ?? 0) !== 0 || (bend.value?.relativeY ?? 0) !== 0)

function onReset() {
  if (!bend.value) return
  bend.value.relativeX = 0
  bend.value.relativeY = 0
}

function onRemove() {
  setTabNoteInfoBend(info.value, null)
}
</script>

<template>
  <div v-if="bend" class="bend-props">
    <section class="bend-props__section">
      <div class="bend-props__label">{{ t('editor.tabNote.bendType') }}</div>
      <el-select v-model="bendType" size="small" style="width: 100%">
        <el-option
          v-for="opt in BEND_TYPE_OPTIONS"
          :key="opt.value"
          :label="t(opt.labelKey)"
          :value="opt.value"
        />
      </el-select>
    </section>
    <section class="bend-props__section">
      <div class="bend-props__label">{{ t('editor.tabNote.stageInterval', {n: 1}) }}</div>
      <el-select v-model="periodOne" size="small" style="width: 100%">
        <el-option
          v-for="opt in TAB_SEMITONE_OPTIONS"
          :key="`p1-${opt.value}`"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </section>
    <section class="bend-props__section">
      <div class="bend-props__label">{{ t('editor.tabNote.stageInterval', {n: 2}) }}</div>
      <el-select v-model="periodTwo" size="small" style="width: 100%">
        <el-option
          v-for="opt in TAB_SEMITONE_OPTIONS"
          :key="`p2-${opt.value}`"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </section>

    <PanelGroup :title="t('editor.tabNote.offset')">
      <div class="bend-props__offset-row">
        <span class="bend-props__axis">X</span>
        <el-input-number
          :model-value="readOffset('relativeX')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeX', v)"
        />
        <span class="bend-props__axis">Y</span>
        <el-input-number
          :model-value="readOffset('relativeY')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeY', v)"
        />
      </div>
    </PanelGroup>

    <div class="bend-props__actions">
      <el-button size="small" :disabled="!hasOffset" @click="onReset">
        {{ t('editor.tabNote.resetPosition') }}
      </el-button>
      <el-button size="small" type="danger" plain @click="onRemove">
        {{ t('common.delete') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.bend-props__section {
  margin-bottom: 14px;
}

.bend-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.bend-props__offset-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 4px;
}

.bend-props__offset-row :deep(.el-input-number) {
  width: 100%;
}

.bend-props__axis {
  font-size: 11px;
  font-weight: 700;
  color: #a39ab0;
}

.bend-props__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.bend-props__actions :deep(.el-button) {
  margin: 0;
  width: 100%;
}
</style>
