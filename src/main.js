import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// Création de l'application Vue
const app = createApp(App)

// Configuration du store Pinia
const pinia = createPinia()
app.use(pinia)

// Montage de l'application
app.mount('#app')
