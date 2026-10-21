<script lang="ts" setup>
import type {DoubleNoteAffiliatedSymbol, SlotData} from '@deciphony/renderer'
import type {SlurTypeEnum} from '@deciphony/renderer'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {setSlurType} from '@deciphony/extensions/dr-edit'
import {TAB_SLUR_TYPE_OPTIONS} from '../renderEditTabAddState'
import SlurPropertyPanel from '../../components/SlurPropertyPanel.vue'

/** TAB 连音线：多一个技巧类型（击弦 / 勾弦 / 滑音 …），其余与五线谱连音线一致 */
const props = defineProps<{
  editSlot: SlotData
}>()

const slur = computed(() => props.editSlot.self as unknown as DoubleNoteAffiliatedSymbol)

const slurType = computed({
  get: () => slur.value.data.slur?.type ?? '',
  set: (value: SlurTypeEnum | '') => {
    setSlurType(slur.value, value === '' ? undefined : value)
  },
})

const {t} = useI18n()
</script>

<template>
  <div>
    <section class="tab-slur-props">
      <div class="tab-slur-props__label">{{ t('editor.tabNote.slurType') }}</div>
      <el-select v-model="slurType" size="small" style="width: 100%">
        <el-option
          v-for="opt in TAB_SLUR_TYPE_OPTIONS"
          :key="opt.value || 'none'"
          :label="t(opt.labelKey)"
          :value="opt.value"
        />
      </el-select>
    </section>
    <SlurPropertyPanel :edit-slot="editSlot" />
  </div>
</template>

<style scoped>
.tab-slur-props {
  margin-bottom: 14px;
}

.tab-slur-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}
</style>
