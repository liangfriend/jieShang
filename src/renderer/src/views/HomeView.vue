<script setup lang="ts">
import {
  Bell,
  Calendar,
  Collection,
  Document,
  EditPen,
  FolderOpened,
  Message,
  Notebook,
  Promotion,
  Reading,
  Right,
  Setting,
  VideoPlay
} from '@element-plus/icons-vue'

const theoryProgress = 860
const theoryMax = 1200
const theoryPercent = Math.round((theoryProgress / theoryMax) * 100)

const featureCards = [
  {
    key: 'work-create',
    title: '作品制作',
    desc: '在曲谱上叠加画笔、媒体与音频',
    icon: Notebook
  },
  {
    key: 'score-create',
    title: '曲谱制作',
    desc: '创作、编辑你的乐谱',
    icon: EditPen
  },
  {
    key: 'collection',
    title: '藏品',
    desc: '收集乐谱、角色与纪念品',
    icon: Collection
  },
  {
    key: 'score-list',
    title: '我的曲谱',
    desc: '管理和查看你的作品',
    icon: Document
  },
  {
    key: 'work-list',
    title: '我的作品',
    desc: '管理和查看你的作品',
    icon: FolderOpened
  },
  {
    key: 'online',
    title: '在线作品',
    desc: '浏览和分享优秀作品',
    icon: Promotion
  }
]

function onCardClick(key: string) {
  console.log('[home] navigate:', key)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">♪</div>
        <div>
          <h1 class="brand-title">谱旅之章</h1>
          <p class="brand-sub">在旋律中书写你的故事</p>
        </div>
      </div>

      <div class="header-actions">
        <button type="button" class="icon-btn" aria-label="通知">
          <el-icon><Bell /></el-icon>
        </button>
        <button type="button" class="icon-btn" aria-label="消息">
          <el-icon><Message /></el-icon>
        </button>
        <button type="button" class="icon-btn" aria-label="日历">
          <el-icon><Calendar /></el-icon>
        </button>
        <button type="button" class="icon-btn" aria-label="设置">
          <el-icon><Setting /></el-icon>
        </button>
        <div class="user-pill">
          <div class="avatar">M</div>
          <div class="user-meta">
            <span class="user-name">MelodySeeker</span>
            <span class="user-level">Lv. 23</span>
          </div>
        </div>
      </div>
    </header>

    <main class="home-main">
      <section class="story-column">
        <article class="panel panel-hero">
          <div class="panel-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h2>主线剧情</h2>
          <p>踏上音乐之旅，揭开世界的真相</p>
          <button type="button" class="round-btn" aria-label="进入主线">
            <el-icon><Right /></el-icon>
          </button>
        </article>

        <article class="panel">
          <div class="panel-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <h2>继续游戏</h2>
          <p class="muted">回到你的冒险旅程</p>
          <div class="progress-block">
            <span>第三章：和声之城</span>
            <div class="bar-track"><div class="bar-fill" style="width: 58%" /></div>
            <span class="muted">进度 58%</span>
          </div>
        </article>

        <article class="panel">
          <div class="panel-icon">
            <el-icon><Collection /></el-icon>
          </div>
          <h2>DLC</h2>
          <p class="muted">探索更多音乐与故事</p>
          <div class="dlc-row">
            <span>晚风与旧歌</span>
            <span class="tag tag-new">新内容</span>
            <span class="tag tag-owned">已拥有</span>
          </div>
        </article>
      </section>

      <section class="feature-grid">
        <button
          v-for="card in featureCards"
          :key="card.key"
          type="button"
          class="feature-card"
          @click="onCardClick(card.key)"
        >
          <div class="feature-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
        </button>
      </section>
    </main>

    <footer class="home-footer">
      <div class="tip-box">
        <span class="tip-label">今日小贴士</span>
        <p>认识五线谱：每条线与每个间都代表不同的音高哦！</p>
      </div>
      <div class="study-box">
        <div class="study-head">
          <span>乐理学习进度</span>
          <span class="study-lv">Lv. 23</span>
        </div>
        <div class="study-bar">
          <div class="bar-track bar-track-wide">
            <div class="bar-fill" :style="{ width: theoryPercent + '%' }" />
          </div>
          <span class="study-num">{{ theoryProgress }} / {{ theoryMax }}</span>
        </div>
        <button type="button" class="study-btn">去学习</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home {
  --bg-deep: #2a1f14;
  --bg-mid: #3d2e1f;
  --panel: rgba(58, 44, 30, 0.72);
  --border: rgba(212, 175, 98, 0.45);
  --gold: #d4af62;
  --gold-light: #f0d9a0;
  --text: #f5ead6;
  --muted: #c4b59a;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 28px 16px;
  color: var(--text);
  background: linear-gradient(160deg, var(--bg-deep) 0%, var(--bg-mid) 45%, #4a3828 100%);
  box-sizing: border-box;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--gold-light);
  background: rgba(0, 0, 0, 0.2);
}

.brand-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold-light);
}

.brand-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.15);
  color: var(--gold-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  border-color: var(--gold);
  color: #fff;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.18);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b6914, #d4af62);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #2a1f14;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
}

.user-level {
  font-size: 11px;
  color: var(--gold);
}

.home-main {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(240px, 300px) 1fr;
  gap: 20px;
  min-height: 0;
}

.story-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel {
  position: relative;
  padding: 18px 18px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--panel);
  backdrop-filter: blur(4px);
}

.panel-hero {
  flex: 1;
  min-height: 140px;
}

.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  font-size: 20px;
  margin-bottom: 10px;
}

.panel h2 {
  margin: 0 0 6px;
  font-size: 18px;
  color: var(--gold-light);
}

.panel p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.muted {
  color: var(--muted) !important;
}

.round-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--gold);
  background: rgba(212, 175, 98, 0.15);
  color: var(--gold-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-block {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

.bar-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b6914, var(--gold-light));
}

.dlc-row {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
}

.tag-new {
  color: #ffd89b;
  border-color: #c9a227;
}

.tag-owned {
  color: #9fd89f;
  border-color: #5a8f5a;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 14px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: inherit;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.2s,
    transform 0.15s;
}

.feature-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: var(--gold);
}

.feature-card h3 {
  margin: 4px 0 0;
  font-size: 16px;
  color: var(--gold-light);
}

.feature-card p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.home-footer {
  margin-top: 16px;
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.tip-box {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
}

.tip-label {
  display: inline-block;
  font-size: 12px;
  color: var(--gold);
  margin-bottom: 4px;
}

.tip-box p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.study-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  min-width: 360px;
}

.study-head {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  white-space: nowrap;
}

.study-lv {
  color: var(--gold);
  font-weight: 600;
}

.study-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.bar-track-wide {
  width: 100%;
}

.study-num {
  font-size: 11px;
  color: var(--muted);
}

.study-btn {
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid var(--gold);
  background: linear-gradient(180deg, rgba(212, 175, 98, 0.35), rgba(139, 105, 20, 0.5));
  color: var(--gold-light);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.study-btn:hover {
  filter: brightness(1.1);
}
</style>
