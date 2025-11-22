<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useNodeManager } from '@renderer/composables/useNodeManager'

const props = defineProps({
  modelValue: {
    type: String,
    default: `const storyNode = editorNodeMap.get(1).node
return true`
  },
  height: {
    type: String,
    default: '400px'
  },
  width: {
    type: String,
    default: '400px'
  }
})
const { editorNodeMap } = useNodeManager()
const emit = defineEmits(['update:modelValue', 'run'])

const editorEl = ref<HTMLElement | null>(null)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

/**
 * 初始化编辑器
 */
onMounted(() => {
  monacoEditor = monaco.editor.create(editorEl.value!, {
    language: 'javascript',
    theme: 'vs-dark',
    value: props.modelValue,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14
  })

  // 监听编辑器内部变化 → emit 给父组件
  monacoEditor.onDidChangeModelContent(() => {
    const newVal = monacoEditor!.getValue()
    emit('update:modelValue', newVal)
  })
})

/**
 * 监听父组件 v-model 值变化 → 更新到编辑器
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (monacoEditor && monacoEditor.getValue() !== newVal) {
      monacoEditor.setValue(newVal)
    }
  }
)

/**
 * 销毁编辑器
 */
onBeforeUnmount(() => {
  monacoEditor?.dispose()
})

/**
 * 执行当前编辑器代码
 */
function runCode() {
  if (!monacoEditor) return

  const code = monacoEditor.getValue()
  try {
    // 提供一个沙盒逻辑，避免污染全局
    const fn = new Function(
      'editorNodeMap',
      `
      try {
        ${code}
      } catch(e) {
        return { error: e.message };
      }
    `
    )
    // 防止编辑器组件真的修改了editorNodeMap
    const clonedData = JSON.parse(JSON.stringify(editorNodeMap.value))
    const result = fn(clonedData)
    emit('run', result)
  } catch (e: any) {
    emit('run', { error: e.message, msg: '某个代码编辑器里的代码语法有误' })
  }
}

// 防止写css的时候被认为是json报错，只保留js
self.MonacoEnvironment = {
  // 提供一个定义worker路径的全局变量
  getWorker(_: unknown, label: string): Worker {
    // if (label === 'json') {
    //   return new jsonWorker();
    // }
    // if (label === 'css' || label === 'scss' || label === 'less') {
    //   return new cssWorker();
    // }
    // if (label === 'html' || label === 'handlebars' || label === 'razor') {
    //   return new htmlWorker();
    // }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    // 基础功能文件， 提供了所有语言通用功能 无论使用什么语言，monaco都会去加载他
    return new editorWorker()
  }
}
</script>

<template>
  <!-- 编辑器 -->
  <div ref="editorEl" :style="{ width: width, height: height }"></div>

  <!-- 运行按钮 -->
  <!--  <button @click="runCode">运行测试代码</button>-->
</template>
