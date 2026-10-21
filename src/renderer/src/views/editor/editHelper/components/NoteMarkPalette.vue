<script lang="ts" setup>
import type { MusicScore, MusicScoreTypeEnum, SingleNoteAffiliatedSymbolNameEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  hasNoteMark,
  noteMarkGroupsFor,
  noteMarkSkinKey,
  toggleNoteMark,
  type NoteMarkHost
} from '../renderEditNoteMarks'
import NoteMarkGlyph from './NoteMarkGlyph.vue'
import PanelGroup from './panel/PanelGroup.vue'
import CustomSymbolSection from './customSymbol/CustomSymbolSection.vue'

const props = defineProps<{
  host: NoteMarkHost
  notationType?: MusicScoreTypeEnum
  /** 简谱音符：追加古筝指法分组 */
  showGuzheng?: boolean
  /** 传入时追加自定义符号栏目 */
  musicScore?: MusicScore
}>()

const { t } = useI18n()

const groups = computed(() => noteMarkGroupsFor(props.showGuzheng))

function onToggle(name: SingleNoteAffiliatedSymbolNameEnum) {
  toggleNoteMark(props.host, name)
}
</script>

<template>
  <div class="note-mark-palette">
    <PanelGroup
      v-for="group in groups"
      :key="group.category"
      :title="t(`editor.noteMark.category.${group.category}`)"
    >
      <template v-if="group.exclusive" #extra>
        <span class="note-mark-palette__tag">{{ t('editor.noteMark.exclusive') }}</span>
      </template>
      <div class="note-mark-palette__grid">
        <button
          v-for="name in group.names"
          :key="name"
          type="button"
          class="note-mark-palette__item"
          :class="{ 'is-active': hasNoteMark(host, name) }"
          :title="t(`editor.noteMark.name.${name}`)"
          @click="onToggle(name)"
        >
          <NoteMarkGlyph
            :skin-key="noteMarkSkinKey(name)"
            :notation-type="notationType"
            :fallback="name"
          />
        </button>
      </div>
    </PanelGroup>
    <CustomSymbolSection v-if="musicScore" kind="note" :host="host" :music-score="musicScore" />
    <p class="note-mark-palette__hint">{{ t('editor.noteMark.dragHint') }}</p>
  </div>
</template>

<style scoped>
.note-mark-palette__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 4px;
}

.note-mark-palette__item {
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

.note-mark-palette__item:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.note-mark-palette__item.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

.note-mark-palette__tag {
  font-size: 11px;
  color: #a39ab0;
}

.note-mark-palette__hint {
  margin: 2px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
