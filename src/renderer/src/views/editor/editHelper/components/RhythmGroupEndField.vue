<script lang="ts" setup>
import type { Measure, MeasureNoteSlot } from '@deciphony/renderer'
import { getMeasureSlots } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RHYTHM_GROUP_END_KEY, isRhythmGroupEnd, setRhythmGroupEnd } from '../renderEditRhythmPattern'
import PanelField from './panel/PanelField.vue'

defineOptions({ name: 'RhythmGroupEndField' })

const props = defineProps<{
  measure: Measure | null | undefined
  /** 槽位上的音符 / 休止符本体（slot.symbol） */
  symbol: { id: string } | null | undefined
}>()

const { t } = useI18n()

const slot = computed<MeasureNoteSlot | null>(() => {
  const { measure, symbol } = props
  if (!measure || !symbol) return null
  return getMeasureSlots(measure).find((s) => s.symbol === symbol || s.symbol.id === symbol.id) ?? null
})

/** 只在按拍音值组合打过标记的槽位上出现；手动关掉后仍保留开关，便于再打开 */
const visible = computed(() => {
  const data = slot.value?.data as Record<string, unknown> | null | undefined
  return data != null && typeof data[RHYTHM_GROUP_END_KEY] === 'boolean'
})

const value = computed({
  get: () => (slot.value ? isRhythmGroupEnd(slot.value) : false),
  set: (v: boolean) => {
    if (slot.value) setRhythmGroupEnd(slot.value, v)
  }
})
</script>

<template>
  <PanelField v-if="visible" :label="t('editor.note.rhythmGroupEnd')">
    <el-switch v-model="value" size="small" />
  </PanelField>
</template>
