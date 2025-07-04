<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
    <!-- Logo et titre -->
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </div>
      <div>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">NetSim v2</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">Network Simulator</p>
      </div>
    </div>
    
    <!-- Outils principaux -->
    <div class="flex items-center space-x-1">
      <!-- Outils de sélection -->
      <div class="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <button
          v-for="tool in tools"
          :key="tool.id"
          @click="setTool(tool.id)"
          :class="[
            'p-2 rounded transition-colors',
            uiStore.currentTool === tool.id
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
          :title="tool.name"
        >
          <component :is="tool.icon" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Séparateur -->
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <!-- Actions réseau -->
      <div class="flex items-center space-x-1">
        <button
          @click="networkStore.undo()"
          :disabled="!networkStore.canUndo"
          class="btn-ghost p-2"
          title="Annuler (Ctrl+Z)"
        >
          <ArrowUturnLeftIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="networkStore.redo()"
          :disabled="!networkStore.canRedo"
          class="btn-ghost p-2"
          title="Refaire (Ctrl+Y)"
        >
          <ArrowUturnRightIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="saveNetwork"
          class="btn-ghost p-2"
          title="Sauvegarder (Ctrl+S)"
        >
          <DocumentArrowDownIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="loadNetwork"
          class="btn-ghost p-2"
          title="Charger"
        >
          <DocumentArrowUpIcon class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Séparateur -->
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <!-- Panneau -->
      <div class="flex items-center space-x-1">
        <button
          @click="uiStore.toggleDeviceLibrary()"
          :class="[
            'btn-ghost p-2',
            uiStore.showDeviceLibrary ? 'bg-primary-100 text-primary-700' : ''
          ]"
          title="Bibliothèque d'équipements"
        >
          <Squares2X2Icon class="w-4 h-4" />
        </button>
        
        <button
          @click="uiStore.togglePropertyPanel()"
          :class="[
            'btn-ghost p-2',
            uiStore.showPropertyPanel ? 'bg-primary-100 text-primary-700' : ''
          ]"
          title="Propriétés"
        >
          <AdjustmentsHorizontalIcon class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Séparateur -->
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
      
      <!-- Paramètres -->
      <button
        @click="uiStore.toggleDarkMode()"
        class="btn-ghost p-2"
        title="Basculer le mode sombre"
      >
        <SunIcon v-if="uiStore.darkMode" class="w-4 h-4" />
        <MoonIcon v-else class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Statistiques réseau (droite) -->
    <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-center space-x-1">
        <ComputerDesktopIcon class="w-4 h-4" />
        <span>{{ networkStore.deviceCount }}</span>
      </div>
      <div class="flex items-center space-x-1">
        <LinkIcon class="w-4 h-4" />
        <span>{{ networkStore.linkCount }}</span>
      </div>
      <div
        v-if="networkStore.simulationRunning"
        class="flex items-center space-x-1 text-green-600 dark:text-green-400"
      >
        <PlayIcon class="w-4 h-4 animate-pulse" />
        <span>Simulation active</span>
      </div>
    </div>
  </header>
  
  <!-- Input file caché pour l'upload -->
  <input
    ref="fileInput"
    type="file"
    accept=".json"
    @change="handleFileUpload"
    class="hidden"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useNetworkStore } from '@/stores/network'
import {
  CursorArrowRaysIcon,
  HandRaisedIcon,
  LinkIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

const uiStore = useUIStore()
const networkStore = useNetworkStore()
const fileInput = ref(null)

// Outils disponibles
const tools = [
  {
    id: 'select',
    name: 'Sélectionner',
    icon: CursorArrowRaysIcon
  },
  {
    id: 'move',
    name: 'Déplacer',
    icon: HandRaisedIcon
  },
  {
    id: 'link',
    name: 'Créer un lien',
    icon: LinkIcon
  },
  {
    id: 'delete',
    name: 'Supprimer',
    icon: TrashIcon
  }
]

function setTool(toolId) {
  uiStore.setTool(toolId)
}

function saveNetwork() {
  try {
    const networkData = networkStore.saveNetwork()
    const blob = new Blob([networkData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `network-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    uiStore.showSuccess('Réseau sauvegardé avec succès')
  } catch (error) {
    uiStore.showError('Erreur lors de la sauvegarde')
  }
}

function loadNetwork() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const success = networkStore.loadNetwork(e.target.result)
      if (success) {
        uiStore.showSuccess('Réseau chargé avec succès')
      } else {
        uiStore.showError('Erreur lors du chargement du fichier')
      }
    } catch (error) {
      uiStore.showError('Fichier invalide')
    }
  }
  reader.readAsText(file)
  
  // Réinitialiser l'input
  event.target.value = ''
}
</script>
