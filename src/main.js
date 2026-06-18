import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuestic } from 'vuestic-ui'
import '@/style.css'
import 'vuestic-ui/styles/essential.css'
import 'vuestic-ui/styles/typography.css'

import App from '@/App.vue'
import router from '@router'
import { useAuthStore } from '@stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(createVuestic())

const authStore = useAuthStore()
authStore.initAuth().finally(() => {
  app.mount('#app')
})
