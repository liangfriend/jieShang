<script lang="ts" setup>
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {MusicScore, SlotData} from '@deciphony/renderer'
import {PitchTypeEnum} from '@deciphony/renderer'
import {
  getPitchType,
  PITCH_TYPE_OPTIONS,
  resolvePitchSymbol,
  setPitchType,
} from '../renderEditPitchProperties'
import SpanResizeSection from './SpanResizeSection.vue'
import EndpointOffsetSection from './EndpointOffsetSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const {t} = useI18n()

const pitch = computed(() => resolvePitchSymbol(props.editSlot))

const pitchType = computed({
  get: () => (pitch.value ? getPitchType(pitch.value) : PitchTypeEnum['8va']),
  set: (value: PitchTypeEnum) => {
    if (!pitch.value) return
    setPitchType(pitch.value, value)
  },
})
</script>

<template>
  <div v-if="pitch" class="pitch-props">
    <section class="pitch-props__section">
      <div class="pitch-props__label">{{ t('editor.pitch.type') }}</div>
      <el-radio-group v-model="pitchType" class="pitch-props__radio" size="small">
        <el-radio-button
          v-for="opt in PITCH_TYPE_OPTIONS"
          :key="opt"
          :label="opt"
        >
          {{ opt }}
        </el-radio-button>
      </el-radio-group>
    </section>
    <SpanResizeSection :music-score="editSlot.musicScore as MusicScore" :symbol="pitch" />
    <EndpointOffsetSection :symbol="pitch" />
  </div>
</template>

<style scoped>
.pitch-props__section {
  margin-bottom: 14px;
}

.pitch-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.pitch-props__radio {
  display: flex;
  flex-wrap: wrap;
}
</style>
