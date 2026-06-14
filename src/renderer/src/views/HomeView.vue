<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Document, EditPen, Setting } from '@element-plus/icons-vue'
import HomeSettingsDialog from '@renderer/components/HomeSettingsDialog.vue'
import { HOME_TEMPLATE_TO_ROUTE } from '@renderer/utils/scoreRoute'
import { useMidiStore } from '@renderer/store/midi.store'

const router = useRouter()
const { hasConnectedInput } = storeToRefs(useMidiStore())
const templateVisible = ref(false)
const settingsVisible = ref(false)

const gameModes = [
  {
    route: 'noteSliceArcade',
    title: '街机模式',
    desc: '60 秒限时，冲高分',
    emoji: '⚡',
    tint: '#fff0c9'
  },
  {
    route: 'noteSliceEndless',
    title: '无限模式',
    desc: '三条命，看你能撑多久',
    emoji: '♾',
    tint: '#d4f0ff'
  },
  {
    route: 'noteSliceExtreme',
    title: '极限模式',
    desc: '不准漏音，挑战存活',
    emoji: '🔥',
    tint: '#ffd6e8'
  }
] as const

const templateGroups = [
  {
    title: '线谱',
    items: [
      { key: 'empty', label: '空', emoji: '✨' },
      { key: 'single', label: '单声部', emoji: '🎵' },
      { key: 'double', label: '双声部', emoji: '🎶' }
    ]
  },
  {
    title: '简谱',
    items: [
      { key: 'jianpuEmpty', label: '空', emoji: '✨' },
      { key: 'jianpuSingle', label: '单声部', emoji: '🎵' },
      { key: 'jianpuDouble', label: '双声部', emoji: '🎶' }
    ]
  }
]

function goToGameMode(routeName: (typeof gameModes)[number]['route']) {
  router.push({ name: routeName })
}

function onTemplateSelect(key: string) {
  templateVisible.value = false
  router.push({
    name: 'edit',
    query: { template: HOME_TEMPLATE_TO_ROUTE[key] ?? 'empty' }
  })
}

function goToScores() {
  router.push({ name: 'scores' })
}

function goToCollection() {
  router.push({ name: 'collection' })
}

function goToWhiteboard() {
  router.push({ name: 'whiteboard' })
}

function goToLiteracyCamp() {
  router.push({ name: 'literacyCamp' })
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
        <span class="logo-face">♪</span>
        <div>
          <h1 class="title">谱旅之章</h1>
          <p class="subtitle">切准音符，闯出高分</p>
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
          <span class="mode-card__emoji">{{ mode.emoji }}</span>
          <h2 class="mode-card__title">{{ mode.title }}</h2>
          <p class="mode-card__desc">{{ mode.desc }}</p>
        </button>
      </section>

      <section class="action-row">
        <button type="button" class="action-btn action-collection" @click="goToCollection">
          <span class="action-emoji">🎁</span>
          <span class="action-label">藏品</span>
        </button>

        <button type="button" class="action-btn action-compose" @click="templateVisible = true">
          <span class="action-icon"
            ><el-icon><EditPen /></el-icon
          ></span>
          <span class="action-label">曲谱制作</span>
        </button>

        <button type="button" class="action-btn action-scores" @click="goToScores">
          <span class="action-icon"
            ><el-icon><Document /></el-icon
          ></span>
          <span class="action-label">我的曲谱</span>
        </button>
      </section>

      <section class="action-row action-row--dual">
        <button type="button" class="action-btn action-whiteboard" @click="goToWhiteboard">
          <span class="action-emoji">🎹</span>
          <span class="action-label">教学白板</span>
        </button>

        <button type="button" class="action-btn action-training" @click="goToLiteracyCamp">
          <span class="action-emoji">🎯</span>
          <span class="action-label">素养训练营</span>
        </button>
      </section>
    </main>

    <!-- 曲谱模版弹窗 UI -->
    <el-dialog
      v-model="templateVisible"
      title="选择模版"
      width="480px"
      class="cute-dialog"
      append-to-body
      align-center
    >
      <p class="dialog-desc">选好模版后，就可以进入曲谱编辑啦</p>
      <div class="template-groups">
        <section v-for="group in templateGroups" :key="group.title" class="template-group">
          <h3 class="template-group__title">{{ group.title }}</h3>
          <div class="template-list">
            <button
              v-for="tpl in group.items"
              :key="tpl.key"
              type="button"
              class="template-item"
              @click="onTemplateSelect(tpl.key)"
            >
              <span class="template-emoji">{{ tpl.emoji }}</span>
              <span>{{ tpl.label }}</span>
            </button>
          </div>
        </section>
      </div>
    </el-dialog>

    <HomeSettingsDialog v-model="settingsVisible" />

    <button
      type="button"
      class="home-settings-btn"
      title="设置"
      aria-label="设置"
      @click="settingsVisible = true"
    >
      <el-icon class="home-settings-btn__icon"><Setting /></el-icon>
    </button>

    <div
      class="midi-status"
      :class="hasConnectedInput ? 'is-connected' : 'is-disconnected'"
      :title="hasConnectedInput ? 'MIDI 琴已连接' : 'MIDI 琴未连接'"
      aria-live="polite"
      :aria-label="hasConnectedInput ? 'MIDI 琴已连接' : 'MIDI 琴未连接'"
    >
      <span class="midi-status__icon" aria-hidden="true">🎹</span>
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pink) 0%, var(--lavender) 100%);
  box-shadow: var(--shadow);
  animation: bounce 3s ease-in-out infinite;
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
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.play-zone {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.mode-card {
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, var(--card-tint) 100%);
  border-radius: 24px;
  box-shadow: var(--shadow);
  cursor: pointer;
  text-align: center;
  color: inherit;
  padding: 22px 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.mode-card__emoji {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.mode-card__title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
}

.mode-card__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-soft);
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.action-row--dual {
  grid-template-columns: repeat(2, 1fr);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  background: var(--card);
  box-shadow: var(--shadow);
  cursor: pointer;
  color: inherit;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px) scale(1.02);
}

.action-collection:hover {
  background: rgba(255, 240, 201, 0.9);
}

.action-compose:hover {
  background: rgba(255, 214, 232, 0.9);
}

.action-scores:hover {
  background: rgba(212, 240, 255, 0.9);
}

.action-whiteboard:hover {
  background: rgba(232, 213, 255, 0.92);
}

.action-training:hover {
  background: rgba(200, 248, 218, 0.92);
}

.action-emoji {
  font-size: 28px;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--pink-deep);
  background: rgba(255, 184, 208, 0.2);
}

.action-label {
  font-size: 14px;
  font-weight: 700;
}

.dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-soft);
  text-align: center;
}

.template-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-group__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 2px solid rgba(255, 184, 208, 0.4);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.template-item:hover {
  transform: translateX(4px);
  border-color: var(--pink-deep);
  background: rgba(255, 214, 232, 0.5);
}

.template-emoji {
  font-size: 24px;
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
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
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
  font-size: 22px;
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
