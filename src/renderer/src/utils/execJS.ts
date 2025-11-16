import { useNodeManager } from '@renderer/composables/useNodeManager'
import { CSSProperties } from 'vue'

const { editorNodeMap } = useNodeManager()

export function runCode(code: string) {
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
    return fn(editorNodeMap.value)
  } catch (e: any) {
    console.log('chicken', e)
    return e
  }
}

export function parseStyle(str: string): CSSProperties {
  try {
    return new Function(`return (${str})`)()
  } catch (e) {
    console.error('解析样式失败', e)
    return {}
  }
}
