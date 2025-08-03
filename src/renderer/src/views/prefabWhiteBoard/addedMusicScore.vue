<script setup lang="ts">
import WhiteBoard from "@/applications/ChuangKeApplication/components/whiteBoard/whiteBoard.vue";
import MusicScoreVue from "@/applications/ChuangKeApplication/components/musicScore/musicScore.vue";
import { onMounted, PropType, Ref, ref} from "vue";
import type {MusicScore, MusicScoreRef} from "@/applications/ChuangKeApplication/components/musicScore/types";
import {MsMode} from "@/applications/ChuangKeApplication/components/musicScore/musicScoreEnum.ts";
import {AddElementOptions, WBElement} from "@/applications/ChuangKeApplication/components/whiteBoard/types";
import {whiteBoardState} from "@/applications/ChuangKeApplication/components/whiteBoard/enum.ts";

const props = defineProps({
  wbDrag: {
    default: true,
    type: Boolean
  },
  floatBoardWidth: {
    default: 1000,
    type: Number
  },
  floatBoardHeight: {
    default: 800,
    type: Number
  },
  musicScoreData: {
    required: true,
    type: Object as PropType<MusicScore>
  },
  msHeight: {
    default: 800,
    type: Number
  },
  msWidth: {
    default: 1000,
    type: Number
  },
  msMode: {
    type: Object as PropType<MsMode>,
    default: MsMode.edit,
  }
})

let container: HTMLElement | null = null
const msRef = ref<MusicScoreRef>(null!)

const wbRef: Ref<WBElement> = ref(null!);


// 添加musicScore到白板中心
function initMusicScore() {
  if (!msRef.value) {
    console.error("初始化失败，musicScore实例不存在")
    return
  }
  const options: AddElementOptions = {
    center: 'center',
    cloneNode: false
  }
  wbRef.value.switchState(whiteBoardState.add)
  wbRef.value.cacheElement(msRef.value.root, 'musicScore');
  wbRef.value.addElement(options, 'musicScore')
  wbRef.value.switchState(whiteBoardState.normal)
  wbRef.value.delCacheElement('musicScore')


  // 移除 DOM 这行代码似乎是可有可无
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
}

function getMsRef() {
  return msRef.value
}

onMounted(() => {
  initMusicScore()
});
defineExpose({getMsRef})
</script>

<template>
  <whiteBoard ref="wbRef" :drag="wbDrag" :floatBoardWidth="floatBoardWidth"
              :floatBoardHeight="floatBoardHeight"></whiteBoard>
  <div>
    <MusicScoreVue ref="msRef" :music-score="musicScoreData" :height="msHeight" :width="msWidth" :mode="msMode">

    </MusicScoreVue>
  </div>
</template>

<style scoped>

</style>
