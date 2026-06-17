import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './base.css'
import '@renderer/dr-extensions/dr-play-highlight/playHighlight.css'
import '@renderer/views/practice/practiceStaffDim.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from '@renderer/i18n'
import { usePlayStore } from '@renderer/store/play.store'
import { useMidiStore } from '@renderer/store/midi.store'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import { initCollectionActiveStorage } from '@renderer/utils/collection/collectionActiveStorage'
import { initDefaultCollectionSelection } from '@renderer/utils/collection/initCollectionSelection'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(ElementPlus).use(router).use(i18n)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

async function bootstrap() {
  initCollectionActiveStorage()
  await initDefaultCollectionSelection()
  void usePlayStore().init()
  void useMidiStore().init()
  void useMetronomeStore().init()
  useGameSettingsStore().init()
  app.mount('#app')
}

void bootstrap()
