<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  canExpandVoltaLeft,
  canExpandVoltaRight,
  canShrinkVolta,
  expandVoltaLeft,
  expandVoltaRight,
  getVoltaClosedLeft,
  getVoltaClosedRight,
  resetVoltaHorizontalOffset,
  setVoltaClosedLeft,
  setVoltaClosedRight,
  setVoltaText,
  setVoltaValue,
  shrinkVoltaLeft,
  shrinkVoltaRight,
  type VoltaEditSlot,
} from '../renderEditVoltaProperties'
import {
  voltaValueFromDisplay,
  voltaValueToDisplay,
} from '../renderEditMeasureProperties'
import VoltaValueEditor from './VoltaValueEditor.vue'

const props = defineProps<{
  editSlot: VoltaEditSlot
}>()

const { t } = useI18n()

const volta = computed(() => props.editSlot.self)
const musicScore = computed(() => props.editSlot.musicScore)

const text = computed({
  get: () => volta.value.data.volta?.text ?? '',
  set: (v: string) => setVoltaText(volta.value, v),
})

const value = computed({
  get: () => voltaValueToDisplay(volta.value.data.volta?.value ?? [0]),
  set: (v: number[]) => setVoltaValue(volta.value, voltaValueFromDisplay(v)),
})

/** 依赖 startId/endId，保证扩/缩后按钮禁用态刷新 */
const spanState = computed(() => {
  const v = volta.value
  void v.startId
  void v.endId
  const canShrink = canShrinkVolta(musicScore.value, v)
  return {
    canExpandLeft: canExpandVoltaLeft(musicScore.value, v),
    canExpandRight: canExpandVoltaRight(musicScore.value, v),
    canShrinkLeft: canShrink,
    canShrinkRight: canShrink,
  }
})

const closedLeft = computed({
  get: () => getVoltaClosedLeft(volta.value),
  set: (v: boolean) => setVoltaClosedLeft(volta.value, v),
})

const closedRight = computed({
  get: () => getVoltaClosedRight(volta.value),
  set: (v: boolean) => setVoltaClosedRight(volta.value, v),
})

function onExpandLeft() {
  expandVoltaLeft(musicScore.value, volta.value)
}

function onExpandRight() {
  expandVoltaRight(musicScore.value, volta.value)
}

function onShrinkLeft() {
  shrinkVoltaLeft(musicScore.value, volta.value)
}

function onShrinkRight() {
  shrinkVoltaRight(musicScore.value, volta.value)
}

function onResetAlignment() {
  resetVoltaHorizontalOffset(volta.value)
}

function toggleClosedLeft() {
  closedLeft.value = !closedLeft.value
}

function toggleClosedRight() {
  closedRight.value = !closedRight.value
}
</script>

<template>
  <div class="volta-props">
    <section class="volta-props__section">
      <div class="volta-props__label">{{ t('editor.volta.text') }}</div>
      <el-input v-model="text" :placeholder="t('editor.volta.textPlaceholder')" size="small" />
    </section>

    <section class="volta-props__section">
      <div class="volta-props__label">{{ t('editor.volta.value') }}</div>
      <VoltaValueEditor v-model="value" />
    </section>

    <section class="volta-props__section">
      <div class="volta-props__label">{{ t('editor.volta.span') }}</div>
      <div class="volta-props__row">
        <el-button size="small" :disabled="!spanState.canExpandLeft" @click="onExpandLeft">
          {{ t('editor.volta.expandLeft') }}
        </el-button>
        <el-button size="small" :disabled="!spanState.canExpandRight" @click="onExpandRight">
          {{ t('editor.volta.expandRight') }}
        </el-button>
        <el-button size="small" :disabled="!spanState.canShrinkLeft" @click="onShrinkLeft">
          {{ t('editor.volta.shrinkLeft') }}
        </el-button>
        <el-button size="small" :disabled="!spanState.canShrinkRight" @click="onShrinkRight">
          {{ t('editor.volta.shrinkRight') }}
        </el-button>
        <el-button size="small" @click="onResetAlignment">
          {{ t('editor.volta.resetAlignment') }}
        </el-button>
      </div>
    </section>

    <section class="volta-props__section">
      <div class="volta-props__label">{{ t('editor.volta.closure') }}</div>
      <div class="volta-props__row">
        <el-button
          size="small"
          :type="closedLeft ? 'primary' : 'default'"
          @click="toggleClosedLeft"
        >
          {{ t('editor.volta.closeLeft') }}
        </el-button>
        <el-button
          size="small"
          :type="closedRight ? 'primary' : 'default'"
          @click="toggleClosedRight"
        >
          {{ t('editor.volta.closeRight') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.volta-props__section {
  margin-bottom: 14px;
}

.volta-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.volta-props__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
