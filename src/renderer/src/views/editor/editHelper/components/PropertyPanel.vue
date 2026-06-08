<script lang="ts" setup>
import { computed } from 'vue'
import type { SlotData } from 'deciphony-renderer'
import type { PropertyPanelKind } from '../renderEditPropertyPanel'
import MeasurePropertyPanel from './MeasurePropertyPanel.vue'
import NoteHeadPropertyPanel from './NoteHeadPropertyPanel.vue'
import VoltaPropertyPanel from './VoltaPropertyPanel.vue'

const props = defineProps<{
  kind: PropertyPanelKind
  selected: SlotData | null
}>()

const panelMeta: Record<Exclude<PropertyPanelKind, null>, { title: string; emoji: string }> = {
  measure: { title: '小节属性', emoji: '📏' },
  noteHead: { title: '音符属性', emoji: '♩' },
  volta: { title: 'Volta 属性', emoji: '↺' }
}

const hasContent = computed(() => {
  if (!props.kind || !props.selected) return false
  if (props.kind === 'measure') {
    return Boolean(props.selected.measure && props.selected.singleStaff)
  }
  if (props.kind === 'noteHead') {
    return Boolean(props.selected.info && props.selected.note && props.selected.measure)
  }
  return props.kind === 'volta'
})

const headerMeta = computed(() => {
  if (props.kind && hasContent.value) {
    return panelMeta[props.kind]
  }
  return { title: '属性', emoji: '✨' }
})
</script>

<template>
  <aside class="property-panel">
    <header class="property-panel__header">
      <span class="property-panel__emoji">{{ headerMeta.emoji }}</span>
      <h3 class="property-panel__title">{{ headerMeta.title }}</h3>
    </header>
    <div class="property-panel__body">
      <MeasurePropertyPanel
        v-if="kind === 'measure' && selected?.measure && selected.singleStaff"
        :edit-slot="selected"
      />
      <NoteHeadPropertyPanel
        v-else-if="
          kind === 'noteHead' && selected?.info && selected.note && selected.measure
        "
        :edit-slot="selected"
      />
      <VoltaPropertyPanel v-else-if="kind === 'volta' && selected" :edit-slot="selected" />
      <div v-else class="property-panel__placeholder">
        <span class="property-panel__placeholder-emoji">🎼</span>
        <p class="property-panel__placeholder-text">选中曲谱中的小节、音符或 Volta，这里会显示可编辑属性</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.property-panel {
  flex: 0 0 288px;
  width: 288px;
  min-height: 0;
  overflow: auto;
  background: linear-gradient(180deg, rgba(255, 248, 251, 0.96) 0%, rgba(243, 235, 255, 0.94) 100%);
  border-left: 2px solid rgba(255, 184, 208, 0.35);
}

.property-panel__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 12px;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(201, 184, 255, 0.35);
  backdrop-filter: blur(6px);
}

.property-panel__emoji {
  font-size: 18px;
}

.property-panel__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--ec-text, #5c4a6a);
  letter-spacing: 0.04em;
}

.property-panel__body {
  padding: 10px 12px 20px;
}

.property-panel__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  padding: 24px 16px;
  text-align: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed rgba(201, 184, 255, 0.55);
}

.property-panel__placeholder-emoji {
  font-size: 32px;
  line-height: 1;
}

.property-panel__placeholder-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ec-text-soft, #9a8aa8);
}
</style>
