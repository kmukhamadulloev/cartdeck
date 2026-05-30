import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faArrowsRotate,
  faCheck,
  faChevronDown,
  faFloppyDisk,
  faGear,
  faPause,
  faPlay,
  faUpload,
  faVolumeHigh,
  faVolumeXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

library.add(
  faArrowLeft,
  faArrowsRotate,
  faCheck,
  faChevronDown,
  faFloppyDisk,
  faGear,
  faPause,
  faPlay,
  faUpload,
  faVolumeHigh,
  faVolumeXmark,
  faXmark,
)

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router)

app.mount('#app')
