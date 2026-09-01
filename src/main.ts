import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { useTrackerStore } from '@/stores/tracker'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize store on first run / app startup
const trackerStore = useTrackerStore()
trackerStore.initialize()

app.mount('#app')
