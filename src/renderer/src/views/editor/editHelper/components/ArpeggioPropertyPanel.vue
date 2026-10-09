<script lang="ts" setup>
import { ArpeggioTypeEnum, type MusicScore, type SlotData } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { findArpeggioSymbol, isArpeggioSelected } from '../renderEditArpeggioDrag'
import { findStrummingSymbol, isStrummingSelected } from '../renderEditStrummingDrag'
import { removeSlotAffiliatedSymbol } from '../renderEditSlotAffiliated'
import {
  getArpeggioType,
  getSlotAffiliatedArrow,
  hasSlotAffiliatedOffset,
  resetSlotAffiliatedGeometry,
  setArpeggioType,
  setSlotAffiliatedArrow
} from '../renderEditSlotAffiliatedProperties'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import PanelSegmented from './panel/PanelSegmented.vue'
import EndpointOffsetSection from './EndpointOffsetSection.vue'

/** 单 slot 附属：琶音（造型 + 箭头）/ 扫弦（箭头） */
const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const arpeggio = computed(() =>
  isArpeggioSelected(props.editSlot)
    ? findArpeggioSymbol(musicScore.value, props.editSlot.self.id)
    : null
)
const symbol = computed(() => {
  if (arpeggio.value) return arpeggio.value
  return isStrummingSelected(props.editSlot)
    ? findStrummingSymbol(musicScore.value, props.editSlot.self.id)
    : null
})

const typeOptions = computed(() => [
  { value: ArpeggioTypeEnum.Normal, label: t('editor.arpeggio.typeNormal') },
  { value: ArpeggioTypeEnum.Staright, label: t('editor.arpeggio.typeStraight') }
])

const arpeggioType = computed({
  get: () => (arpeggio.value ? getArpeggioType(arpeggio.value) : ArpeggioTypeEnum.Normal),
  set: (value: ArpeggioTypeEnum) => {
    if (arpeggio.value) setArpeggioType(arpeggio.value, value)
  }
})

const arrow = computed({
  get: () => (symbol.value ? getSlotAffiliatedArrow(symbol.value) : true),
  set: (value: boolean) => {
    if (symbol.value) setSlotAffiliatedArrow(symbol.value, value)
  }
})

const hasOffset = computed(() =>
  symbol.value ? hasSlotAffiliatedOffset(musicScore.value, symbol.value) : false
)

function onReset() {
  if (symbol.value) resetSlotAffiliatedGeometry(musicScore.value, symbol.value)
}

function onRemove() {
  if (symbol.value) removeSlotAffiliatedSymbol(musicScore.value, symbol.value.id)
}
</script>

<template>
  <div v-if="symbol" class="arpeggio-props">
    <PanelGroup :title="t('editor.arpeggio.style')">
      <PanelField v-if="arpeggio" :label="t('editor.arpeggio.type')">
        <PanelSegmented v-model="arpeggioType" :options="typeOptions" />
      </PanelField>
      <PanelField :label="t('editor.arpeggio.arrow')">
        <el-switch v-model="arrow" size="small" />
      </PanelField>
    </PanelGroup>

    <EndpointOffsetSection class="arpeggio-props__offset" :symbol="symbol" />

    <div class="arpeggio-props__actions">
      <el-button size="small" :disabled="!hasOffset" @click="onReset">
        {{ t('editor.arpeggio.resetPosition') }}
      </el-button>
      <el-button size="small" type="danger" plain @click="onRemove">
        {{ t('common.delete') }}
      </el-button>
    </div>
    <p class="arpeggio-props__hint">{{ t('editor.arpeggio.dragHint') }}</p>
  </div>
</template>

<style scoped>
.arpeggio-props__offset {
  margin-top: 10px;
  margin-bottom: 10px;
}

.arpeggio-props__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.arpeggio-props__actions :deep(.el-button) {
  margin: 0;
  width: 100%;
}

.arpeggio-props__hint {
  margin: 8px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
