<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-center space-x-2">
      <!-- Bouton Play/Pause -->
      <button
        @click="toggleSimulation"
        class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
        :class="networkStore.isPlaying 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'bg-green-500 hover:bg-green-600 text-white'"
        :title="networkStore.isPlaying ? 'Pause' : 'Play'"
      >
        <svg v-if="!networkStore.isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5v10l8-5-8-5z"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
        </svg>
      </button>
      
      <!-- Bouton Stop -->
      <button
        @click="stopSimulation"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
        title="Stop"
        :disabled="!networkStore.isSimulating"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 6h8v8H6V6z"/>
        </svg>
      </button>
      
      <!-- Contrôle de vitesse -->
      <div class="flex items-center space-x-2 ml-4">
        <span class="text-sm text-gray-600 dark:text-gray-300">Vitesse:</span>
        <select
          v-model="simulationSpeed"
          @change="updateSimulationSpeed"
          class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
        </select>
      </div>
      
      <!-- Bouton Step -->
      <button
        @click="stepSimulation"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
        title="Étape suivante"
        :disabled="networkStore.isPlaying"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4v12l7-6-7-6zM3 4h2v12H3V4z"/>
        </svg>
      </button>
    </div>
    
    <!-- Indicateur de temps de simulation -->
    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      Temps: {{ formatTime(networkStore.simulationTime) }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNetworkStore } from '@/stores/network'

const networkStore = useNetworkStore()
const simulationSpeed = ref(1)

const toggleSimulation = () => {
  if (networkStore.isPlaying) {
    networkStore.pauseSimulation()
  } else {
    networkStore.startSimulation()
  }
}

const stopSimulation = () => {
  networkStore.stopSimulation()
}

const stepSimulation = () => {
  networkStore.stepSimulation()
}

const updateSimulationSpeed = () => {
  networkStore.setSimulationSpeed(simulationSpeed.value)
}

const formatTime = (time) => {
  const seconds = Math.floor(time / 1000)
  const milliseconds = time % 1000
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`
}

// Synchroniser la vitesse avec le store
watch(() => networkStore.simulationSpeed, (newSpeed) => {
  simulationSpeed.value = newSpeed
})
</script>
