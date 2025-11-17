<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '线上片状' }, // 顶部标题
  avatar: { type: String, default: '' },
  name: { type: String, default: '' },
  tag: { type: String, default: '' }, // 标签介绍，例如 "强"
  subTag: { type: String, default: '' }, // 可选的小标签

  width: { type: String, default: '330px' },
  height: { type: String, default: '130px' },

  avatarSize: { type: String, default: '60px' },
  titleSize: { type: String, default: '15px' },
  tagSize: { type: String, default: '13px' },
  topTitleSize: { type: String, default: '17px' },

  btnWidth: { type: String, default: '80px' },
  buttonText: { type: String, default: '本地' },

  transparent: { type: Boolean, default: false }
})

// 卡片背景样式
const cardStyle = computed(() => ({
  width: props.width,
  height: props.height,
  background: props.transparent ? 'transparent' : 'rgba(255, 255, 245, 0.8)',
  backdropFilter: props.transparent ? 'none' : 'blur(3px)',
  boxShadow: props.transparent ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
}))
</script>

<template>
  <div class="champion-card" :style="cardStyle">
    <!-- 顶部标题 -->
    <div class="top-title" :style="{ fontSize: topTitleSize }">
      {{ title }}
    </div>

    <div class="content">
      <!-- 左侧头像 -->
      <img class="avatar" :src="avatar" :style="{ width: avatarSize, height: avatarSize }" />

      <div class="info">
        <div class="name" :style="{ fontSize: titleSize }">
          {{ name }}
        </div>

        <div class="tags" :style="{ fontSize: tagSize }">
          <span class="main-tag">{{ tag }}</span>
          <span class="sub-tag" v-if="subTag">· {{ subTag }}</span>
        </div>
      </div>

      <!-- 右侧按钮 -->
      <button class="right-btn" :style="{ width: btnWidth }">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.champion-card {
  border-radius: 16px;
  padding: 10px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #6c5a4c;
}

.top-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.content {
  display: flex;
  align-items: center;
}

.avatar {
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
  margin-left: 10px;
}

.name {
  font-weight: 600;
}

.tags {
  margin-top: 4px;
  opacity: 0.8;
}

.main-tag {
  color: #c08d6a;
}

.right-btn {
  border: none;
  background: #e0c8b6;
  color: #7d6c60;
  padding: 6px 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}
</style>
