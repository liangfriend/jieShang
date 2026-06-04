import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
const rendererSrc = path.resolve(__dirname, '../deciphony/packages/deciphony-renderer/src')
console.log('chicken', path.resolve(rendererSrc, 'index.ts'))
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
        '@renderer': resolve('src/renderer/src'),
        'deciphony-renderer': path.resolve(rendererSrc, 'index.ts'),
        // 'deciphony-player': path.resolve(__dirname, '../deciphony-player/src/index.ts'),
        // 'j-player': path.resolve(__dirname, '../j-player/src/index.ts'),
        // 'deciphony-ui': path.resolve(__dirname, '../deciphony-ui/src/index.ts'),
        // '@assets': path.resolve(__dirname, '../deciphony-ui/src/assets'),
        // 必须与 deciphony-renderer 指向同一份源码，否则 @/ 与包入口会被 Vite 当成两个模块实例
        '@': rendererSrc
      }
    },
    plugins: [vue(), tailwindcss()]
  }
})
