<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Document, EditPen, Reading, VideoPlay } from '@element-plus/icons-vue'
import { HOME_TEMPLATE_TO_ROUTE } from '@renderer/utils/scoreRoute'
import { useMidiStore } from '@renderer/store/midi.store'

const router = useRouter()
const { hasConnectedInput } = storeToRefs(useMidiStore())
const storyVisible = ref(false)
const templateVisible = ref(false)

const mockScripts = [
  { id: 1, title: '初遇之章', color: '#ffd6e8' },
  { id: 2, title: '和声之城', color: '#e8d5ff' },
  { id: 3, title: '晚风与旧歌', color: '#d4f0ff' },
  { id: 4, title: '星轨序曲', color: '#fff0c9' }
]

const templates = [
  { key: 'empty', label: '空', emoji: '✨' },
  { key: 'single', label: '单声部', emoji: '🎵' },
  { key: 'double', label: '双声部', emoji: '🎶' }
]

const hasSave = true
const saveTitle = '和声之城'
const saveProgress = 58

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
          <p class="subtitle">在旋律里，遇见你的故事</p>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="play-zone">
        <button type="button" class="story-card" @click="storyVisible = true">
          <span class="card-badge">剧情</span>
          <div class="story-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h2>选择剧本</h2>
          <p>翻开正方形的小故事，开始一段新的谱旅</p>
          <span class="card-hint">点击查看全部剧本 →</span>
        </button>

        <button
          type="button"
          class="continue-card"
          :class="{ 'is-empty': !hasSave }"
          :disabled="!hasSave"
        >
          <div class="continue-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="continue-body">
            <h2>继续游戏</h2>
            <template v-if="hasSave">
              <p class="save-name">{{ saveTitle }}</p>
              <div class="progress-wrap">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: saveProgress + '%' }" />
                </div>
                <span class="progress-text">{{ saveProgress }}%</span>
              </div>
            </template>
            <p v-else class="empty-tip">还没有存档哦，先去选个剧本吧～</p>
          </div>
        </button>
      </section>

      <section class="action-row">
        <button type="button" class="action-btn action-collection" @click="goToCollection">
          <span class="action-emoji">🎁</span>
          <span class="action-label">藏品</span>
        </button>

        <button type="button" class="action-btn action-compose" @click="templateVisible = true">
          <span class="action-icon"><el-icon><EditPen /></el-icon></span>
          <span class="action-label">曲谱制作</span>
        </button>

        <button type="button" class="action-btn action-scores" @click="goToScores">
          <span class="action-icon"><el-icon><Document /></el-icon></span>
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

    <!-- 剧情弹窗 UI -->
    <el-dialog
      v-model="storyVisible"
      title="选择剧本"
      width="520px"
      class="cute-dialog"
      append-to-body
      align-center
    >
      <p class="dialog-desc">悬停剧本卡片，即可看到「开始游戏」</p>
      <div class="script-grid">
        <div
          v-for="script in mockScripts"
          :key="script.id"
          class="script-card"
          :style="{ '--card-tint': script.color }"
        >
          <div class="script-cover">
            <span class="script-emoji">📖</span>
          </div>
          <div class="script-hover">
            <span>开始游戏</span>
          </div>
          <p class="script-title">{{ script.title }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 曲谱模版弹窗 UI -->
    <el-dialog
      v-model="templateVisible"
      title="选择模版"
      width="420px"
      class="cute-dialog"
      append-to-body
      align-center
    >
      <p class="dialog-desc">选好模版后，就可以进入曲谱编辑啦</p>
      <div class="template-list">
        <button
          v-for="tpl in templates"
          :key="tpl.key"
          type="button"
          class="template-item"
          @click="onTemplateSelect(tpl.key)"
        >
          <span class="template-emoji">{{ tpl.emoji }}</span>
          <span>{{ tpl.label }}</span>
        </button>
      </div>
    </el-dialog>

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
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.story-card,
.continue-card {
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.story-card:hover,
.continue-card:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.story-card {
  position: relative;
  padding: 24px 22px;
  overflow: hidden;
}

.story-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 184, 208, 0.35), rgba(201, 184, 255, 0.25));
}

.card-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, var(--pink-deep), var(--lavender));
  margin-bottom: 14px;
}

.story-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--pink-deep);
  background: rgba(255, 184, 208, 0.25);
  margin-bottom: 12px;
}

.story-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
}

.story-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-soft);
}

.card-hint {
  display: inline-block;
  margin-top: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--pink-deep);
}

.continue-card {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.continue-card.is-empty {
  opacity: 0.72;
  cursor: not-allowed;
}

.continue-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--lavender), var(--sky));
}

.continue-body h2 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
}

.save-name {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--text-soft);
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.25);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--pink), var(--lavender));
}

.progress-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--lavender);
  min-width: 32px;
}

.empty-tip {
  margin: 0;
  font-size: 12px;
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

.script-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.script-card {
  position: relative;
  cursor: pointer;
}

.script-cover {
  aspect-ratio: 1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-tint);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(180, 140, 200, 0.15);
  transition: transform 0.2s ease;
}

.script-emoji {
  font-size: 36px;
}

.script-hover {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(92, 74, 106, 0.55);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.script-hover span {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, var(--pink-deep), var(--lavender));
}

.script-card:hover .script-cover {
  transform: scale(1.02);
}

.script-card:hover .script-hover {
  opacity: 1;
}

.script-title {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
