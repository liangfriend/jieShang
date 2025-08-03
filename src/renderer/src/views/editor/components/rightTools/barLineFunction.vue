<script setup lang="ts">
import {getDataWithIndex} from "@/applications/ChuangKeApplication/components/musicScore/utils/musicScoreDataUtil.ts";
import {
  removeMsSymbolContainer
} from "@/applications/ChuangKeApplication/components/musicScore/utils/changeStructureUtil.ts";
import {PropType, UnwrapRef} from "vue";
import {
  BarLine,
  ClefMsSymbol,
  MusicScore,
  MusicScoreRef,
  NoteHead
} from "@/applications/ChuangKeApplication/components/musicScore/types";
import {MsSymbolTypeEnum} from "@/applications/ChuangKeApplication/components/musicScore/musicScoreEnum.ts";

const props = defineProps({
  musicScore: {
    type: Object as PropType<MusicScore>,
    required: true
  },
  msRef: {
    type: Object as PropType<UnwrapRef<MusicScoreRef>>,
    required: true
  },
  barLine: {
    type: Object as PropType<BarLine>,
    required: true
  }
})

function deleteClef() {
  const msSymbolContainer = getDataWithIndex(props.barLine.index, props.musicScore).msSymbolContainer
  if (!msSymbolContainer) {
    console.error("索引数据出错，小节线删除失败")
    return
  }
  removeMsSymbolContainer(msSymbolContainer, props.musicScore)
}
</script>

<template>
  <div>
    <el-button @click="deleteClef">删除</el-button>
  </div>
</template>

<style scoped>

</style>