<script lang="ts" setup>
import type { MusicScore } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCustomSymbolStore } from '@renderer/store/customSymbol.store'
import type { CustomSymbolRecord } from '@renderer/types/customSymbol'
import {
  hostHasCustomSymbol,
  refreshCustomSymbolInScore,
  toggleCustomSymbol,
  type CustomSymbolHost,
  type CustomSymbolHostKind
} from '../../renderEditCustomSymbols'
import PanelGroup from '../panel/PanelGroup.vue'
import CustomSymbolEditDialog from './CustomSymbolEditDialog.vue'
import CustomSymbolGlyph from './CustomSymbolGlyph.vue'
import CustomSymbolManagerDialog from './CustomSymbolManagerDialog.vue'

const props = defineProps<{
  kind: CustomSymbolHostKind
  /** 音符 / 休止符 / 小节：符号挂到它的 affiliatedSymbols */
  host: CustomSymbolHost
  musicScore: MusicScore
}>()

const { t } = useI18n()
const store = useCustomSymbolStore()

const createVisible = ref(false)
const managerVisible = ref(false)

const symbols = computed(() => store.listByKind(props.kind))

onMounted(() => {
  void store.ensureLoaded().catch((err) => ElMessage.error(err instanceof Error ? err.message : String(err)))
})

function onToggle(record: CustomSymbolRecord) {
  toggleCustomSymbol(props.musicScore, props.host, record)
}

function onUpdated(record: CustomSymbolRecord) {
  refreshCustomSymbolInScore(props.musicScore, record)
}
</script>

<template>
  <PanelGroup :title="t('editor.customSymbol.title')">
    <template #extra>
      <button
        type="button"
        class="custom-symbol-section__tool"
        :title="t('editor.customSymbol.manage')"
        @click="managerVisible = true"
      >
        {{ t('editor.customSymbol.manage') }}
      </button>
      <button
        type="button"
        class="custom-symbol-section__tool custom-symbol-section__tool--add"
        :title="t('editor.customSymbol.add')"
        @click="createVisible = true"
      >
        +
      </button>
    </template>
    <div v-if="symbols.length" class="custom-symbol-section__grid">
      <button
        v-for="item in symbols"
        :key="item.id"
        type="button"
        class="custom-symbol-section__item"
        :class="{ 'is-active': hostHasCustomSymbol(host, item.skinKey) }"
        :title="item.name"
        @click="onToggle(item)"
      >
        <CustomSymbolGlyph :content="item.data.content" :w="item.data.w" :h="item.data.h" :size="22" />
      </button>
    </div>
    <p class="custom-symbol-section__hint">
      {{ symbols.length ? t('editor.customSymbol.hint') : t('editor.customSymbol.empty') }}
    </p>

    <CustomSymbolEditDialog v-model="createVisible" :kind="kind" />
    <CustomSymbolManagerDialog v-model="managerVisible" :kind="kind" @updated="onUpdated" />
  </PanelGroup>
</template>

<style scoped>
.custom-symbol-section__tool {
  height: 22px;
  min-width: 22px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  color: #8a6fb0;
  cursor: pointer;
  background: #fff;
  border: 1px solid rgba(201, 184, 255, 0.7);
  border-radius: 6px;
}

.custom-symbol-section__tool:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}

.custom-symbol-section__tool--add {
  font-size: 15px;
}

.custom-symbol-section__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 4px;
}

.custom-symbol-section__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 4px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}

.custom-symbol-section__item:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.custom-symbol-section__item.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

.custom-symbol-section__hint {
  margin: 0 2px;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
