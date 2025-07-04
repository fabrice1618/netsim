<template>
  <div
    v-if="uiStore.showDeviceConfigDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeDialog"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- En-tête -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Configuration de l'équipement
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <!-- Contenu -->
      <div class="p-6">
        <div v-if="selectedDevice" class="space-y-4">
          <!-- Nom de l'équipement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              v-model="deviceConfig.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Nom de l'équipement"
            />
          </div>
          
          <!-- Adresse IP (pour les équipements réseau) -->
          <div v-if="deviceConfig.type !== 'switch' && deviceConfig.type !== 'router'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse IP
            </label>
            <input
              v-model="deviceConfig.ip"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="192.168.1.100"
            />
          </div>
          
          <!-- Masque de sous-réseau -->
          <div v-if="deviceConfig.type !== 'switch' && deviceConfig.type !== 'router'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Masque de sous-réseau
            </label>
            <input
              v-model="deviceConfig.subnet"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="255.255.255.0"
            />
          </div>
          
          <!-- Passerelle par défaut -->
          <div v-if="deviceConfig.type === 'host'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passerelle par défaut
            </label>
            <input
              v-model="deviceConfig.gateway"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="192.168.1.1"
            />
          </div>
          
          <!-- Configuration DHCP pour les hôtes -->
          <div v-if="deviceConfig.type === 'host'">
            <label class="flex items-center">
              <input
                v-model="deviceConfig.dhcp"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Utiliser DHCP
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="closeDialog"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          @click="saveConfig"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useNetworkStore } from '@/stores/network'

const uiStore = useUIStore()
const networkStore = useNetworkStore()

const deviceConfig = ref({
  name: '',
  ip: '',
  subnet: '255.255.255.0',
  gateway: '',
  dhcp: false,
  type: 'host'
})

const selectedDevice = computed(() => uiStore.selectedDevice)

const closeDialog = () => {
  uiStore.showDeviceConfigDialog = false
}

const saveConfig = () => {
  if (selectedDevice.value) {
    // Mise à jour de l'équipement avec la nouvelle configuration
    networkStore.updateDevice(selectedDevice.value.id, deviceConfig.value)
  }
  closeDialog()
}

// Charger la configuration de l'équipement sélectionné
watch(selectedDevice, (device) => {
  if (device) {
    deviceConfig.value = {
      name: device.name || '',
      ip: device.ip || '',
      subnet: device.subnet || '255.255.255.0',
      gateway: device.gateway || '',
      dhcp: device.dhcp || false,
      type: device.type || 'host'
    }
  }
}, { immediate: true })
</script>
