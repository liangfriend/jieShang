<script lang="ts" setup>
import type { MusicScore, SlotData } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  findPreludeBracketSymbol,
  isPreludeBracketLeft,
  isPreludeBracketSelected
} from '../renderEditPreludeBracket'
import { removeSlotAffiliatedSymbol } from '../renderEditSlotAffiliated'
import PanelGroup from './panel/PanelGroup.vue'

/** 单 slot 前奏括号（左 / 右）；位置由渲染规则决定，属性栏仅删除 */
const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const symbol = computed(() =>
  isPreludeBracketSelected(props.editSlot)
    ? findPreludeBracketSymbol(musicScore.value, props.editSlot.self.id)
    : null
)

const label = computed(() => {
  if (!symbol.value) return ''
  return isPreludeBracketLeft(symbol.value)
    ? t('editor.note.preludeBracketLeft')
    : t('editor.note.preludeBracketRight')
})

function onRemove() {
  if (symbol.value) removeSlotAffiliatedSymbol(musicScore.value, symbol.value.id)
}
</script>

<template>
  <div v-if="symbol" class="prelude-bracket-props">
    <PanelGroup :title="label">
      <p class="prelude-bracket-props__hint">{{ t('editor.preludeBracket.hint') }}</p>
      <el-button size="small" type="danger" plain @click="onRemove">
        {{ t('common.delete') }}
      </el-button>
    </PanelGroup>
  </div>
</template>

<style scoped>
.prelude-bracket-props__hint {
  margin: 0 0 10px;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
