<template>
  <div id="app" class="h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
    <!-- Barre d'outils principale -->
    <ToolbarV2 />
    
    <!-- Interface principale -->
    <div class="flex h-full pt-16">
      <!-- Bibliothèque d'équipements -->
      <DeviceLibrary 
        v-if="uiStore.showDeviceLibrary"
        class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      />
      
      <!-- Zone de simulation principale -->
      <div class="flex-1 relative">
        <NetworkCanvas class="w-full h-full" />
        
        <!-- Contrôles d'animation (overlay) -->
        <SimulationControls 
          class="absolute top-4 left-4 z-10"
        />
        
        <!-- Panneau de propriétés (conditionnel) -->
        <PropertyPanel 
          v-if="uiStore.showPropertyPanel"
          class="absolute top-4 right-4 w-80 z-10"
        />
      </div>
    </div>
    
    <!-- Barre de statut -->
    <StatusBar />
    
    <!-- Dialogs modaux -->
    <DeviceConfigDialog />
    <DHCPServerConfigDialog />
    <DNSServerConfigDialog />
    <HTTPServerConfigDialog />
    <NetworkDiagnosticsDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useNetworkStore } from '@/stores/network'

// Composants UI
import ToolbarV2 from '@/components/ui/ToolbarV2.vue'
import DeviceLibrary from '@/components/ui/DeviceLibrary.vue'
import PropertyPanel from '@/components/ui/PropertyPanel.vue'
import StatusBar from '@/components/ui/StatusBar.vue'

// Composants réseau
import NetworkCanvas from '@/components/network/NetworkCanvas.vue'
import SimulationControls from '@/components/network/SimulationControls.vue'

// Dialogs
import DeviceConfigDialog from '@/components/dialogs/DeviceConfig.vue'
import DHCPServerConfigDialog from '@/components/dialogs/DHCPServerConfig.vue'
import DNSServerConfigDialog from '@/components/dialogs/DNSServerConfig.vue'
import HTTPServerConfigDialog from '@/components/dialogs/HTTPServerConfig.vue'
import NetworkDiagnosticsDialog from '@/components/dialogs/NetworkDiagnostics.vue'

// Stores
const uiStore = useUIStore()
const networkStore = useNetworkStore()

onMounted(() => {
  // Initialisation de l'application
  console.log(' NetSim v2 démarré avec Vue 3')
  
  // Chargement des données initiales si disponibles
  if (window.NetworkSimulator?.initialdata) {
    networkStore.loadNetwork(window.NetworkSimulator.initialdata)
  }
  
  // Configuration des raccourcis clavier globaux
  setupKeyboardShortcuts()
})

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + S : Sauvegarder
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      networkStore.saveNetwork()
    }
    
    // Ctrl/Cmd + Z : Annuler
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      networkStore.undo()
    }
    
    // Ctrl/Cmd + Y ou Ctrl/Cmd + Shift + Z : Refaire
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault()
      networkStore.redo()
    }
    
    // Suppr : Supprimer l'élément sélectionné
    if (event.key === 'Delete' && networkStore.selectedElement) {
      networkStore.deleteSelectedElement()
    }
    
    // Échap : Déselectionner tout
    if (event.key === 'Escape') {
      networkStore.clearSelection()
      uiStore.closeAllDialogs()
    }
  })
}
</script>

<style>
/* Styles globaux pour l'application */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbars personnalisées */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Transitions globales */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>
