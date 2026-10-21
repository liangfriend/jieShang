<script lang="ts" setup>
import type { Measure, SlotData } from '@deciphony/renderer'
import { BarlineTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  resolveBarlineLabel,
  resolveBracketTypeLabel,
  resolveClefLabel,
  resolveEndRepeatLabel,
  resolveKeySignatureLabel,
  resolveStartRepeatLabel,
  resolveTimeSignatureLabel
} from '@renderer/i18n/helpers'
import {
  BARLINE_B_VALUES,
  BARLINE_F_VALUES,
  CLEF_VALUES,
  END_REPEAT_VALUES,
  findVoltaAtMeasure,
  formatVoltaValue,
  insertMeasureAfter,
  insertMeasureBefore,
  KEY_SIGNATURE_VALUES,
  removeVolta,
  setMeasureClefB,
  setMeasureClefF,
  setMeasureEndRepeat,
  setMeasureKeySignatureB,
  setMeasureKeySignatureF,
  setMeasureStartRepeat,
  setMeasureTimeSignatureB,
  setMeasureTimeSignatureF,
  setSlotBarlineB,
  setSlotBarlineF,
  START_REPEAT_VALUES,
  TIME_SIGNATURE_VALUES,
  type MeasureEditSlot
} from '../renderEditMeasureProperties'
import { VOLTA_SPAN_OPTIONS, tryAddVoltaFromMeasure, type VoltaSpan } from '../renderEditVoltaAdd'
import {
  BRACKET_TYPE_SELECT_VALUES,
  setGrandStaffBracketType
} from '../renderEditBracketProperties'
import type { BracketTypeEnum } from '@deciphony/renderer'

import { isTabNotationType } from '@renderer/utils/isTabNotation'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import CustomSymbolSection from './customSymbol/CustomSymbolSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const measureEditSlot = computed(() => props.editSlot as MeasureEditSlot)
const measure = computed(() => measureEditSlot.value.measure as Measure)
const musicScore = computed(() => measureEditSlot.value.musicScore)
const isNumberNotation = computed(
  () => musicScore.value.type === MusicScoreTypeEnum.NumberNotation
)
const isTabNotation = computed(() => isTabNotationType(musicScore.value.type))
const isDrumNotation = computed(
  () => musicScore.value.type === MusicScoreTypeEnum.DrumNotation
)
/** 鼓谱仍可编辑打击乐谱号；简谱 / Tab 不编辑谱号 */
const showClef = computed(() => !isNumberNotation.value && !isTabNotation.value)
/** 简谱 / Tab / 鼓谱小节不编辑调号；拍号只编辑小节自身的 timeSignature_f */
const showMeasureKey = computed(
  () => !isNumberNotation.value && !isTabNotation.value && !isDrumNotation.value
)
const showMeasureBackKeyTime = computed(
  () => !isNumberNotation.value && !isTabNotation.value && !isDrumNotation.value
)

const barlineB = computed({
  get: (): BarlineTypeEnum | '' => measure.value.barline_b?.type ?? '',
  set: (v: BarlineTypeEnum | '' | null | undefined) =>
    setSlotBarlineB(measureEditSlot.value, v ? v : null)
})

const barlineF = computed({
  get: (): BarlineTypeEnum | '' => measure.value.barline_f?.type ?? '',
  set: (v: BarlineTypeEnum | '' | null | undefined) =>
    setSlotBarlineF(measureEditSlot.value, v ? v : null)
})

const clefF = computed({
  get: () => measure.value.clef_f?.type ?? '',
  set: (v) => setMeasureClefF(measure.value, v === '' ? null : v)
})

const keySignatureF = computed({
  get: () => measure.value.keySignature_f?.type ?? '',
  set: (v) => setMeasureKeySignatureF(measure.value, v === '' ? null : v)
})

const timeSignatureF = computed({
  get: () => measure.value.timeSignature_f?.type ?? '',
  set: (v) => setMeasureTimeSignatureF(measure.value, v === '' ? null : v)
})

const clefB = computed({
  get: () => measure.value.clef_b?.type ?? '',
  set: (v) => setMeasureClefB(measure.value, v === '' ? null : v)
})

const keySignatureB = computed({
  get: () => measure.value.keySignature_b?.type ?? '',
  set: (v) => setMeasureKeySignatureB(measure.value, v === '' ? null : v)
})

const timeSignatureB = computed({
  get: () => measure.value.timeSignature_b?.type ?? '',
  set: (v) => setMeasureTimeSignatureB(measure.value, v === '' ? null : v)
})

const startRepeat = computed({
  get: () => measure.value.startRepeat?.type ?? '',
  set: (v) => setMeasureStartRepeat(measure.value, v === '' ? null : v)
})

const endRepeat = computed({
  get: () => measure.value.endRepeat?.type ?? '',
  set: (v) => setMeasureEndRepeat(measure.value, v === '' ? null : v)
})

const grandStaff = computed(() => measureEditSlot.value.grandStaff)
const showBracket = computed(() => Boolean(grandStaff.value))

const bracketType = computed({
  get: (): BracketTypeEnum | '' => grandStaff.value?.bracket?.type ?? '',
  set: (v: BracketTypeEnum | '' | null | undefined) => {
    const gs = grandStaff.value
    if (!gs) return
    setGrandStaffBracketType(gs, v ?? '')
  }
})

const voltaAtMeasure = computed(() => findVoltaAtMeasure(musicScore.value, measure.value.id))
const voltaText = ref('')
const voltaValueText = ref('')

watch(
  voltaAtMeasure,
  (volta) => {
    voltaText.value = volta?.data?.volta?.text ?? ''
    voltaValueText.value = volta?.data?.volta ? formatVoltaValue(volta.data.volta.value) : ''
  },
  { immediate: true }
)

function onInsertBefore() {
  insertMeasureBefore(measureEditSlot.value)
}

function onInsertAfter() {
  insertMeasureAfter(measureEditSlot.value)
}

function onAddVolta(span: VoltaSpan) {
  if (!tryAddVoltaFromMeasure(measureEditSlot.value, span)) return
  const volta = findVoltaAtMeasure(musicScore.value, measure.value.id)
  if (!volta?.data?.volta) return
  voltaText.value = volta.data.volta.text
  voltaValueText.value = formatVoltaValue(volta.data.volta.value)
}

function onRemoveVolta() {
  const volta = voltaAtMeasure.value
  if (!volta) return
  removeVolta(musicScore.value, volta.id)
  voltaText.value = ''
  voltaValueText.value = ''
}
</script>

<template>
  <div class="measure-props">
    <PanelGroup :title="t('editor.panelGroup.structure')">
      <div class="measure-props__grid">
        <el-button size="small" @click="onInsertBefore">{{ t('editor.measure.insertBefore') }}</el-button>
        <el-button size="small" @click="onInsertAfter">{{ t('editor.measure.insertAfter') }}</el-button>
      </div>
      <PanelField v-if="showBracket" :label="t('editor.bracket.type')">
        <el-select v-model="bracketType" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in BRACKET_TYPE_SELECT_VALUES"
            :key="value || 'none'"
            :label="resolveBracketTypeLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
    </PanelGroup>

    <PanelGroup :title="t('editor.panelGroup.barline')">
      <PanelField :label="t('editor.measure.barlineFront')">
        <el-select v-model="barlineF" clearable :placeholder="t('common.none')" size="small">
          <el-option :label="t('common.none')" value="" />
          <el-option
            v-for="value in BARLINE_F_VALUES"
            :key="value"
            :label="resolveBarlineLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField :label="t('editor.measure.barlineBack')">
        <el-select v-model="barlineB" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in BARLINE_B_VALUES"
            :key="value"
            :label="resolveBarlineLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>    </PanelGroup>

    <PanelGroup :title="t('editor.panelGroup.front')">
      <PanelField v-if="showClef" :label="t('editor.measure.fieldClef')">
        <el-select v-model="clefF" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in CLEF_VALUES"
            :key="value"
            :label="resolveClefLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField v-if="showMeasureKey" :label="t('editor.measure.fieldKeySignature')">
        <el-select v-model="keySignatureF" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in KEY_SIGNATURE_VALUES"
            :key="value"
            :label="resolveKeySignatureLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField :label="t('editor.measure.fieldTimeSignature')">
        <el-select v-model="timeSignatureF" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in TIME_SIGNATURE_VALUES"
            :key="value"
            :label="resolveTimeSignatureLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
    </PanelGroup>

    <PanelGroup v-if="showClef || showMeasureBackKeyTime" :title="t('editor.panelGroup.back')">
      <PanelField v-if="showClef" :label="t('editor.measure.fieldClef')">
        <el-select v-model="clefB" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in CLEF_VALUES"
            :key="value"
            :label="resolveClefLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField v-if="showMeasureBackKeyTime" :label="t('editor.measure.fieldKeySignature')">
        <el-select v-model="keySignatureB" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in KEY_SIGNATURE_VALUES"
            :key="value"
            :label="resolveKeySignatureLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField v-if="showMeasureBackKeyTime" :label="t('editor.measure.fieldTimeSignature')">
        <el-select v-model="timeSignatureB" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in TIME_SIGNATURE_VALUES"
            :key="value"
            :label="resolveTimeSignatureLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
    </PanelGroup>

    <PanelGroup :title="t('editor.panelGroup.repeat')">
      <PanelField :label="t('editor.measure.startRepeat')">
        <el-select v-model="startRepeat" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in START_REPEAT_VALUES"
            :key="value"
            :label="resolveStartRepeatLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField :label="t('editor.measure.endRepeat')">
        <el-select v-model="endRepeat" clearable :placeholder="t('common.none')" size="small">
          <el-option
            v-for="value in END_REPEAT_VALUES"
            :key="value"
            :label="resolveEndRepeatLabel(value)"
            :value="value"
          />
        </el-select>
      </PanelField>
      <PanelField :label="t('editor.measure.volta')" stacked>
        <el-button
          v-if="voltaAtMeasure"
          class="measure-props__btn-block"
          size="small"
          type="danger"
          plain
          @click="onRemoveVolta"
        >
          {{ t('editor.measure.removeVolta') }}
        </el-button>
        <div v-else class="measure-props__grid measure-props__grid--5">
          <el-button
            v-for="span in VOLTA_SPAN_OPTIONS"
            :key="span"
            size="small"
            @click="onAddVolta(span)"
          >
            {{ span }}
          </el-button>
        </div>
      </PanelField>
    </PanelGroup>

    <CustomSymbolSection kind="measure" :host="measure" :music-score="musicScore" />
  </div>
</template>

<style scoped>
.measure-props__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.measure-props__grid--5 {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.measure-props__grid :deep(.el-button + .el-button) {
  margin-left: 0;
}

.measure-props__btn-block {
  width: 100%;
}
</style>
