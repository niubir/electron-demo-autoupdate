import './assets/main.css'

// vant
import Vant from 'vant'
import 'vant/lib/index.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(Vant).mount('#app')
