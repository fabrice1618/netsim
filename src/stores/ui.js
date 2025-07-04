import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // État de l'interface
  const showDeviceLibrary = ref(true)
  const showPropertyPanel = ref(false)
  const showNetworkDiagnostics = ref(false)
  const darkMode = ref(false)
  
  // États des dialogs spécifiques
  const showDeviceConfigDialog = ref(false)
  const showDHCPServerConfigDialog = ref(false)
  const showDNSServerConfigDialog = ref(false)
  const showHTTPServerConfigDialog = ref(false)
  const showNetworkDiagnosticsDialog = ref(false)
  
  // Dialogs ouverts (générique)
  const openDialogs = ref(new Set())
  
  // Élément sélectionné
  const selectedDevice = ref(null)
  const selectedLink = ref(null)
  
  // Notifications
  const notifications = ref([])
  
  // État du canvas
  const canvasState = ref({
    scale: 1,
    panX: 0,
    panY: 0,
    tool: 'select' // 'select', 'move', 'link', 'delete'
  })
  
  // Getters
  const hasOpenDialogs = computed(() => openDialogs.value.size > 0)
  const currentTool = computed(() => canvasState.value.tool)
  
  // Actions
  function toggleDeviceLibrary() {
    showDeviceLibrary.value = !showDeviceLibrary.value
  }
  
  function togglePropertyPanel() {
    showPropertyPanel.value = !showPropertyPanel.value
  }
  
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  function openDialog(dialogId) {
    openDialogs.value.add(dialogId)
  }
  
  function closeDialog(dialogId) {
    openDialogs.value.delete(dialogId)
  }
  
  function closeAllDialogs() {
    openDialogs.value.clear()
  }
  
  function isDialogOpen(dialogId) {
    return openDialogs.value.has(dialogId)
  }
  
  function setTool(tool) {
    canvasState.value.tool = tool
  }
  
  function setCanvasTransform(scale, panX, panY) {
    canvasState.value.scale = scale
    canvasState.value.panX = panX
    canvasState.value.panY = panY
  }
  
  function addNotification(notification) {
    const id = Date.now() + Math.random()
    notifications.value.push({
      id,
      ...notification,
      timestamp: new Date()
    })
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
    
    return id
  }
  
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function showSuccess(message) {
    return addNotification({
      type: 'success',
      message,
      title: 'Succès'
    })
  }
  
  function showError(message) {
    return addNotification({
      type: 'error',
      message,
      title: 'Erreur'
    })
  }
  
  function showWarning(message) {
    return addNotification({
      type: 'warning',
      message,
      title: 'Attention'
    })
  }
  
  function showInfo(message) {
    return addNotification({
      type: 'info',
      message,
      title: 'Information'
    })
  }
  
  // Initialisation
  function initializeUI() {
    // Détection du mode sombre système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggleDarkMode()
    }
    
    // Écoute des changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches !== darkMode.value) {
        toggleDarkMode()
      }
    })
  }
  
  return {
    // État
    showDeviceLibrary,
    showPropertyPanel,
    showNetworkDiagnostics,
    darkMode,
    
    // États des dialogs spécifiques
    showDeviceConfigDialog,
    showDHCPServerConfigDialog,
    showDNSServerConfigDialog,
    showHTTPServerConfigDialog,
    showNetworkDiagnosticsDialog,
    
    // Dialogs ouverts (générique)
    openDialogs,
    
    // Éléments sélectionnés
    selectedDevice,
    selectedLink,
    
    notifications,
    canvasState,
    
    // Getters
    hasOpenDialogs,
    currentTool,
    
    // Actions
    toggleDeviceLibrary,
    togglePropertyPanel,
    toggleDarkMode,
    openDialog,
    closeDialog,
    closeAllDialogs,
    isDialogOpen,
    setTool,
    setCanvasTransform,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    initializeUI
  }
})
