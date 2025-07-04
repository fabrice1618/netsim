<template>
  <div class="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
    <!-- En-tête -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Équipements</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Glissez pour ajouter au réseau</p>
    </div>
    
    <!-- Recherche -->
    <div class="p-4">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un équipement..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
    
    <!-- Liste des catégories -->
    <div class="flex-1 overflow-y-auto">
      <div v-for="category in filteredCategories" :key="category.name" class="mb-6">
        <h3 class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 border-y border-gray-200 dark:border-gray-600">
          {{ category.name }}
        </h3>
        
        <div class="p-2 space-y-1">
          <div
            v-for="device in category.devices"
            :key="device.type"
            :draggable="true"
            @dragstart="startDrag($event, device)"
            @click="addDeviceToCanvas(device)"
            class="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors group"
            :title="`Ajouter ${device.name}`"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform"
              :style="{ backgroundColor: device.color + '20', color: device.color }"
            >
              <component :is="device.icon" class="w-6 h-6" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ device.name }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ device.description }}
              </p>
            </div>
            
            <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Statistiques en bas -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
      <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div class="flex justify-between">
          <span>Appareils dans le réseau:</span>
          <span class="font-medium">{{ networkStore.deviceCount }}</span>
        </div>
        <div class="flex justify-between">
          <span>Liens actifs:</span>
          <span class="font-medium">{{ networkStore.linkCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useUIStore } from '@/stores/ui'
import {
  ComputerDesktopIcon,
  ServerIcon,
  WifiIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CloudIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const networkStore = useNetworkStore()
const uiStore = useUIStore()
const searchQuery = ref('')

// Configuration des équipements disponibles
const deviceCategories = [
  {
    name: 'Hôtes',
    devices: [
      {
        type: 'computer',
        name: 'Ordinateur',
        description: 'Poste de travail standard',
        icon: ComputerDesktopIcon,
        color: '#3B82F6'
      },
      {
        type: 'laptop',
        name: 'Ordinateur portable',
        description: 'Poste mobile',
        icon: ComputerDesktopIcon,
        color: '#6366F1'
      }
    ]
  },
  {
    name: 'Serveurs',
    devices: [
      {
        type: 'dhcp-server',
        name: 'Serveur DHCP',
        description: 'Attribution automatique d\'IP',
        icon: ServerIcon,
        color: '#10B981'
      },
      {
        type: 'dns-server',
        name: 'Serveur DNS',
        description: 'Résolution de noms de domaine',
        icon: GlobeAltIcon,
        color: '#F59E0B'
      },
      {
        type: 'http-server',
        name: 'Serveur Web',
        description: 'Serveur HTTP/HTTPS',
        icon: CloudIcon,
        color: '#EF4444'
      },
      {
        type: 'file-server',
        name: 'Serveur de fichiers',
        description: 'Partage de fichiers',
        icon: ServerIcon,
        color: '#8B5CF6'
      }
    ]
  },
  {
    name: 'Infrastructure réseau',
    devices: [
      {
        type: 'switch',
        name: 'Commutateur',
        description: 'Commutation de niveau 2',
        icon: WifiIcon,
        color: '#06B6D4'
      },
      {
        type: 'router',
        name: 'Routeur',
        description: 'Routage de niveau 3',
        icon: RocketLaunchIcon,
        color: '#EC4899'
      },
      {
        type: 'hub',
        name: 'Hub',
        description: 'Répéteur simple',
        icon: WifiIcon,
        color: '#84CC16'
      }
    ]
  },
  {
    name: 'Sécurité',
    devices: [
      {
        type: 'firewall',
        name: 'Pare-feu',
        description: 'Filtrage du trafic',
        icon: ShieldCheckIcon,
        color: '#F97316'
      }
    ]
  }
]

// Filtrage des catégories selon la recherche
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return deviceCategories
  }
  
  const query = searchQuery.value.toLowerCase()
  return deviceCategories
    .map(category => ({
      ...category,
      devices: category.devices.filter(device =>
        device.name.toLowerCase().includes(query) ||
        device.description.toLowerCase().includes(query)
      )
    }))
    .filter(category => category.devices.length > 0)
})

// Gestion du drag & drop
function startDrag(event, device) {
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'device',
    deviceType: device.type,
    name: device.name
  }))
  event.dataTransfer.effectAllowed = 'copy'
}

// Ajout direct d'un équipement au centre du canvas
function addDeviceToCanvas(device) {
  // Position par défaut au centre (sera ajustée par le composant Canvas)
  const deviceId = networkStore.addDevice(device.type, 300, 200, {
    name: device.name
  })
  
  // Sélectionner le nouvel équipement
  networkStore.selectElement(deviceId, 'device')
  
  uiStore.showSuccess(`${device.name} ajouté au réseau`)
}
</script>
