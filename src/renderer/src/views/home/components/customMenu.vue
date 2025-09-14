<template>
  <div class="container hidden-scrollbar" ref="menuWrapperRef">
    <div class="hidden-scrollbar flex" ref="containerRef">
      <div class="item" v-for="item in modelValue" @click="() => item.callback?.()">
        <liquid-glass blur="0" border-radius="10px">
          <div
            class="center w-full h-full"
            v-html="item.title"
            :style="{ color: item.color }"
          ></div>
        </liquid-glass>
      </div>
    </div>
    <div class="shrink-0 cursor-pointer" ref="gearRef" @click="foldMenu">
      <img :src="gearSvg" class="h-[60px] w-[60px]" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LiquidGlass from '@renderer/components/liquidGlass'
import gearSvg from '@renderer/assets/svg/home/gear.svg'
import { gsap } from 'gsap'

type MenuListItem = {
  title: string
  color?: string
  callback?: () => void
  children?: [] // 二级菜单做二期
}
const props = defineProps({
  modelValue: {
    type: Array<MenuListItem>,
    default: () => []
  }
})
const isFolded = ref(false) // 是否收起
const menuWrapperRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const gearRef = ref<HTMLElement | null>(null)
function foldMenu() {
  console.log('chicken')

  if (!menuWrapperRef.value || !gearRef.value) return
  if (!isFolded.value) {
    // 收起
    gsap.to(containerRef.value, {
      x: '100%', // 往右推到看不见（值可调）
      duration: 2,
      opacity: 0,
      ease: 'power2.inOut'
    })
    gsap.to(gearRef.value, {
      rotate: 540,
      duration: 2,
      ease: 'power2.inOut'
    })
  } else {
    // 展开
    gsap.to(containerRef.value, {
      x: 0,
      opacity: 1,
      duration: 2,
      ease: 'power2.inOut'
    })
    gsap.to(gearRef.value, {
      rotate: 0,
      duration: 2,
      ease: 'power2.inOut'
    })
  }

  isFolded.value = !isFolded.value
}
onMounted(() => {
  // 滑轮设为横向滚动
  containerRef.value.addEventListener(
    'wheel',
    function (event) {
      this.scrollLeft += event.deltaY
    },
    { passive: true }
  )
})
</script>
<style scoped>
.container {
  display: flex;
  position: absolute;
  bottom: 10px;
  right: 10px;

  width: 70%;
  overflow-x: scroll;
  * {
    direction: rtl;
  }
}

.item {
  flex-shrink: 0;
  margin-right: 20px;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
</style>
