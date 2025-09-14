<script lang="ts" setup>
import { useRouter } from 'vue-router'
import CustomMenu from '@renderer/views/home/components/customMenu.vue'
import { ref } from 'vue'
import ShimmerButton from '../components/shimmerButton.vue'
import LiquidGlass from '../../components/liquidGlass'
import ThreeDBackground from './components/threeDBackground.vue'

const router = useRouter()
const goTo = (path: string) => {
  router.push(path)
}
const customMenuData = ref([
  {
    title: '创作<br/>空间',
    color: '#fff',
    callback: () => {
      goTo('/jieShang/editor')
    }
  },
  {
    title: '我的<br/>课件',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '我的<br/>曲谱',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '知识库',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '工具库',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '乐器<br/>图鉴',
    color: '#fff',
    callback: () => {
      goTo('/jieShang/instrumentHandbook')
    }
  },
  {
    title: '素养<br/>训练',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '模拟<br/>演奏',
    color: '#fff',
    callback: () => {}
  },
  {
    title: 'BB<br/>社区',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '花园',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '商城',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '主线<br/>剧情',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '主世界',
    color: '#fff',
    callback: () => {}
  },
  {
    title: '元宇宙',
    color: '#fff',
    callback: () => {}
  }
])
</script>
<template>
  <TailedCursor
    :base-thickness="30"
    :colors="['#ffffff']"
    :speed-multiplier="0.5"
    :max-age="500"
    :enable-fade="false"
    :enable-shader-effect="false"
  />
  <div class="stack">
    <div class="stackItem" comment="背景层"><three-d-background> </three-d-background></div>
    <div class="stack stackItem m-[10px]" comment="操作层">
      <div class="setting cursor-pointer">
        <div class="w-[100px] h-[40px]">
          <liquid-glass blur="0" border-radius="10px">
            <div class="center h-full">设置</div>
          </liquid-glass>
        </div>
      </div>
      <div class="exit">
        <ShimmerButton class="shadow-2xl" shimmer-size="2px">
          <span class="h-[40px] w-[100px] center"> 离开 </span>
        </ShimmerButton>
      </div>
      <div class="profile cursor-pointer">
        <div class="w-[100px] h-[40px]">
          <LiquidGlass blur="5" border-radius="10px">
            <div class="center h-full">个人信息</div>
          </LiquidGlass>
        </div>
      </div>
      <custom-menu v-model="customMenuData"></custom-menu>
    </div>
  </div>
</template>
<style scoped lang="scss">
.setting {
  top: 10px;
  left: 10px;
  position: absolute;
}

.exit {
  bottom: 10px;
  left: 10px;
  position: absolute;
}

.profile {
  top: 10px;
  right: 10px;
  position: absolute;
}
</style>
