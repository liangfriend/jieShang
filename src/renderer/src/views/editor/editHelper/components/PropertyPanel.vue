<script lang="ts" setup>
import { computed } from 'vue'
import type { SlotData } from 'deciphony-renderer'
import type { PropertyPanelKind } from '../renderEditPropertyPanel'
import NumberHeadPropertyPanel from '../numberNotation/components/NumberHeadPropertyPanel.vue'
import NoteHeadPropertyPanel from '../standardStaff/components/NoteHeadPropertyPanel.vue'
import RestPropertyPanel from '../standardStaff/components/RestPropertyPanel.vue'
import MeasurePropertyPanel from './MeasurePropertyPanel.vue'
import SlurPropertyPanel from './SlurPropertyPanel.vue'
import VoltaPropertyPanel from './VoltaPropertyPanel.vue'

const props = defineProps<{
  kind: PropertyPanelKind
  selected: SlotData | null
}>()

const panelMeta: Record<Exclude<PropertyPanelKind, null>, { title: string }> = {
  measure: { title: '小节属性' },
  noteHead: { title: '音符属性' },
  numberHead: { title: '音符属性' },
  rest: { title: '休止符属性' },
  volta: { title: 'Volta 属性' },
  slur: { title: '连音线属性' }
}

const hasContent = computed(() => {
  if (!props.kind || !props.selected) return false
  if (props.kind === 'measure') {
    return Boolean(props.selected.measure && props.selected.singleStaff)
  }
  if (props.kind === 'noteHead' || props.kind === 'numberHead') {
    return Boolean(props.selected.info && props.selected.note && props.selected.measure)
  }
  if (props.kind === 'rest') {
    return Boolean(props.selected.measure && props.selected.self)
  }
  return props.kind === 'volta' || props.kind === 'slur'
})

const headerTitle = computed(() => {
  if (props.kind && hasContent.value) {
    return panelMeta[props.kind].title
  }
  return '属性'
})
</script>

<template>
  <aside class="property-panel">
    <header class="property-panel__header">
      <h3 class="property-panel__title">{{ headerTitle }}</h3>
    </header>
    <div class="property-panel__body">
      <MeasurePropertyPanel
        v-if="kind === 'measure' && selected?.measure && selected.singleStaff"
        :edit-slot="selected"
      />
      <NoteHeadPropertyPanel
        v-else-if="kind === 'noteHead' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected as any"
      />
      <NumberHeadPropertyPanel
        v-else-if="kind === 'numberHead' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected as any"
      />
      <RestPropertyPanel
        v-else-if="kind === 'rest' && selected?.measure && selected.self"
        :edit-slot="selected as any"
      />
      <VoltaPropertyPanel v-else-if="kind === 'volta' && selected" :edit-slot="selected as any" />
      <SlurPropertyPanel v-else-if="kind === 'slur' && selected" :edit-slot="selected as any" />
      <div v-else class="property-panel__placeholder">
        <span class="property-panel__placeholder-emoji">🎼</span>
        <p class="property-panel__placeholder-text">
          选中曲谱中的小节、音符、休止符、连音线或 Volta，这里会显示可编辑属性
        </p>
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
  padding: 14px 16px 12px;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(201, 184, 255, 0.35);
  backdrop-filter: blur(6px);
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
