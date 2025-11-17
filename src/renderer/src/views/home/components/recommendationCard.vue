<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  avatar: { type: String, default: '' },
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  rating: { type: Number, default: 0 },

  width: { type: String, default: '300px' },
  height: { type: String, default: '90px' },

  avatarSize: { type: String, default: '56px' },
  titleSize: { type: String, default: '16px' },
  subSize: { type: String, default: '12px' },
  btnWidth: { type: String, default: '80px' },
  buttonText: { type: String, default: '本地列表' },

  /** 新增：透明背景 */
  transparent: { type: Boolean, default: false }
})

const cardStyle = computed(() => ({
  width: props.width,
  height: props.height,
  background: props.transparent ? 'transparent' : 'rgba(255, 255, 245, 0.8)',
  backdropFilter: props.transparent ? 'none' : 'blur(3px)',
  boxShadow: props.transparent ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
}))

const avatarStyle = computed(() => ({
  width: props.avatarSize,
  height: props.avatarSize
}))

const titleStyle = computed(() => ({
  fontSize: props.titleSize
}))

const subStyle = computed(() => ({
  fontSize: props.subSize
}))

const btnStyle = computed(() => ({
  width: props.btnWidth
}))
</script>

<template>
  <div class="card" :style="cardStyle">
    <!-- 左侧头像 -->
    <img :src="avatar" class="avatar" :style="avatarStyle" />

    <!-- 文本 -->
    <div class="info">
      <div class="title" :style="titleStyle">{{ title }}</div>
      <div class="sub" :style="subStyle">{{ subTitle }}</div>
      <div class="stars">
        ⭐ <span>{{ rating }}</span>
      </div>
    </div>

    <!-- 右侧按钮 -->
    <button class="right-btn" :style="btnStyle">
      {{ buttonText }}
    </button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 16px;
  box-sizing: border-box;
}

.avatar {
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.info {
  flex: 1;
  margin-left: 10px;
  color: #6c5a4c;
}

.title {
  font-weight: 600;
}

.sub {
  opacity: 0.7;
  margin-top: 2px;
}

.stars {
  margin-top: 4px;
  color: #c69a7a;
  font-size: 12px;
}

.right-btn {
  border: none;
  background: #e0c8b6;
  color: white;
  padding: 6px 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}
</style>
