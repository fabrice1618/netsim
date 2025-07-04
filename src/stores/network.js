import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useNetworkStore = defineStore('network', () => {
  // État du réseau
  const devices = ref(new Map())
  const links = ref(new Map())
  const selectedElement = ref(null)
  const selectedElementType = ref(null) // 'device' | 'link' | null
  
  // Historique pour undo/redo
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50
  
  // État de la simulation
  const simulationRunning = ref(false)
  const isPlaying = ref(false)
  const isSimulating = computed(() => simulationRunning.value)
  const simulationSpeed = ref(1)
  const simulationTime = ref(0)
  
  // Messages réseau en transit
  const networkMessages = ref([])
  
  // Getters
  const deviceCount = computed(() => devices.value.size)
  const linkCount = computed(() => links.value.size)
  const hasSelection = computed(() => selectedElement.value !== null)
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  
  // Computed arrays for template compatibility
  const devicesArray = computed(() => Array.from(devices.value.values()))
  const linksArray = computed(() => Array.from(links.value.values()))
  
  // Actions - Gestion des appareils
  function addDevice(type, x = 100, y = 100, config = {}) {
    const device = {
      id: uuidv4(),
      type,
      x,
      y,
      name: config.name || `${type}-${deviceCount.value + 1}`,
      group: config.group || null,
      ports: getDefaultPorts(type),
      apps: getDefaultApps(type),
      ...config
    }
    
    devices.value.set(device.id, device)
    saveToHistory('add_device', { device })
    
    return device.id
  }
  
  function removeDevice(deviceId) {
    const device = devices.value.get(deviceId)
    if (!device) return false
    
    // Supprimer tous les liens connectés à cet appareil
    const connectedLinks = Array.from(links.value.values())
      .filter(link => link.device1 === deviceId || link.device2 === deviceId)
    
    connectedLinks.forEach(link => removeLink(link.id))
    
    devices.value.delete(deviceId)
    
    if (selectedElement.value === deviceId) {
      clearSelection()
    }
    
    saveToHistory('remove_device', { device, connectedLinks })
    
    return true
  }
  
  function updateDevice(deviceId, updates) {
    const device = devices.value.get(deviceId)
    if (!device) return false
    
    const oldDevice = { ...device }
    Object.assign(device, updates)
    
    saveToHistory('update_device', { deviceId, oldDevice, newDevice: { ...device } })
    
    return true
  }
  
  function moveDevice(deviceId, x, y) {
    const device = devices.value.get(deviceId)
    if (!device) return false
    
    // const oldPosition = { x: device.x, y: device.y }
    device.x = x
    device.y = y
    
    // Pas d'historique pour les mouvements (trop fréquent)
    // saveToHistory('move_device', { deviceId, oldPosition, newPosition: { x, y } })
    
    return true
  }
  
  // Actions - Gestion des liens
  function addLink(device1Id, port1, device2Id, port2) {
    const device1 = devices.value.get(device1Id)
    const device2 = devices.value.get(device2Id)
    
    if (!device1 || !device2) return false
    
    // Vérifier que les ports sont disponibles
    if (!isPortAvailable(device1Id, port1) || !isPortAvailable(device2Id, port2)) {
      return false
    }
    
    const link = {
      id: uuidv4(),
      device1: device1Id,
      port1,
      device2: device2Id,
      port2,
      type: 'ethernet',
      status: 'active'
    }
    
    links.value.set(link.id, link)
    
    // Marquer les ports comme utilisés
    device1.ports[port1].connected = true
    device1.ports[port1].linkId = link.id
    device2.ports[port2].connected = true
    device2.ports[port2].linkId = link.id
    
    saveToHistory('add_link', { link })
    
    return link.id
  }
  
  function removeLink(linkId) {
    const link = links.value.get(linkId)
    if (!link) return false
    
    // Libérer les ports
    const device1 = devices.value.get(link.device1)
    const device2 = devices.value.get(link.device2)
    
    if (device1 && device1.ports[link.port1]) {
      device1.ports[link.port1].connected = false
      device1.ports[link.port1].linkId = null
    }
    
    if (device2 && device2.ports[link.port2]) {
      device2.ports[link.port2].connected = false
      device2.ports[link.port2].linkId = null
    }
    
    links.value.delete(linkId)
    
    if (selectedElement.value === linkId) {
      clearSelection()
    }
    
    saveToHistory('remove_link', { link })
    
    return true
  }
  
  // Actions - Sélection
  function selectElement(elementId, elementType) {
    selectedElement.value = elementId
    selectedElementType.value = elementType
  }
  
  function clearSelection() {
    selectedElement.value = null
    selectedElementType.value = null
  }
  
  function deleteSelectedElement() {
    if (!selectedElement.value) return false
    
    if (selectedElementType.value === 'device') {
      return removeDevice(selectedElement.value)
    } else if (selectedElementType.value === 'link') {
      return removeLink(selectedElement.value)
    }
    
    return false
  }
  
  // Actions - Simulation
  function startSimulation() {
    simulationRunning.value = true
    isPlaying.value = true
  }
  
  function pauseSimulation() {
    isPlaying.value = false
  }
  
  function stopSimulation() {
    simulationRunning.value = false
    isPlaying.value = false
    simulationTime.value = 0
  }
  
  function stepSimulation() {
    // Exécuter une étape de simulation
    simulationTime.value += 100 // 100ms par étape
  }
  
  function setSimulationSpeed(speed) {
    simulationSpeed.value = Math.max(0.1, Math.min(5, speed))
  }
  
  // Actions - Messages réseau
  function sendMessage(fromDevice, toDevice, messageType, data) {
    const message = {
      id: uuidv4(),
      from: fromDevice,
      to: toDevice,
      type: messageType,
      data,
      timestamp: Date.now(),
      progress: 0
    }
    
    networkMessages.value.push(message)
    
    return message.id
  }
  
  function updateMessages(deltaTime) {
    networkMessages.value.forEach(message => {
      message.progress += deltaTime * simulationSpeed.value * 0.001 // Progression en secondes
      
      if (message.progress >= 1) {
        // Message arrivé à destination
        deliverMessage(message)
      }
    })
    
    // Supprimer les messages terminés
    networkMessages.value = networkMessages.value.filter(msg => msg.progress < 1)
  }
  
  function deliverMessage(message) {
    const targetDevice = devices.value.get(message.to)
    if (!targetDevice) return
    
    // Logique de livraison selon le type d'appareil et de message
    console.log(`Message ${message.type} livré à ${targetDevice.name}`)
  }
  
  // Actions - Historique
  function saveToHistory(action, data) {
    // Supprimer l'historique "futur" si on est au milieu
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    
    // Ajouter la nouvelle action
    history.value.push({ action, data, timestamp: Date.now() })
    historyIndex.value = history.value.length - 1
    
    // Limiter la taille de l'historique
    if (history.value.length > maxHistorySize) {
      history.value.shift()
      historyIndex.value--
    }
  }
  
  function undo() {
    if (!canUndo.value) return false
    
    const historyItem = history.value[historyIndex.value]
    executeUndo(historyItem)
    historyIndex.value--
    
    return true
  }
  
  function redo() {
    if (!canRedo.value) return false
    
    historyIndex.value++
    const historyItem = history.value[historyIndex.value]
    executeRedo(historyItem)
    
    return true
  }
  
  function executeUndo(historyItem) {
    const { action, data } = historyItem
    
    switch (action) {
      case 'add_device':
        devices.value.delete(data.device.id)
        break
      case 'remove_device':
        devices.value.set(data.device.id, data.device)
        data.connectedLinks?.forEach(link => {
          links.value.set(link.id, link)
        })
        break
      case 'update_device':
        devices.value.set(data.deviceId, data.oldDevice)
        break
      case 'add_link':
        links.value.delete(data.link.id)
        break
      case 'remove_link':
        links.value.set(data.link.id, data.link)
        break
    }
  }
  
  function executeRedo(historyItem) {
    const { action, data } = historyItem
    
    switch (action) {
      case 'add_device':
        devices.value.set(data.device.id, data.device)
        break
      case 'remove_device':
        devices.value.delete(data.device.id)
        data.connectedLinks?.forEach(link => {
          links.value.delete(link.id)
        })
        break
      case 'update_device':
        devices.value.set(data.deviceId, data.newDevice)
        break
      case 'add_link':
        links.value.set(data.link.id, data.link)
        break
      case 'remove_link':
        links.value.delete(data.link.id)
        break
    }
  }
  
  // Actions - Sauvegarde/Chargement
  function saveNetwork() {
    const networkData = {
      version: 2,
      timestamp: Date.now(),
      devices: Array.from(devices.value.values()),
      links: Array.from(links.value.values())
    }
    
    return JSON.stringify(networkData, null, 2)
  }
  
  function loadNetwork(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      // Vider le réseau actuel
      devices.value.clear()
      links.value.clear()
      clearSelection()
      
      // Charger les appareils
      data.devices?.forEach(device => {
        devices.value.set(device.id, device)
      })
      
      // Charger les liens
      data.links?.forEach(link => {
        links.value.set(link.id, link)
      })
      
      // Réinitialiser l'historique
      history.value = []
      historyIndex.value = -1
      
      return true
    } catch (error) {
      console.error('Erreur lors du chargement du réseau:', error)
      return false
    }
  }
  
  // Utilitaires
  function getDefaultPorts(deviceType) {
    const portConfigs = {
      computer: Array.from({ length: 1 }, (_, i) => ({
        id: i,
        type: 'ethernet',
        connected: false,
        linkId: null
      })),
      switch: Array.from({ length: 8 }, (_, i) => ({
        id: i,
        type: 'ethernet',
        connected: false,
        linkId: null
      })),
      router: Array.from({ length: 2 }, (_, i) => ({
        id: i,
        type: i === 0 ? 'wan' : 'lan',
        connected: false,
        linkId: null
      })),
      server: Array.from({ length: 1 }, (_, i) => ({
        id: i,
        type: 'ethernet',
        connected: false,
        linkId: null
      }))
    }
    
    return portConfigs[deviceType] || portConfigs.computer
  }
  
  function getDefaultApps(deviceType) {
    const appConfigs = {
      computer: ['dhcp-client', 'dns-client', 'http-client'],
      'dhcp-server': ['dhcp-server'],
      'dns-server': ['dns-server'],
      'http-server': ['http-server'],
      router: ['router'],
      switch: ['switch']
    }
    
    return appConfigs[deviceType] || []
  }
  
  function isPortAvailable(deviceId, portId) {
    const device = devices.value.get(deviceId)
    return device && device.ports[portId] && !device.ports[portId].connected
  }
  
  return {
    // État
    devices,
    links,
    selectedElement,
    selectedElementType,
    simulationRunning,
    isPlaying,
    isSimulating,
    simulationSpeed,
    simulationTime,
    networkMessages,
    history,
    historyIndex,
    
    // Getters
    deviceCount,
    linkCount,
    hasSelection,
    canUndo,
    canRedo,
    devicesArray,
    linksArray,
    
    // Actions
    addDevice,
    removeDevice,
    updateDevice,
    moveDevice,
    addLink,
    removeLink,
    selectElement,
    clearSelection,
    deleteSelectedElement,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    stepSimulation,
    setSimulationSpeed,
    sendMessage,
    updateMessages,
    undo,
    redo,
    saveNetwork,
    loadNetwork
  }
})
