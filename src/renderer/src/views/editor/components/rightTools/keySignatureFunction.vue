<script setup lang="ts">
import {getDataWithIndex} from "@/applications/ChuangKeApplication/components/musicScore/utils/musicScoreDataUtil.ts";
import {
  removeMsSymbolContainer
} from "@/applications/ChuangKeApplication/components/musicScore/utils/changeStructureUtil.ts";
import {PropType, UnwrapRef} from "vue";
import {
  ClefMsSymbol, KeySignatureMsSymbol,
  MusicScore,
  MusicScoreRef,
  NoteHead
} from "@/applications/ChuangKeApplication/components/musicScore/types";

const props = defineProps({
  musicScore: {
    type: Object as PropType<MusicScore>,
    required: true
  },
  msRef: {
    type: Object as PropType<UnwrapRef<MusicScoreRef>>,
    required: true
  },
  keySignature: {
    type: Object as PropType<KeySignatureMsSymbol>,
    required: true
  }
})

function deleteClef() {
  const msSymbolContainer = getDataWithIndex(props.keySignature.index, props.musicScore).msSymbolContainer
  if (!msSymbolContainer) {
    console.error("索引数据出错，调号删除失败")
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