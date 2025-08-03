<script setup lang="ts">
import prefabWb from '../../views/prefabWhiteBoard/addedMusicScore.vue';
import {computed, onMounted, ref, Ref, UnwrapRef, watch} from 'vue';

// import mockData from "@/applications/ChuangKeApplication/components/musicScore/musicScoreData/happyBirthdayToYou.ts";
import mockData from "@/applications/ChuangKeApplication/components/musicScore/musicScoreData/test.ts";
import BottomMenu from "@/applications/ChuangKeApplication/views/editor/components/bottomMenu.vue";
import {msPlayUtils} from "@/applications/ChuangKeApplication/utils/msPlayUtils/ms-playUtils.ts";
import {MusicMapKey} from "@/applications/ChuangKeApplication/views/editor/constant.ts";
import {useRouter} from "vue-router";
import {
  MsMode,
  MsSymbolTypeEnum,
  MsTypeNameEnum, ReserveMsSymbolType
} from "@/applications/ChuangKeApplication/components/musicScore/musicScoreEnum.ts";
import RightTools from "@/applications/ChuangKeApplication/views/editor/components/rightTools/rightTools.vue";
import {MusicScoreRef} from "@/applications/ChuangKeApplication/components/musicScore/types";
import MeasureFunction from "@/applications/ChuangKeApplication/views/editor/components/rightTools/measureFunction.vue";
import BasicFunction from "@/applications/ChuangKeApplication/views/editor/components/rightTools/basicFunction.vue";
import SingleStaffFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/singleStaffFunction.vue";
import MultipleStavesFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/multipleStavesFunction.vue";
import NoteHeadFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/noteHeadFunction.vue";
import SpanSymbolFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/spanSymbolFunction.vue";
import ClefFunction from "@/applications/ChuangKeApplication/views/editor/components/rightTools/clefFunction.vue";
import KeySignatureFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/keySignatureFunction.vue";
import TimeSignatureFunction
  from "@/applications/ChuangKeApplication/views/editor/components/rightTools/timeSignatureFunction.vue";
import BarLineFunction from "@/applications/ChuangKeApplication/views/editor/components/rightTools/barLineFunction.vue";
import RestFunction from "@/applications/ChuangKeApplication/views/editor/components/rightTools/restFunction.vue";

const router = useRouter()
type addedWb = {
  getMsRef: () => UnwrapRef<MusicScoreRef>
}
const wbRef = ref(null!) as Ref<addedWb>
const msRef = computed((): UnwrapRef<MusicScoreRef> | null => {
  if (!wbRef.value) return null
  return wbRef.value.getMsRef()
})
const curModeText = ref("教学模式")
const msMode = computed(() => {
  return msRef.value?.mode
})
const currentResevedType = computed(() => {
  return msRef.value.currentResevedType
})

function changeCurrentReservedType(value: ReserveMsSymbolType) {
  if (msRef.value) {
    console.log('chicken', value)
    msRef.value.setCurrentResevedType(value)
  }
}
function switchMode() {
  if (!msRef.value) return
  if (msMode.value === MsMode.edit) {
    msRef.value.changeMode(MsMode.normal);
    curModeText.value = '编辑模式'
    wbDrag.value = true
  } else {
    msRef.value.changeMode(MsMode.edit);
    curModeText.value = '教学模式'
    wbDrag.value = false
  }
}

const play = async () => {
  console.log('chicken',)
// 存储播放序列
  await msPlayUtils.addMusicToMap(MusicMapKey.CMK, musicScoreData.value)
  await msPlayUtils.play(MusicMapKey.CMK)
};
const pause = () => {
  msPlayUtils.pause((MusicMapKey.CMK))
};
const stop = () => {
  msPlayUtils.stop((MusicMapKey.CMK))
};
const resume = () => {
  msPlayUtils.resume(MusicMapKey.CMK)
}
const wbDrag = ref(false)


const musicScoreData = ref(mockData);
const bottomMenuData = ref([{
  title: curModeText,
  callback: switchMode
}, {
  title: '播放',
  callback: play
}, {
  title: '暂停',
  callback: pause
}, {
  title: '恢复播放',
  callback: resume
}, {
  title: '停止',
  callback: stop
}]);
const musicLoaded = ref(false)
// watch(musicScoreData, (newVal) => {
//   musicLoaded.value = false
//   // musicScore发生变化时，需要更新播放器生成tonejs序列
//   msPlayUtils.addMusicToMap(MusicMapKey.CMK, newVal, () => {
//     musicLoaded.value = true
//   })
// }, {deep: true})
const currentSelected = computed(() => {
  return msRef.value?.currentSelected || null
})

onMounted(() => {
  //TEST
  window.musicScore = mockData
});

</script>
<template>
  <div class="stack">
    <div class="stackItem">
      <prefabWb ref="wbRef" class="whiteBoard"
                :wbDrag="wbDrag"
                :musicScoreData="musicScoreData"
                :msHeight="800"
                :msWidth="1000"
                :floatBoardWidth="1200"
                :floatBoardHeight="1000"
                :msMode="MsMode.normal"></prefabWb>
    </div>

    <div class="stackItem toolsLayer" comment="工具层">
      <div class="rightTools">
        <right-tools>
          <template v-slot:function>
            <div class="rightToolsFunction">
              <div>
                <el-button @click="msRef?.cancelSelect()">取消选中</el-button>
              </div>
              <measure-function v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.Measure"
                                :msRef="msRef"
                                :measure="currentSelected" :music-score="musicScoreData"></measure-function>
              <single-staff-function v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.SingleStaff"
                                     :singleStaff="currentSelected"
                                     :msRef="msRef"
                                     :music-score="musicScoreData"></single-staff-function>
              <multiple-staves-function v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MultipStaves"
                                        :multipleStaves="currentSelected"
                                        :msRef="msRef"
                                        :music-score="musicScoreData"></multiple-staves-function>
              <note-head-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && currentSelected.type === MsSymbolTypeEnum.noteHead"
                  :noteHead="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></note-head-function>
              <rest-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && currentSelected.type === MsSymbolTypeEnum.rest"
                  :rest="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></rest-function>
              <clef-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && (currentSelected.type === MsSymbolTypeEnum.clef || currentSelected.type === MsSymbolTypeEnum.clef_f)"
                  :clef="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></clef-function>
              <key-signature-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && currentSelected.type === MsSymbolTypeEnum.keySignature"
                  :keySignature="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></key-signature-function>
              <time-signature-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && currentSelected.type === MsSymbolTypeEnum.timeSignature"
                  :timeSignature="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></time-signature-function>
              <bar-line-function
                  v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.MsSymbol
                                  && (currentSelected.type === MsSymbolTypeEnum.barLine || currentSelected.type === MsSymbolTypeEnum.barLine_f)"
                  :barLine="currentSelected"
                  :msRef="msRef"
                  :music-score="musicScoreData"></bar-line-function>
              <basic-function v-if="msRef && !currentSelected?.msTypeName"
                              :current-reseved-type="currentResevedType"
                              :msRef="msRef"
                              @changeCurrentReservedType="changeCurrentReservedType"
                              :music-score="musicScoreData"></basic-function>
              <span-symbol-function v-if="msRef && currentSelected?.msTypeName === MsTypeNameEnum.SpanSymbol"
                                    :msRef="msRef"
                                    :music-score="musicScoreData"
                                    :span-symbol="currentSelected"></span-symbol-function>

            </div>
          </template>
        </right-tools>
      </div>

      <div class="bottomMenu">
        <bottom-menu v-model="bottomMenuData"></bottom-menu>
      </div>
      <div class="back" @click="router.go(-1)">返回</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.whiteBoard {
  width: 100%;
  height: 100%;
}


.bottomMenu {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.toolsLayer {
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.rightTools {
  position: absolute;
  right: 0;
  height: 100%;
  pointer-events: auto;
}

.back {
  cursor: pointer;
  position: fixed;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: antiquewhite;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 10px;
  left: 10px;
}

.rightToolsFunction {
  display: flex;
  justify-content: space-between;
  row-gap: 10px;
  flex-wrap: wrap;

  > button {
    width: 120px;
    margin-left: 0;
  }
}
</style>
