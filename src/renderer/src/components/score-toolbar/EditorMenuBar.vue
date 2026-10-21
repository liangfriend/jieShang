<script setup lang="ts">
import type { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SCORE_NOTATION_TYPE_OPTIONS, resolveScoreNotationTypeLabel } from '@renderer/constant/scoreNotationType'
import { resolveKeySignatureLabel } from '@renderer/i18n/helpers'
import { SCORE_KEY_SIGNATURE_OPTIONS } from '@renderer/utils/scoreNotationTransfer'
import {
  SLUR_STYLE_PREFERENCE_VALUES,
  type SlurStylePreference
} from '@renderer/views/editor/editHelper/renderEditSlurProperties'
import type { RhythmPatternMode } from '@renderer/views/editor/editHelper/renderEditRhythmPattern'

defineOptions({ name: 'EditorMenuBar' })

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    structureEditEnabled: boolean
    lyricsEditEnabled: boolean
    standardModeEnabled: boolean
    linkedStaffMode: boolean
    showInstrumentName: boolean
    hideInstrumentName?: boolean
    rhythmPatternMode: RhythmPatternMode
    slurStyle: SlurStylePreference
    notationType: MusicScoreTypeEnum
    currentKey: KeySignatureTypeEnum
    hideNotationTools?: boolean
    showQuickInput?: boolean
    showPianoRecord?: boolean
    showLegalNotes?: boolean
  }>(),
  {
    disabled: false,
    hideInstrumentName: false,
    hideNotationTools: false,
    showQuickInput: false,
    showPianoRecord: false,
    showLegalNotes: false
  }
)

export type EditorMenuImportCommand = 'sj' | 'musicXml' | 'midi' | 'scoreImage'
export type EditorMenuExportCommand = 'sj' | 'musicXmlMs4' | 'musicXmlMs3' | 'midi' | 'work'

const emit = defineEmits<{
  save: []
  import: [command: EditorMenuImportCommand]
  export: [command: EditorMenuExportCommand]
  notice: []
  layout: []
  'toggle-structure': []
  'toggle-lyrics': []
  'toggle-standard-mode': []
  'toggle-linked-staff': []
  'toggle-instrument-name': []
  'lyrics-match': []
  'quick-input': []
  'piano-record': []
  'legal-notes': []
  'set-rhythm-mode': [mode: RhythmPatternMode]
  'set-slur-style': [style: SlurStylePreference]
  'set-notation-type': [type: MusicScoreTypeEnum]
  transpose: [payload: { toKey: KeySignatureTypeEnum }]
  'semitone-shift': [semitones: 1 | -1]
}>()

type MenuId = 'file' | 'edit' | 'view' | 'score' | 'help' | null
type FlyoutId = 'import' | 'export' | 'notation' | 'transpose' | 'rhythm' | 'slur' | null

const openMenu = ref<MenuId>(null)
const openFlyout = ref<FlyoutId>(null)
const rootRef = ref<HTMLElement | null>(null)

const notationOptions = SCORE_NOTATION_TYPE_OPTIONS
const keyOptions = SCORE_KEY_SIGNATURE_OPTIONS

function closeAll() {
  openMenu.value = null
  openFlyout.value = null
}

function toggleMenu(id: Exclude<MenuId, null>) {
  if (props.disabled) return
  if (openMenu.value === id) {
    closeAll()
    return
  }
  openMenu.value = id
  openFlyout.value = null
}

function onMenuEnter(id: Exclude<MenuId, null>) {
  if (props.disabled || openMenu.value == null) return
  openMenu.value = id
  openFlyout.value = null
}

function showFlyout(id: FlyoutId) {
  openFlyout.value = id
}

function hideFlyout(id: FlyoutId) {
  if (openFlyout.value === id) openFlyout.value = null
}

function run(action: () => void) {
  if (props.disabled) return
  action()
  closeAll()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target || !rootRef.value?.contains(target)) closeAll()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeAll()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onKeydown)
})

const check = (on: boolean) => (on ? '✓' : '')

const slurLabel = (value: SlurStylePreference) => t(`editor.slur.styleValue.${value}`)

const menuTitle = computed(() => ({
  file: t('editor.menu.file'),
  edit: t('editor.menu.edit'),
  view: t('editor.menu.view'),
  score: t('editor.menu.score'),
  help: t('editor.menu.help')
}))
</script>

<template>
  <nav ref="rootRef" class="editor-menu-bar" :class="{ 'editor-menu-bar--disabled': disabled }" aria-label="menu">
    <!-- 文件 -->
    <div class="editor-menu-bar__item" @pointerenter="onMenuEnter('file')">
      <button
        type="button"
        class="editor-menu-bar__trigger"
        :class="{ 'is-open': openMenu === 'file' }"
        :disabled="disabled"
        @click="toggleMenu('file')"
      >
        {{ menuTitle.file }}
      </button>
      <ul v-if="openMenu === 'file'" class="editor-menu-bar__dropdown" role="menu">
        <li role="none">
          <button type="button" class="editor-menu-bar__option" role="menuitem" @click="run(() => emit('save'))">
            {{ t('editor.toolbar.save') }}
          </button>
        </li>
        <li
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('import')"
          @pointerleave="hideFlyout('import')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.import') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul v-if="openFlyout === 'import'" class="editor-menu-bar__flyout" role="menu">
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('import', 'sj'))">
                {{ t('editor.toolbar.formatSj') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('import', 'musicXml'))">
                {{ t('editor.toolbar.formatMusicXml') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('import', 'midi'))">
                {{ t('editor.toolbar.formatMidi') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('import', 'scoreImage'))">
                {{ t('editor.toolbar.scoreImage') }}
              </button>
            </li>
          </ul>
        </li>
        <li
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('export')"
          @pointerleave="hideFlyout('export')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.export') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul v-if="openFlyout === 'export'" class="editor-menu-bar__flyout" role="menu">
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('export', 'sj'))">
                {{ t('editor.toolbar.formatSj') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('export', 'musicXmlMs4'))">
                {{ t('editor.toolbar.formatMusicXmlMs4') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('export', 'musicXmlMs3'))">
                {{ t('editor.toolbar.formatMusicXmlMs3') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('export', 'midi'))">
                {{ t('editor.toolbar.formatMidi') }}
              </button>
            </li>
            <li role="none">
              <button type="button" class="editor-menu-bar__option" @click="run(() => emit('export', 'work'))">
                {{ t('editor.toolbar.formatWork') }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 编辑 -->
    <div class="editor-menu-bar__item" @pointerenter="onMenuEnter('edit')">
      <button
        type="button"
        class="editor-menu-bar__trigger"
        :class="{ 'is-open': openMenu === 'edit' }"
        :disabled="disabled"
        @click="toggleMenu('edit')"
      >
        {{ menuTitle.edit }}
      </button>
      <ul v-if="openMenu === 'edit'" class="editor-menu-bar__dropdown" role="menu">
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('toggle-standard-mode'))">
            <span class="editor-menu-bar__check">{{ check(standardModeEnabled) }}</span>
            {{ t('editor.standardMode.label') }}
          </button>
        </li>
        <li v-if="showQuickInput" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('quick-input'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.quickInput') }}
          </button>
        </li>
        <li v-if="showPianoRecord" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('piano-record'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.pianoRecord') }}
          </button>
        </li>
        <li v-if="showLegalNotes" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('legal-notes'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.legalNotes') }}
          </button>
        </li>
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('lyrics-match'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.lyricsMatch.button') }}
          </button>
        </li>
      </ul>
    </div>

    <!-- 视图 -->
    <div class="editor-menu-bar__item" @pointerenter="onMenuEnter('view')">
      <button
        type="button"
        class="editor-menu-bar__trigger"
        :class="{ 'is-open': openMenu === 'view' }"
        :disabled="disabled"
        @click="toggleMenu('view')"
      >
        {{ menuTitle.view }}
      </button>
      <ul v-if="openMenu === 'view'" class="editor-menu-bar__dropdown" role="menu">
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('toggle-structure'))">
            <span class="editor-menu-bar__check">{{ check(structureEditEnabled) }}</span>
            {{ t('editor.toolbar.structureEdit') }}
          </button>
        </li>
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('toggle-lyrics'))">
            <span class="editor-menu-bar__check">{{ check(lyricsEditEnabled) }}</span>
            {{ t('editor.toolbar.lyricsEdit') }}
          </button>
        </li>
        <li v-if="!hideInstrumentName" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('toggle-instrument-name'))">
            <span class="editor-menu-bar__check">{{ check(showInstrumentName) }}</span>
            {{ t('editor.toolbar.showInstrumentName') }}
          </button>
        </li>
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('toggle-linked-staff'))">
            <span class="editor-menu-bar__check">{{ check(linkedStaffMode) }}</span>
            {{ t('editor.toolbar.linkedStaffMode') }}
          </button>
        </li>
        <li class="editor-menu-bar__sep" role="separator" />
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('layout'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.layout') }}
          </button>
        </li>
      </ul>
    </div>

    <!-- 谱面 -->
    <div class="editor-menu-bar__item" @pointerenter="onMenuEnter('score')">
      <button
        type="button"
        class="editor-menu-bar__trigger"
        :class="{ 'is-open': openMenu === 'score' }"
        :disabled="disabled"
        @click="toggleMenu('score')"
      >
        {{ menuTitle.score }}
      </button>
      <ul v-if="openMenu === 'score'" class="editor-menu-bar__dropdown" role="menu">
        <li
          v-if="!hideNotationTools"
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('notation')"
          @pointerleave="hideFlyout('notation')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.notationType') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul v-if="openFlyout === 'notation'" class="editor-menu-bar__flyout" role="menu">
            <li v-for="opt in notationOptions" :key="opt.value" role="none">
              <button
                type="button"
                class="editor-menu-bar__option"
                @click="run(() => emit('set-notation-type', opt.value))"
              >
                <span class="editor-menu-bar__check">{{ check(notationType === opt.value) }}</span>
                {{ resolveScoreNotationTypeLabel(opt.value) }}
              </button>
            </li>
          </ul>
        </li>
        <li
          v-if="!hideNotationTools"
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('transpose')"
          @pointerleave="hideFlyout('transpose')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.transpose') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul
            v-if="openFlyout === 'transpose'"
            class="editor-menu-bar__flyout editor-menu-bar__flyout--scroll"
            role="menu"
          >
            <li v-for="key in keyOptions" :key="key" role="none">
              <button
                type="button"
                class="editor-menu-bar__option"
                :disabled="key === currentKey"
                @click="run(() => emit('transpose', { toKey: key }))"
              >
                <span class="editor-menu-bar__check">{{ check(key === currentKey) }}</span>
                {{ resolveKeySignatureLabel(key) }}
              </button>
            </li>
          </ul>
        </li>
        <li v-if="!hideNotationTools" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('semitone-shift', 1))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.raiseSemitone') }}
          </button>
        </li>
        <li v-if="!hideNotationTools" role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('semitone-shift', -1))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.lowerSemitone') }}
          </button>
        </li>
        <li v-if="!hideNotationTools" class="editor-menu-bar__sep" role="separator" />
        <li
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('rhythm')"
          @pointerleave="hideFlyout('rhythm')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.rhythmPatternMode') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul v-if="openFlyout === 'rhythm'" class="editor-menu-bar__flyout" role="menu">
            <li role="none">
              <button
                type="button"
                class="editor-menu-bar__option"
                @click="run(() => emit('set-rhythm-mode', 'measure'))"
              >
                <span class="editor-menu-bar__check">{{ check(rhythmPatternMode === 'measure') }}</span>
                {{ t('editor.rhythmPattern.modeMeasure') }}
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                class="editor-menu-bar__option"
                @click="run(() => emit('set-rhythm-mode', 'beat'))"
              >
                <span class="editor-menu-bar__check">{{ check(rhythmPatternMode === 'beat') }}</span>
                {{ t('editor.rhythmPattern.modeBeat') }}
              </button>
            </li>
          </ul>
        </li>
        <li
          class="editor-menu-bar__option-wrap"
          role="none"
          @pointerenter="showFlyout('slur')"
          @pointerleave="hideFlyout('slur')"
        >
          <button type="button" class="editor-menu-bar__option editor-menu-bar__option--flyout" role="menuitem">
            {{ t('editor.toolbar.slurStyle') }}
            <span class="editor-menu-bar__chevron">›</span>
          </button>
          <ul v-if="openFlyout === 'slur'" class="editor-menu-bar__flyout" role="menu">
            <li v-for="value in SLUR_STYLE_PREFERENCE_VALUES" :key="value" role="none">
              <button
                type="button"
                class="editor-menu-bar__option"
                @click="run(() => emit('set-slur-style', value))"
              >
                <span class="editor-menu-bar__check">{{ check(slurStyle === value) }}</span>
                {{ slurLabel(value) }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 帮助 -->
    <div class="editor-menu-bar__item" @pointerenter="onMenuEnter('help')">
      <button
        type="button"
        class="editor-menu-bar__trigger"
        :class="{ 'is-open': openMenu === 'help' }"
        :disabled="disabled"
        @click="toggleMenu('help')"
      >
        {{ menuTitle.help }}
      </button>
      <ul v-if="openMenu === 'help'" class="editor-menu-bar__dropdown" role="menu">
        <li role="none">
          <button type="button" class="editor-menu-bar__option" @click="run(() => emit('notice'))">
            <span class="editor-menu-bar__check" />
            {{ t('editor.toolbar.notice') }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.editor-menu-bar {
  display: flex;
  align-items: stretch;
  gap: 0;
  height: 28px;
  padding: 0 4px;
  background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
  border-bottom: 1px solid #d0d0d0;
  font-family: 'Segoe UI', 'Microsoft YaHei UI', 'PingFang SC', sans-serif;
  font-size: 13px;
  user-select: none;
  flex-shrink: 0;
}

.editor-menu-bar--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.editor-menu-bar__item {
  position: relative;
}

.editor-menu-bar__trigger {
  height: 100%;
  padding: 0 10px;
  margin: 0;
  border: 1px solid transparent;
  border-radius: 2px;
  background: transparent;
  color: #1a1a1a;
  font: inherit;
  cursor: default;
}

.editor-menu-bar__trigger:hover,
.editor-menu-bar__trigger.is-open {
  background: #e5f3ff;
  border-color: #99c9ef;
}

.editor-menu-bar__dropdown,
.editor-menu-bar__flyout {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1200;
  min-width: 200px;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #a0a0a0;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.18);
}

.editor-menu-bar__flyout {
  top: -4px;
  left: calc(100% - 4px);
}

.editor-menu-bar__flyout--scroll {
  max-height: 320px;
  overflow-y: auto;
}

.editor-menu-bar__option-wrap {
  position: relative;
}

.editor-menu-bar__option {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 28px 5px 8px;
  margin: 0;
  border: 0;
  background: transparent;
  color: #1a1a1a;
  font: inherit;
  text-align: left;
  white-space: nowrap;
  cursor: default;
}

.editor-menu-bar__option:hover:not(:disabled),
.editor-menu-bar__option-wrap:hover > .editor-menu-bar__option {
  background: #316ac5;
  color: #fff;
}

.editor-menu-bar__option:disabled {
  color: #9a9a9a;
}

.editor-menu-bar__option--flyout {
  padding-right: 12px;
}

.editor-menu-bar__check {
  flex: 0 0 14px;
  width: 14px;
  text-align: center;
  font-size: 12px;
}

.editor-menu-bar__chevron {
  margin-left: auto;
  padding-left: 16px;
  font-size: 14px;
  line-height: 1;
}

.editor-menu-bar__sep {
  height: 1px;
  margin: 4px 8px;
  background: #e0e0e0;
}
</style>
