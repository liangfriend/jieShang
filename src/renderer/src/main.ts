import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './base.css'
import '@renderer/dr-extensions/dr-play-highlight/playHighlight.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from '@renderer/i18n'
import { usePlayStore } from '@renderer/store/play.store'
import { useMidiStore } from '@renderer/store/midi.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(ElementPlus).use(router).use(i18n)

void usePlayStore().init()
void useMidiStore().init()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 自定义指令注册
app.mount('#app')
