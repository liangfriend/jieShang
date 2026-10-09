<script lang="ts" setup>
import type { MusicScore, SlotData } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { findPedalSymbol, isPedalSelected } from '../renderEditPedalDrag'
import { removeScoreAffiliatedSymbol } from '../renderEditSlotSymbolAdd'
import SpanResizeSection from './SpanResizeSection.vue'
import EndpointOffsetSection from './EndpointOffsetSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)
const pedal = computed(() =>
  isPedalSelected(props.editSlot) ? findPedalSymbol(musicScore.value, props.editSlot.self.id) : null
)

function onRemove() {
  if (!pedal.value) return
  removeScoreAffiliatedSymbol(musicScore.value, pedal.value.id)
}
</script>

<template>
  <div v-if="pedal" class="pedal-props">
    <SpanResizeSection :music-score="musicScore" :symbol="pedal" />
    <EndpointOffsetSection class="pedal-props__offset" :symbol="pedal" />
    <el-button class="pedal-props__delete" size="small" type="danger" plain @click="onRemove">
      {{ t('common.delete') }}
    </el-button>
  </div>
</template>

<style scoped>
.pedal-props__delete {
  width: 100%;
}

.pedal-props__offset {
  margin-bottom: 10px;
}
</style>
