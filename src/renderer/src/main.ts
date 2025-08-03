import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@renderer/router'


//初始化函数，因为路由挂载是异步的，所以把这些包含在一个init函数中执行
async function init(): Promise<void> {
  //全局变量设置
  const app = createApp(App)

  app.use(router).use(ElementPlus).mount('#app')
}

//chuangkeApplication
//初始化
init()
