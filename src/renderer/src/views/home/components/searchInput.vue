<script setup lang="ts">
import { computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '38px'
  },
  size: {
    type: String,
    default: '16px' // 图标/字体大小
  },
  btnWidth: {
    type: String,
    default: '68px' // 按钮宽度
  },
  placeholder: {
    type: String,
    default: '搜索首页'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const onSearch = () => emit('search', props.modelValue)
const updateValue = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)

// 计算样式：保持字符串原样（px/%/rem...都支持）
const wrapperStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

const iconStyle = computed(() => ({
  fontSize: props.size
}))

const btnStyle = computed(() => ({
  width: props.btnWidth,
  height: props.height
}))
</script>

<template>
  <div class="search-wrapper" :style="wrapperStyle">
    <!-- 左侧图标 -->
    <el-icon class="left-icon" :style="iconStyle">
      <Search />
    </el-icon>

    <!-- 输入框 -->
    <input
      class="search-input"
      :placeholder="placeholder"
      :style="{ fontSize: size }"
      :value="modelValue"
      @input="updateValue"
      @keyup.enter="onSearch"
    />

    <!-- 右侧按钮 -->
    <button class="right-btn" :style="btnStyle" @click="onSearch">
      <el-icon class="right-icon" :style="iconStyle">
        <Search />
      </el-icon>
    </button>
  </div>
</template>

<style scoped>
.search-wrapper {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  backdrop-filter: blur(4px);
}

/* 左边搜索图标 */
.left-icon {
  color: #b8b8b8;
}

/* 输入框 */
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  margin-left: 8px;
  color: #555;
}

.search-input::placeholder {
  color: #d3d3d3;
}

/* 右侧按钮 */
.right-btn {
  background: #c69a7a;
  border: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.right-icon {
  color: #fff;
}
</style>
