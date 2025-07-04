<template>
  <div class="space-y-4">
    <!-- Type et icône de l'appareil -->
    <div class="flex items-center space-x-3">
      <div
        class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg"
        :style="{ backgroundColor: getDeviceColor(device.type) }"
      >
        {{ getDeviceIcon(device.type) }}
      </div>
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white">{{ device.name }}</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ device.type.replace('-', ' ') }}</p>
      </div>
    </div>
    
    <!-- Informations générales -->
    <div class="space-y-3">
      <div>
        <label class="form-label">Nom</label>
        <input
          v-model="deviceName"
          @blur="updateDeviceName"
          type="text"
          class="form-input"
          placeholder="Nom de l'appareil"
        />
      </div>
      
      <div>
        <label class="form-label">Groupe</label>
        <input
          v-model="deviceGroup"
          @blur="updateDeviceGroup"
          type="text"
          class="form-input"
          placeholder="Groupe (optionnel)"
        />
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="form-label">Position X</label>
          <input
            v-model.number="deviceX"
            @blur="updateDevicePosition"
            type="number"
            class="form-input"
            min="0"
          />
        </div>
        <div>
          <label class="form-label">Position Y</label>
          <input
            v-model.number="deviceY"
            @blur="updateDevicePosition"
            type="number"
            class="form-input"
            min="0"
          />
        </div>
      </div>
    </div>
    
    <!-- État de l'appareil -->
    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center space-x-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="device.online !== false ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ device.online !== false ? 'En ligne' : 'Hors ligne' }}
        </span>
      </div>
      <button
        @click="toggleDeviceOnline"
        class="text-xs px-2 py-1 rounded"
        :class="device.online !== false ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
      >
        {{ device.online !== false ? 'Déconnecter' : 'Connecter' }}
      </button>
    </div>
    
    <!-- Ports/Interfaces -->
    <div v-if="device.ports && device.ports.length > 0">
      <h5 class="form-label mb-2">Interfaces réseau</h5>
      <div class="space-y-2">
        <div
          v-for="(port, index) in device.ports"
          :key="index"
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <div class="flex items-center space-x-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="port.connected ? 'bg-blue-500' : 'bg-gray-400'"
            ></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Interface {{ index }} ({{ port.type }})
            </span>
          </div>
          <span class="text-xs text-gray-500">
            {{ port.connected ? 'Connecté' : 'Libre' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Applications/Services -->
    <div v-if="device.apps && device.apps.length > 0">
      <h5 class="form-label mb-2">Services</h5>
      <div class="space-y-1">
        <div
          v-for="app in device.apps"
          :key="app"
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">
            {{ app.replace('-', ' ') }}
          </span>
          <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
            Actif
          </span>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="pt-3 border-t border-gray-200 dark:border-gray-600">
      <div class="flex space-x-2">
        <button
          @click="openConfiguration"
          class="btn-primary flex-1"
        >
          <CogIcon class="w-4 h-4 mr-2" />
          Configurer
        </button>
        <button
          @click="deleteDevice"
          class="btn-danger"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useUIStore } from '@/stores/ui'
import { CogIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const networkStore = useNetworkStore()
const uiStore = useUIStore()

// Propriétés éditables
const deviceName = ref(props.device.name)
const deviceGroup = ref(props.device.group || '')
const deviceX = ref(props.device.x)
const deviceY = ref(props.device.y)

// Watchers pour synchroniser avec les props
watch(() => props.device.name, (newName) => {
  deviceName.value = newName
})

watch(() => props.device.group, (newGroup) => {
  deviceGroup.value = newGroup || ''
})

watch(() => props.device.x, (newX) => {
  deviceX.value = newX
})

watch(() => props.device.y, (newY) => {
  deviceY.value = newY
})

// Actions
function updateDeviceName() {
  if (deviceName.value !== props.device.name) {
    networkStore.updateDevice(props.device.id, { name: deviceName.value })
  }
}

function updateDeviceGroup() {
  const group = deviceGroup.value.trim() || null
  if (group !== props.device.group) {
    networkStore.updateDevice(props.device.id, { group })
  }
}

function updateDevicePosition() {
  if (deviceX.value !== props.device.x || deviceY.value !== props.device.y) {
    networkStore.moveDevice(props.device.id, deviceX.value, deviceY.value)
  }
}

function toggleDeviceOnline() {
  const newOnlineState = props.device.online === false
  networkStore.updateDevice(props.device.id, { online: newOnlineState })
  uiStore.showSuccess(newOnlineState ? 'Appareil connecté' : 'Appareil déconnecté')
}

function openConfiguration() {
  // Ouvrir la configuration spécifique selon le type d'appareil
  switch (props.device.type) {
    case 'dhcp-server':
      uiStore.openDialog('dhcp-server-config')
      break
    case 'dns-server':
      uiStore.openDialog('dns-server-config')
      break
    case 'http-server':
      uiStore.openDialog('http-server-config')
      break
    default:
      uiStore.openDialog('device-config')
  }
}

function deleteDevice() {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${props.device.name}" ?`)) {
    networkStore.removeDevice(props.device.id)
    uiStore.showSuccess('Appareil supprimé')
  }
}

// Utilitaires
function getDeviceColor(type) {
  const colors = {
    computer: '#3B82F6',
    'dhcp-server': '#10B981',
    'dns-server': '#F59E0B',
    'http-server': '#EF4444',
    switch: '#06B6D4',
    router: '#EC4899',
    firewall: '#F97316'
  }
  return colors[type] || '#6B7280'
}

function getDeviceIcon(type) {
  const icons = {
    computer: '💻',
    'dhcp-server': '🔄',
    'dns-server': '🌐',
    'http-server': '☁️',
    switch: '📡',
    router: '🚀',
    firewall: '🛡️'
  }
  return icons[type] || '❓'
}
</script>
