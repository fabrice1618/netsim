<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- En-tête -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <button
          @click="uiStore.togglePropertyPanel()"
          class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <XMarkIcon class="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
    
    <!-- Contenu -->
    <div class="p-4 max-h-96 overflow-y-auto">
      <!-- Si aucun élément sélectionné -->
      <div v-if="!networkStore.hasSelection" class="text-center py-8">
        <CursorArrowRaysIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500 dark:text-gray-400">
          Sélectionnez un élément pour voir ses propriétés
        </p>
      </div>
      
      <!-- Propriétés d'un appareil -->
      <div v-else-if="selectedDevice" class="space-y-4">
        <DeviceProperties :device="selectedDevice" />
      </div>
      
      <!-- Propriétés d'un lien -->
      <div v-else-if="selectedLink" class="space-y-4">
        <LinkProperties :link="selectedLink" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useUIStore } from '@/stores/ui'
import { XMarkIcon, CursorArrowRaysIcon } from '@heroicons/vue/24/outline'
import DeviceProperties from './DeviceProperties.vue'
import LinkProperties from './LinkProperties.vue'

const networkStore = useNetworkStore()
const uiStore = useUIStore()

const selectedDevice = computed(() => {
  if (networkStore.selectedElementType === 'device') {
    return networkStore.devices.get(networkStore.selectedElement)
  }
  return null
})

const selectedLink = computed(() => {
  if (networkStore.selectedElementType === 'link') {
    return networkStore.links.get(networkStore.selectedElement)
  }
  return null
})

const title = computed(() => {
  if (selectedDevice.value) {
    return `${selectedDevice.value.name || selectedDevice.value.type}`
  }
  if (selectedLink.value) {
    return 'Propriétés du lien'
  }
  return 'Propriétés'
})
</script>
