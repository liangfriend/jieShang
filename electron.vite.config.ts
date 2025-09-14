import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
// 引入@tailwindcss/vite插件，在编译时自动将class类名对应的样式提取出来添加到style标签中
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    assetsInclude: ['**/*.glb'], //TODO 记录笔记
    plugins: [vue(), tailwindcss()]
  }
})
