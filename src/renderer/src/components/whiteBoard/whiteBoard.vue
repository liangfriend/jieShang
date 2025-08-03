<template>
  <div class="stack whiteBoard" comment="浮动展示白板">
    <!--    v-drag-->
    <div v-drag="drag" class="floatBoard stackItem" ref="floatBoard" @mouseup="addElementMouseUp"
         :style="floatBoardStyle"
         comment="浮动展示白板，此元素可被拖动位移，背景为白色">
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, onUnmounted, PropType, Ref, ref, StyleValue} from 'vue';
import {parseAndFormatDimension} from '../../utils/stringUtils.ts';
import vDrag from './directives/drag';
import MusicScore from '@/applications/ChuangKeApplication/components/musicScore/musicScore.vue';
import {AddElementOptions} from "@/applications/ChuangKeApplication/components/whiteBoard/types";
import {whiteBoardState} from "@/applications/ChuangKeApplication/components/whiteBoard/enum.ts";


//展示板实例
const floatBoard: Ref<HTMLElement> = ref(null!);
//宽高只允许传入px,为了保证缩放功能的正常进行
const props = defineProps({
  floatBoardWidth: {
    type: Number,
    default: 100
  },
  floatBoardHeight: {
    type: Number,
    default: 100
  },
  floatBoardPosition: {
    type: String, //leftTop center
    default: 'center'
  },
  drag: {
    type: Boolean,
    default: true
  }
});
const state = ref<whiteBoardState>(whiteBoardState.normal);

onMounted(() => {

});
onUnmounted(() => {

});

const floatBoardStyle = computed(() => {
  const {value: widthValue, unit: widthUnit} = parseAndFormatDimension(props.floatBoardWidth);
  const {value: heightValue, unit: heightUnit} = parseAndFormatDimension(props.floatBoardHeight);
  const style: StyleValue = {
    width: widthValue + widthUnit,
    height: heightValue + heightUnit,
  };
  switch (props.floatBoardPosition) {
    case 'leftTop':
      //
      break;
    case 'center': {
      // 解析宽度和高度
      style.left = `calc(50% - ${widthValue / 2}${widthUnit})`;
      style.top = `calc(50% - ${heightValue / 2}${heightUnit})`;

      break;
    }
    default:
      break;
  }
  return style;
});
//-------------------------------------添加元素逻辑-------------------------------------------
//白板组件暂存区
const cacheMap = new Map();

//添加元素到暂存区
function cacheElement(element: Element, key = 'element'): void {
  cacheMap.set(key, element);

};

// 删除暂存区元素
function delCacheElement(key = 'element'): void {
  cacheMap.delete(key);
}

function addElementMouseUp(e: MouseEvent): void {
  if (state.value !== whiteBoardState.add) {
    return
  }
  const left = e.offsetX;
  const top = e.offsetY;
  const options: AddElementOptions = {
    left, top
  }
  addElement(options, 'element')
};

//元素添加
function addElement(options: AddElementOptions, key = 'element'): void {
  if (state.value !== whiteBoardState.add) {
    console.error('白板非dom添加状态')
    return
  }
  if (!cacheMap.has(key)) {
    console.error('目标dom没有被缓存进白板，请执行catchMap缓存dom或检查传入key')
    return
  }
  let element: Element = null!

  if (options.cloneNode) { // 完全克隆，不会携带addEventListener。 适合简单的dom,静态资源的添加
    element = cacheMap.get(key).cloneNode(true);
  } else { // 如果cloneNode没有传true,执行浅复制，为了避免异常，直接删除缓存的元素
    element = cacheMap.get(key)
    cacheMap.delete(key)
  }

  //这里还要套一层壳，把元素全部放到这层壳里，防止svg元素设置top,left不生效
  const shellDom = document.createElement('div');
  const rect = element.getBoundingClientRect(); //appendChild后getBoundingRect获取的宽高会变成0，而浏览器不会立即重排而是等待js执行完成，所以要提前保留几何信息
  shellDom.appendChild(element);


  shellDom.style.position = 'absolute';
  if (!options.center) {
    shellDom.style.top = options.top + 'px';
    shellDom.style.left = options.left + 'px';
  } else {
    if (element instanceof HTMLElement) {
      switch (options.center) {
        case 'vertical':
          shellDom.style.top = parseAndFormatDimension(props.floatBoardHeight).value / 2 - rect.height / 2 + 'px';
          break;
        case 'horizontal':
          shellDom.style.left = parseAndFormatDimension(props.floatBoardWidth).value / 2 - rect.width / 2 + 'px';
          break
        case 'center':
          shellDom.style.top = parseAndFormatDimension(props.floatBoardHeight).value / 2 - rect.height / 2 + 'px';
          shellDom.style.left = parseAndFormatDimension(props.floatBoardWidth).value / 2 - rect.width / 2 + 'px';
          break;
        default:
          console.error('addElement方法参数center值有误')
          break;
      }
    } else {
      console.error('center属性只能用于html元素，否则无效')
    }

  }

  floatBoard.value.appendChild(shellDom);
};

function switchState(param: whiteBoardState) {
  state.value = param
}

//-------------------------------------变量-------------------------------------------
//暴露方法
defineExpose({addElement, cacheElement, delCacheElement, switchState});

</script>
<style>
.floatBoard {
  background-color: #fff;
  box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
}

.whiteBoard {
}
</style>
<style scoped lang="scss" comment="布局">
.stack {
  position: relative;
  width: 100%;
  height: 100%;

  > .stackItem {
    position: absolute;
    display: grid;
    width: 100%;
    height: 100%;
  }
}
</style>