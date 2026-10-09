<script lang="ts" setup>
import { BracketTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { resolveBracketTypeLabel } from '@renderer/i18n/helpers'
import {
  applyBracketToAllGrandStaves,
  BRACKET_TYPE_SELECT_VALUES,
  setGrandStaffBracketType,
  type BracketEditSlot
} from '../renderEditBracketProperties'

const props = defineProps<{
  editSlot: BracketEditSlot
}>()

const { t } = useI18n()

const grandStaff = computed(() => props.editSlot.grandStaff)

const bracketType = computed({
  get: (): BracketTypeEnum | '' => grandStaff.value.bracket?.type ?? '',
  set: (v: BracketTypeEnum | '' | null | undefined) =>
    setGrandStaffBracketType(grandStaff.value, v ?? '')
})

function onApplyToAll() {
  applyBracketToAllGrandStaves(props.editSlot.musicScore, grandStaff.value.bracket)
  ElMessage.success(t('editor.bracket.appliedToAll'))
}
</script>

<template>
  <div class="bracket-props">
    <section class="bracket-props__section">
      <div class="bracket-props__label">{{ t('editor.bracket.type') }}</div>
      <el-select
        v-model="bracketType"
        class="bracket-props__select"
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
      <el-button class="bracket-props__apply-all" size="small" @click="onApplyToAll">
        {{ t('editor.bracket.applyToAll') }}
      </el-button>
    </section>
  </div>
</template>

<style scoped>
.bracket-props__section {
  margin-bottom: 14px;
}

.bracket-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.bracket-props__select {
  width: 100%;
}

.bracket-props__apply-all {
  width: 100%;
  margin-top: 6px;
}
</style>
