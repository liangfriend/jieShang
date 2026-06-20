<script lang="ts" setup>
import type { Measure, SlotData } from 'deciphony-renderer'
import { BarlineTypeEnum, MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  resolveBarlineLabel,
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
  setMeasureBarlineB,
  setMeasureBarlineF,
  setMeasureClefB,
  setMeasureClefF,
  setMeasureEndRepeat,
  setMeasureKeySignatureB,
  setMeasureKeySignatureF,
  setMeasureStartRepeat,
  setMeasureTimeSignatureB,
  setMeasureTimeSignatureF,
  START_REPEAT_VALUES,
  TIME_SIGNATURE_VALUES,
  type MeasureEditSlot
} from '../renderEditMeasureProperties'
import { VOLTA_SPAN_OPTIONS, tryAddVoltaFromMeasure, type VoltaSpan } from '../renderEditVoltaAdd'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const measureEditSlot = computed(() => props.editSlot as MeasureEditSlot)
const measure = computed(() => measureEditSlot.value.measure as Measure)
const musicScore = computed(() => measureEditSlot.value.musicScore)
const showClef = computed(
  () => musicScore.value.type !== MusicScoreTypeEnum.NumberNotation,
)

const barlineB = computed({
  get: () => measure.value.barline_b?.type ?? BarlineTypeEnum.Single_barline,
  set: (v) => setMeasureBarlineB(measure.value, v)
})

const barlineF = computed({
  get: () => measure.value.barline_f?.type ?? '',
  set: (v) => setMeasureBarlineF(measure.value, v === '' ? null : v)
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
    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.actions') }}</div>
      <div class="measure-props__row">
        <el-button size="small" @click="onInsertBefore">{{ t('editor.measure.insertBefore') }}</el-button>
        <el-button size="small" @click="onInsertAfter">{{ t('editor.measure.insertAfter') }}</el-button>
      </div>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.barlineBack') }}</div>
      <el-select v-model="barlineB" class="measure-props__select" size="small">
        <el-option
          v-for="value in BARLINE_B_VALUES"
          :key="value"
          :label="resolveBarlineLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.barlineFront') }}</div>
      <el-select
        v-model="barlineF"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in BARLINE_F_VALUES"
          :key="value"
          :label="resolveBarlineLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section v-if="showClef" class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.clefFront') }}</div>
      <el-select
        v-model="clefF"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in CLEF_VALUES"
          :key="value"
          :label="resolveClefLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.keySignatureFront') }}</div>
      <el-select
        v-model="keySignatureF"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in KEY_SIGNATURE_VALUES"
          :key="value"
          :label="resolveKeySignatureLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.timeSignatureFront') }}</div>
      <el-select
        v-model="timeSignatureF"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in TIME_SIGNATURE_VALUES"
          :key="value"
          :label="resolveTimeSignatureLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section v-if="showClef" class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.clefBack') }}</div>
      <el-select
        v-model="clefB"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in CLEF_VALUES"
          :key="value"
          :label="resolveClefLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.keySignatureBack') }}</div>
      <el-select
        v-model="keySignatureB"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in KEY_SIGNATURE_VALUES"
          :key="value"
          :label="resolveKeySignatureLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.timeSignatureBack') }}</div>
      <el-select
        v-model="timeSignatureB"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in TIME_SIGNATURE_VALUES"
          :key="value"
          :label="resolveTimeSignatureLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.startRepeat') }}</div>
      <el-select
        v-model="startRepeat"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in START_REPEAT_VALUES"
          :key="value"
          :label="resolveStartRepeatLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.endRepeat') }}</div>
      <el-select
        v-model="endRepeat"
        class="measure-props__select"
        clearable
        :placeholder="t('common.none')"
        size="small"
      >
        <el-option
          v-for="value in END_REPEAT_VALUES"
          :key="value"
          :label="resolveEndRepeatLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="measure-props__section">
      <div class="measure-props__label">{{ t('editor.measure.volta') }}</div>
      <template v-if="voltaAtMeasure">
        <el-button
          class="measure-props__btn-block"
          size="small"
          type="danger"
          @click="onRemoveVolta"
        >
          {{ t('editor.measure.removeVolta') }}
        </el-button>
      </template>
      <div v-else class="measure-props__row">
        <el-button
          v-for="span in VOLTA_SPAN_OPTIONS"
          :key="span"
          size="small"
          @click="onAddVolta(span)"
        >
          {{ span }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.measure-props__section {
  margin-bottom: 14px;
}

.measure-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.measure-props__row {
  display: flex;
  gap: 8px;
}

.measure-props__select {
  width: 100%;
}

.measure-props__input {
  margin-bottom: 6px;
}

.measure-props__btn-block {
  width: 100%;
}
</style>
