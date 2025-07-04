<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">
    <div class="flex items-center justify-between">
      <!-- Statut de la simulation -->
      <div class="flex items-center space-x-4">
        <span class="text-gray-600 dark:text-gray-300">
          {{ simulationStatus }}
        </span>
        <span v-if="networkStore.deviceCount > 0" class="text-gray-500 dark:text-gray-400">
          {{ networkStore.deviceCount }} {{ networkStore.deviceCount === 1 ? 'équipement' : 'équipements' }}
        </span>
        <span v-if="networkStore.linkCount > 0" class="text-gray-500 dark:text-gray-400">
          {{ networkStore.linkCount }} {{ networkStore.linkCount === 1 ? 'liaison' : 'liaisons' }}
        </span>
      </div>
      
      <!-- Informations sur les performances -->
      <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="fps > 0">{{ fps }} FPS</span>
        <span v-if="uiStore.selectedDevice">
          Sélectionné: {{ uiStore.selectedDevice.name || uiStore.selectedDevice.id }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useNetworkStore } from '@/stores/network'

const uiStore = useUIStore()
const networkStore = useNetworkStore()

// Suivi des performances
const fps = ref(0)
let frameCount = 0
let lastTime = Date.now()

const simulationStatus = computed(() => {
  if (networkStore.isSimulating) {
    return networkStore.isPlaying ? 'Simulation en cours...' : 'Simulation en pause'
  }
  return 'Prêt'
})

// Calcul du FPS
const updateFPS = () => {
  frameCount++
  const currentTime = Date.now()
  
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
}

let animationId = null

onMounted(() => {
  const animate = () => {
    updateFPS()
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>
