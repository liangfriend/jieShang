<script lang="ts" setup>
import type { MusicScore, SlotData } from '@deciphony/renderer'
import { HairpinTypeEnum, TrillTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { lineKeyOfSymbol } from '../renderEditLineDrag'
import {
  getHairpinHeight,
  getHairpinType,
  getTrillType,
  HAIRPIN_HEIGHT_MAX,
  HAIRPIN_HEIGHT_MIN,
  HAIRPIN_TYPE_OPTIONS,
  isWedgeHairpin,
  resolveLineSymbol,
  setHairpinHeight,
  setHairpinType,
  setTrillType,
  TRILL_TYPE_OPTIONS
} from '../renderEditLineProperties'
import { removeScoreAffiliatedSymbol } from '../renderEditSlotSymbolAdd'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import PanelSegmented from './panel/PanelSegmented.vue'
import SpanResizeSection from './SpanResizeSection.vue'
import EndpointOffsetSection from './EndpointOffsetSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const symbol = computed(() => resolveLineSymbol(props.editSlot))
const kind = computed(() => lineKeyOfSymbol(symbol.value))

const trillOptions = computed(() =>
  TRILL_TYPE_OPTIONS.map((value) => ({
    value,
    label: t(`editor.line.trillTypeOption.${value}`)
  }))
)

const hairpinOptions = computed(() =>
  HAIRPIN_TYPE_OPTIONS.map((value) => ({
    value,
    label: t(`editor.line.hairpinType.${value}`)
  }))
)

const trillType = computed({
  get: () => (symbol.value ? getTrillType(symbol.value) : TrillTypeEnum.Trill),
  set: (value: TrillTypeEnum) => {
    if (symbol.value) setTrillType(symbol.value, value)
  }
})

const hairpinType = computed({
  get: () => (symbol.value ? getHairpinType(symbol.value) : HairpinTypeEnum.Crescendo_hairpin),
  set: (value: HairpinTypeEnum) => {
    if (symbol.value) setHairpinType(symbol.value, value)
  }
})

const hairpinHeight = computed({
  get: () => (symbol.value ? getHairpinHeight(symbol.value) : 0),
  set: (value: number) => {
    if (symbol.value) setHairpinHeight(symbol.value, value)
  }
})

function onRemove() {
  if (!symbol.value) return
  removeScoreAffiliatedSymbol(props.editSlot.musicScore as MusicScore, symbol.value.id)
}
</script>

<template>
  <div v-if="symbol" class="line-props">
    <PanelGroup v-if="kind === 'trill'">
      <PanelField :label="t('editor.line.trillType')" stacked>
        <PanelSegmented v-model="trillType" :options="trillOptions" :columns="2" />
      </PanelField>
    </PanelGroup>

    <PanelGroup v-else>
      <PanelField :label="t('editor.line.hairpinStyle')" stacked>
        <PanelSegmented v-model="hairpinType" :options="hairpinOptions" :columns="2" />
      </PanelField>
      <PanelField v-if="isWedgeHairpin(hairpinType)" :label="t('editor.line.height')" stacked>
        <el-slider
          v-model="hairpinHeight"
          class="line-props__slider"
          :min="HAIRPIN_HEIGHT_MIN"
          :max="HAIRPIN_HEIGHT_MAX"
          :step="1"
          show-tooltip
        />
      </PanelField>
    </PanelGroup>

    <SpanResizeSection :music-score="editSlot.musicScore as MusicScore" :symbol="symbol" />
    <EndpointOffsetSection class="line-props__offset" :symbol="symbol" />

    <el-button class="line-props__delete" size="small" type="danger" plain @click="onRemove">
      {{ t('common.delete') }}
    </el-button>
    <p class="line-props__hint">{{ t('editor.line.dragHint') }}</p>
  </div>
</template>

<style scoped>
.line-props__slider {
  padding: 0 6px;
}

.line-props__delete {
  width: 100%;
}

.line-props__offset {
  margin-bottom: 10px;
}

.line-props__hint {
  margin: 8px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
