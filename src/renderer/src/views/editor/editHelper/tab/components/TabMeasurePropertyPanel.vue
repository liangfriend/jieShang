<script lang="ts" setup>
import type { Measure, SlotData } from '@deciphony/renderer'
import { BarlineTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  resolveBarlineLabel,
  resolveBracketTypeLabel,
  resolveClefLabel,
  resolveTimeSignatureLabel
} from '@renderer/i18n/helpers'
import {
  BARLINE_B_VALUES,
  setMeasureClefF,
  setMeasureTimeSignatureF,
  setSlotBarlineB,
  TAB_CLEF_VALUES,
  TIME_SIGNATURE_VALUES,
  type MeasureEditSlot
} from '../../renderEditMeasureProperties'
import {
  BRACKET_TYPE_SELECT_VALUES,
  setGrandStaffBracketType
} from '../../renderEditBracketProperties'
import type { BracketTypeEnum, MusicScore } from '@deciphony/renderer'
import CustomSymbolSection from '../../components/customSymbol/CustomSymbolSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()
const measure = computed(() => props.editSlot.measure as Measure)
const musicScore = computed(() => props.editSlot.musicScore as MusicScore)
const grandStaff = computed(() => props.editSlot.grandStaff)
const showBracket = computed(() => Boolean(grandStaff.value))

const barlineB = computed({
  get: (): BarlineTypeEnum | '' => measure.value.barline_b?.type ?? '',
  set: (v: BarlineTypeEnum | '' | null | undefined) =>
    setSlotBarlineB(props.editSlot as MeasureEditSlot, v ? v : null)
})

const clefF = computed({
  get: () => measure.value.clef_f?.type ?? '',
  set: (v) => setMeasureClefF(measure.value, v === '' ? null : v)
})

const timeSignatureF = computed({
  get: () => measure.value.timeSignature_f?.type ?? '',
  set: (v) => setMeasureTimeSignatureF(measure.value, v === '' ? null : v)
})

const bracketType = computed({
  get: (): BracketTypeEnum | '' => grandStaff.value?.bracket?.type ?? '',
  set: (v: BracketTypeEnum | '' | null | undefined) => {
    const gs = grandStaff.value
    if (!gs) return
    setGrandStaffBracketType(gs, v ?? '')
  }
})
</script>

<template>
  <div class="tab-measure-props">
    <section v-if="showBracket" class="tab-measure-props__section">
      <div class="tab-measure-props__label">{{ t('editor.bracket.type') }}</div>
      <el-select
        v-model="bracketType"
        class="tab-measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in BRACKET_TYPE_SELECT_VALUES"
          :key="value || 'none'"
          :label="resolveBracketTypeLabel(value)"
          :value="value"
        />
      </el-select>
    </section>
    <section class="tab-measure-props__section">
      <div class="tab-measure-props__label">{{ t('editor.measure.barlineBack') }}</div>
      <el-select
        v-model="barlineB"
        class="tab-measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in BARLINE_B_VALUES"
          :key="value"
          :label="resolveBarlineLabel(value)"
          :value="value"
        />
      </el-select>    </section>
    <section class="tab-measure-props__section">
      <div class="tab-measure-props__label">{{ t('editor.measure.clefFront') }}</div>
      <el-select
        v-model="clefF"
        class="tab-measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in TAB_CLEF_VALUES"
          :key="value"
          :label="resolveClefLabel(value)"
          :value="value"
        />
      </el-select>
    </section>
    <section class="tab-measure-props__section">
      <div class="tab-measure-props__label">{{ t('editor.measure.timeSignatureFront') }}</div>
      <el-select v-model="timeSignatureF" class="tab-measure-props__select" size="small">
        <el-option :label="t('common.none')" value="" />
        <el-option
          v-for="value in TIME_SIGNATURE_VALUES"
          :key="value"
          :label="resolveTimeSignatureLabel(value)"
          :value="value"
        />
      </el-select>
    </section>
    <CustomSymbolSection v-if="measure" kind="measure" :host="measure" :music-score="musicScore" />
  </div>
</template>

<style scoped>
.tab-measure-props__section {
  margin-bottom: 14px;
}

.tab-measure-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.tab-measure-props__select {
  width: 100%;
}</style>
