<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import HomeSettingsDialog from '@renderer/components/HomeSettingsDialog.vue'
import { useMidiStore } from '@renderer/store/midi.store'
import arcadeIcon from '@renderer/assets/homeView/icon-arcade.svg'
import endlessIcon from '@renderer/assets/homeView/icon-endless.svg'
import extremeIcon from '@renderer/assets/homeView/icon-extreme.svg'
import collectionIcon from '@renderer/assets/homeView/icon-collection.svg'
import scoresIcon from '@renderer/assets/homeView/icon-scores.svg'
import whiteboardIcon from '@renderer/assets/homeView/icon-whiteboard.svg'
import achievementsIcon from '@renderer/assets/homeView/icon-achievements.svg'
import myWorksIcon from '@renderer/assets/homeView/icon-my-works.svg'
import encyclopediaIcon from '@renderer/assets/homeView/icon-encyclopedia.svg'
import literacyIcon from '@renderer/assets/homeView/icon-literacy.svg'
import audioIcon from '@renderer/assets/homeView/icon-audio.svg'
import imageIcon from '@renderer/assets/homeView/icon-image.svg'
import videoIcon from '@renderer/assets/homeView/icon-video.svg'
import instrumentSimIcon from '@renderer/assets/homeView/icon-instrument-sim.svg'
import toolsIcon from '@renderer/assets/homeView/icon-tools.svg'
import logoIcon from '@renderer/assets/homeView/icon-logo.svg'
import settingsIcon from '@renderer/assets/homeView/icon-settings.svg'
import midiIcon from '@renderer/assets/homeView/icon-midi.svg'
import midiOffIcon from '@renderer/assets/homeView/icon-midi-off.svg'

const { t } = useI18n()
const router = useRouter()
const { hasConnectedInput } = storeToRefs(useMidiStore())
const settingsVisible = ref(false)

const midiStatusIcon = computed(() => (hasConnectedInput.value ? midiIcon : midiOffIcon))

const gameModes = computed(() => [
  {
    route: 'noteSliceArcade' as const,
    title: t('home.gameModes.arcade.title'),
    desc: t('home.gameModes.arcade.desc'),
    icon: arcadeIcon,
    tint: '#fff0c9'
  },
  {
    route: 'noteSliceEndless' as const,
    title: t('home.gameModes.endless.title'),
    desc: t('home.gameModes.endless.desc'),
    icon: endlessIcon,
    tint: '#d4f0ff'
  },
  {
    route: 'noteSliceExtreme' as const,
    title: t('home.gameModes.extreme.title'),
    desc: t('home.gameModes.extreme.desc'),
    icon: extremeIcon,
    tint: '#ffd6e8'
  }
])

const secondaryActions = computed(() => [
  {
    route: 'whiteboard' as const,
    labelKey: 'home.actions.whiteboard' as const,
    icon: whiteboardIcon,
    className: 'action-whiteboard'
  },
  {
    route: 'musicEncyclopedia' as const,
    labelKey: 'home.actions.musicEncyclopedia' as const,
    icon: encyclopediaIcon,
    className: 'action-encyclopedia'
  },
  {
    route: 'abilityTest' as const,
    labelKey: 'home.actions.abilityTest' as const,
    icon: literacyIcon,
    className: 'action-literacy'
  },
  {
    route: 'instrumentSim' as const,
    labelKey: 'home.actions.instrumentSim' as const,
    icon: instrumentSimIcon,
    className: 'action-instrument-sim'
  },
  {
    route: 'myAudio' as const,
    labelKey: 'home.actions.myAudio' as const,
    icon: audioIcon,
    className: 'action-audio'
  },
  {
    route: 'myImage' as const,
    labelKey: 'home.actions.myImage' as const,
    icon: imageIcon,
    className: 'action-image'
  },
  {
    route: 'myVideo' as const,
    labelKey: 'home.actions.myVideo' as const,
    icon: videoIcon,
    className: 'action-video'
  },
  {
    route: 'tools' as const,
    labelKey: 'home.actions.tools' as const,
    icon: toolsIcon,
    className: 'action-tools'
  }
])

const utilityActions = computed(() => [
  {
    route: 'collection' as const,
    labelKey: 'home.actions.collection' as const,
    icon: collectionIcon,
    className: 'action-collection'
  },
  {
    route: 'achievements' as const,
    labelKey: 'home.actions.achievements' as const,
    icon: achievementsIcon,
    className: 'action-achievements'
  }
])

const moreActions = computed(() => [...secondaryActions.value, ...utilityActions.value])

function goToGameMode(routeName: (typeof gameModes.value)[number]['route']) {
  router.push({ name: routeName })
}

function goToNamedRoute(
  routeName:
    | (typeof moreActions.value)[number]['route']
    | 'myWorks'
    | 'scores'
) {
  router.push({ name: routeName })
}
</script>

<template>
  <div class="home">
    <div class="bg-deco" aria-hidden="true">
      <span class="float-note n1">♪</span>
      <span class="float-note n2">♫</span>
      <span class="float-note n3">♩</span>
      <span class="bubble b1" />
      <span class="bubble b2" />
      <span class="bubble b3" />
    </div>

    <header class="home-header">
      <div class="logo-wrap">
        <img class="logo-face" :src="logoIcon" :alt="t('home.brand.logoAlt')" />
        <div>
          <h1 class="title">{{ t('home.brand.title') }}</h1>
          <p class="subtitle">{{ t('home.brand.subtitle') }}</p>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="play-zone">
        <button
          v-for="mode in gameModes"
          :key="mode.route"
          type="button"
          class="mode-card"
          :style="{ '--card-tint': mode.tint }"
          @click="goToGameMode(mode.route)"
        >
          <img class="mode-card__icon" :src="mode.icon" :alt="mode.title" />
          <h2 class="mode-card__title">{{ mode.title }}</h2>
          <p class="mode-card__desc">{{ mode.desc }}</p>
        </button>
      </section>

      <section class="action-row action-row--primary">
        <button type="button" class="action-btn action-scores" @click="goToNamedRoute('scores')">
          <img class="action-btn__icon" :src="scoresIcon" :alt="t('home.actions.scores')" />
          <span class="action-label">{{ t('home.actions.scores') }}</span>
        </button>

        <button type="button" class="action-btn action-my-works" @click="goToNamedRoute('myWorks')">
          <img class="action-btn__icon" :src="myWorksIcon" :alt="t('home.actions.myWorks')" />
          <span class="action-label">{{ t('home.actions.myWorks') }}</span>
        </button>
      </section>

      <section class="action-row action-row--more">
        <button
          v-for="action in moreActions"
          :key="action.route"
          type="button"
          class="action-btn"
          :class="action.className"
          @click="goToNamedRoute(action.route)"
        >
          <img class="action-btn__icon" :src="action.icon" :alt="t(action.labelKey)" />
          <span class="action-label">{{ t(action.labelKey) }}</span>
        </button>
      </section>
    </main>

    <HomeSettingsDialog v-model="settingsVisible" />

    <button
      type="button"
      class="home-settings-btn"
      :title="t('home.settingsAria')"
      :aria-label="t('home.settingsAria')"
      @click="settingsVisible = true"
    >
      <img class="home-settings-btn__icon" :src="settingsIcon" alt="" />
    </button>

    <div
      class="midi-status"
      :class="hasConnectedInput ? 'is-connected' : 'is-disconnected'"
      :title="hasConnectedInput ? t('home.midi.connected') : t('home.midi.disconnected')"
      aria-live="polite"
      :aria-label="hasConnectedInput ? t('home.midi.connected') : t('home.midi.disconnected')"
    >
      <img class="midi-status__icon" :src="midiStatusIcon" alt="" />
    </div>
  </div>
</template>

<style scoped>
.home {
  --cream: #fff8fb;
  --pink: #ffb8d0;
  --pink-deep: #ff8fb8;
  --lavender: #c9b8ff;
  --sky: #b8e4ff;
  --text: #5c4a6a;
  --text-soft: #9a8aa8;
  --card: rgba(255, 255, 255, 0.82);
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 32px 40px;
  box-sizing: border-box;
  color: var(--text);
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
  overflow: hidden;
}

.bg-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.float-note {
  position: absolute;
  font-size: 28px;
  opacity: 0.35;
  animation: drift 6s ease-in-out infinite;
}

.n1 {
  top: 12%;
  left: 8%;
  color: var(--pink-deep);
}

.n2 {
  top: 20%;
  right: 10%;
  animation-delay: -2s;
  color: var(--lavender);
}

.n3 {
  bottom: 18%;
  left: 12%;
  animation-delay: -4s;
  color: var(--sky);
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
}

.b1 {
  width: 120px;
  height: 120px;
  top: -30px;
  right: 15%;
}

.b2 {
  width: 80px;
  height: 80px;
  bottom: 10%;
  right: 8%;
}

.b3 {
  width: 60px;
  height: 60px;
  bottom: 25%;
  left: 5%;
}

@keyframes drift {
  0%,
  100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-12px) rotate(5deg);
  }
}

.home-header {
  position: relative;
  z-index: 1;
  margin-bottom: 36px;
  text-align: center;
}

.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-face {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: var(--shadow);
  animation: bounce 3s ease-in-out infinite;
  user-select: none;
  pointer-events: none;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, var(--pink-deep), var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-soft);
}

.home-main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.play-zone {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mode-card {
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, var(--card-tint) 100%);
  border-radius: 22px;
  box-shadow: var(--shadow);
  cursor: pointer;
  text-align: center;
  color: inherit;
  padding: 18px 14px 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.mode-card__icon {
  display: block;
  width: 52px;
  height: 52px;
  margin: 0 auto 8px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.mode-card__title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
}

.mode-card__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-soft);
}

.action-row {
  display: grid;
  gap: 12px;
}

.action-row--primary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-row--more {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--card);
  box-shadow: var(--shadow);
  cursor: pointer;
  color: inherit;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.action-row--primary .action-btn {
  flex-direction: row;
  gap: 12px;
  min-height: 64px;
  padding: 12px 16px;
  border-radius: 18px;
  justify-content: flex-start;
}

.action-row--more .action-btn {
  flex-direction: column;
  gap: 6px;
  min-height: 88px;
  padding: 12px 8px;
  border-radius: 16px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(200, 140, 180, 0.22);
}

.action-collection:hover {
  background: rgba(255, 240, 201, 0.9);
}

.action-scores:hover {
  background: rgba(212, 240, 255, 0.9);
}

.action-whiteboard:hover {
  background: rgba(232, 213, 255, 0.92);
}

.action-achievements:hover {
  background: rgba(255, 232, 180, 0.92);
}

.action-my-works:hover {
  background: rgba(232, 213, 255, 0.92);
}

.action-encyclopedia:hover {
  background: rgba(220, 250, 236, 0.95);
}

.action-literacy:hover {
  background: rgba(255, 232, 214, 0.95);
}

.action-audio:hover {
  background: rgba(212, 240, 255, 0.9);
}

.action-image:hover {
  background: rgba(255, 232, 240, 0.95);
}

.action-video:hover {
  background: rgba(236, 228, 255, 0.95);
}

.action-instrument-sim:hover {
  background: rgba(255, 244, 201, 0.95);
}

.action-tools:hover {
  background: rgba(232, 236, 242, 0.95);
}

.action-row--primary .action-btn__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.action-row--more .action-btn__icon {
  width: 36px;
  height: 36px;
}

.action-btn__icon {
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.action-row--primary .action-label {
  font-size: 14px;
  text-align: left;
}

.action-row--more .action-label {
  font-size: 12px;
  text-align: center;
}

.action-label {
  font-weight: 700;
  line-height: 1.3;
}

@media (max-width: 720px) {
  .action-row--more {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .action-row--primary {
    grid-template-columns: 1fr;
  }

  .action-row--more {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.midi-status {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 20;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 6px 20px rgba(92, 74, 106, 0.16);
  animation: midi-float 2.8s ease-in-out infinite;
  transition:
    background 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.midi-status__icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.midi-status.is-connected {
  background: linear-gradient(145deg, rgba(168, 230, 181, 0.95), rgba(126, 207, 147, 0.92));
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 6px 22px rgba(82, 196, 110, 0.28),
    0 0 0 3px rgba(126, 207, 147, 0.18);
}

.midi-status.is-disconnected {
  background: linear-gradient(145deg, rgba(255, 186, 186, 0.95), rgba(255, 143, 143, 0.9));
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 6px 22px rgba(255, 120, 120, 0.22),
    0 0 0 3px rgba(255, 143, 143, 0.16);
}

@keyframes midi-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.home-settings-btn {
  position: fixed;
  left: 22px;
  bottom: 22px;
  z-index: 20;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 6px 20px rgba(92, 74, 106, 0.16);
  cursor: pointer;
  color: #5c4a6a;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(243, 235, 255, 0.94));
  animation: midi-float 2.8s ease-in-out infinite;
  animation-delay: -1.4s;
  transition:
    background 0.35s ease,
    box-shadow 0.35s ease,
    transform 0.2s ease;
}

.home-settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 184, 255, 0.35);
  background: linear-gradient(145deg, rgba(255, 248, 251, 0.98), rgba(232, 213, 255, 0.96));
}

.home-settings-btn__icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
</style>

<style>
.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.cute-dialog .el-dialog__header {
  padding: 20px 24px 8px;
}

.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}

.cute-dialog .el-dialog__body {
  padding: 8px 24px 24px;
}
</style>
