import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import './style.scss'
import './inspira.css'
import 'element-plus/dist/index.css'
import 'tailwindcss/index.css'
import 'deciphony-render/dist/deciphony-render.css'
import deciphonyUI from 'deciphony-ui'
import 'deciphony-ui/css'
import router from './router'

//初始化函数，因为路由挂载是异步的，所以把这些包含在一个init函数中执行
async function init(): Promise<void> {
  //全局变量设置
  const app = createApp(App)
  app.use(router).use(deciphonyUI).use(ElementPlus).mount('#app')
}

//初始化
init()
