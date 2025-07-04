<template>
  <div
    ref="canvasContainer"
    class="relative w-full h-full bg-gray-100 dark:bg-gray-900 overflow-hidden"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <!-- Canvas principal -->
    <canvas
      ref="mainCanvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
      class="absolute inset-0 cursor-default"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @contextmenu.prevent="handleRightClick"
    />
    
    <!-- Canvas pour les interactions (drag, sélection) -->
    <canvas
      ref="interactionCanvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
      class="absolute inset-0 pointer-events-none"
    />
    
    <!-- Grille de fond (optionnelle) -->
    <div
      v-if="showGrid"
      class="absolute inset-0 pointer-events-none opacity-30"
      :style="gridStyle"
    />
    
    <!-- Indicateur de zoom -->
    <div class="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 text-sm">
      <div class="flex items-center space-x-2">
        <button
          @click="zoomOut"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MinusIcon class="w-4 h-4" />
        </button>
        
        <span class="font-mono min-w-[4rem] text-center">{{ Math.round(transform.scale * 100) }}%</span>
        
        <button
          @click="zoomIn"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <PlusIcon class="w-4 h-4" />
        </button>
      </div>
      
      <button
        @click="resetZoom"
        class="w-full mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        Réinitialiser
      </button>
    </div>
    
    <!-- Menu contextuel -->
    <ContextMenu
      v-if="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
      @select="handleContextMenuSelect"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useUIStore } from '@/stores/ui'
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'
import ContextMenu from './ContextMenu.vue'

const networkStore = useNetworkStore()
const uiStore = useUIStore()

// Références du DOM
const canvasContainer = ref(null)
const mainCanvas = ref(null)
const interactionCanvas = ref(null)

// État du canvas
const canvasSize = reactive({ width: 1920, height: 1080 })
const transform = reactive({ scale: 1, panX: 0, panY: 0 })
const showGrid = ref(true)

// État des interactions
const mouseState = reactive({
  isDown: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  draggedDevice: null,
  isDragging: false
})

// Menu contextuel
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  items: []
})

// Rendu
let animationFrame = null
let ctx = null
let interactionCtx = null

// Grille de fond
const gridStyle = computed(() => {
  const gridSize = 20 * transform.scale
  return {
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundPosition: `${transform.panX % gridSize}px ${transform.panY % gridSize}px`
  }
})

// Cycle de vie
onMounted(() => {
  initCanvas()
  startRenderLoop()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopRenderLoop()
  window.removeEventListener('resize', handleResize)
})

// Watchers
watch(() => networkStore.devices, () => {
  render()
}, { deep: true })

watch(() => networkStore.links, () => {
  render()
}, { deep: true })

// Initialisation du canvas
function initCanvas() {
  if (!mainCanvas.value || !interactionCanvas.value) return
  
  ctx = mainCanvas.value.getContext('2d')
  interactionCtx = interactionCanvas.value.getContext('2d')
  
  // Configuration du rendu
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  handleResize()
}

function handleResize() {
  if (!canvasContainer.value) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  canvasSize.width = rect.width * window.devicePixelRatio
  canvasSize.height = rect.height * window.devicePixelRatio
  
  // Ajuster l'affichage CSS
  mainCanvas.value.style.width = rect.width + 'px'
  mainCanvas.value.style.height = rect.height + 'px'
  interactionCanvas.value.style.width = rect.width + 'px'
  interactionCanvas.value.style.height = rect.height + 'px'
}

// Boucle de rendu
function startRenderLoop() {
  function animate() {
    render()
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
}

function stopRenderLoop() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
}

// Fonctions de rendu
function render() {
  if (!ctx) return
  
  // Nettoyer le canvas
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
  
  // Appliquer les transformations
  ctx.save()
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  ctx.scale(transform.scale, transform.scale)
  ctx.translate(transform.panX / transform.scale, transform.panY / transform.scale)
  
  // Fond
  ctx.fillStyle = uiStore.darkMode ? '#111827' : '#F3F4F6'
  ctx.fillRect(
    -transform.panX / transform.scale,
    -transform.panY / transform.scale,
    canvasSize.width / (transform.scale * window.devicePixelRatio),
    canvasSize.height / (transform.scale * window.devicePixelRatio)
  )
  
  // Dessiner les liens
  renderLinks()
  
  // Dessiner les appareils
  renderDevices()
  
  // Dessiner les messages réseau
  renderMessages()
  
  ctx.restore()
  
  // Interactions (sans transformation)
  renderInteractions()
}

function renderDevices() {
  networkStore.devices.forEach(device => {
    renderDevice(device)
  })
}

function renderDevice(device) {
  const { x, y, type, name } = device
  const size = 48
  const isSelected = networkStore.selectedElement === device.id && networkStore.selectedElementType === 'device'
  
  // Ombre si sélectionné
  if (isSelected) {
    ctx.shadowColor = '#8B5CF6'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
  
  // Corps de l'appareil
  ctx.fillStyle = getDeviceColor(type)
  ctx.strokeStyle = isSelected ? '#8B5CF6' : '#E5E7EB'
  ctx.lineWidth = isSelected ? 3 : 1
  
  ctx.beginPath()
  ctx.roundRect(x - size/2, y - size/2, size, size, 8)
  ctx.fill()
  ctx.stroke()
  
  // Icône
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(getDeviceIcon(type), x, y)
  
  // Réinitialiser l'ombre
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  
  // Nom de l'appareil
  ctx.fillStyle = uiStore.darkMode ? '#F3F4F6' : '#374151'
  ctx.font = '12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(name, x, y + size/2 + 5)
  
  // Indicateur de statut
  const statusColor = device.online !== false ? '#10B981' : '#EF4444'
  ctx.fillStyle = statusColor
  ctx.beginPath()
  ctx.arc(x + size/2 - 6, y - size/2 + 6, 4, 0, 2 * Math.PI)
  ctx.fill()
}

function renderLinks() {
  networkStore.links.forEach(link => {
    renderLink(link)
  })
}

function renderLink(link) {
  const device1 = networkStore.devices.get(link.device1)
  const device2 = networkStore.devices.get(link.device2)
  
  if (!device1 || !device2) return
  
  const isSelected = networkStore.selectedElement === link.id && networkStore.selectedElementType === 'link'
  
  ctx.strokeStyle = isSelected ? '#8B5CF6' : '#6B7280'
  ctx.lineWidth = isSelected ? 3 : 2
  ctx.lineCap = 'round'
  
  // Ligne principale
  ctx.beginPath()
  ctx.moveTo(device1.x, device1.y)
  ctx.lineTo(device2.x, device2.y)
  ctx.stroke()
  
  // Indicateur d'activité
  if (link.status === 'active') {
    const midX = (device1.x + device2.x) / 2
    const midY = (device1.y + device2.y) / 2
    
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(midX, midY, 3, 0, 2 * Math.PI)
    ctx.fill()
  }
}

function renderMessages() {
  networkStore.networkMessages.forEach(message => {
    renderMessage(message)
  })
}

function renderMessage(message) {
  const fromDevice = networkStore.devices.get(message.from)
  const toDevice = networkStore.devices.get(message.to)
  
  if (!fromDevice || !toDevice) return
  
  // Position interpolée
  const progress = message.progress
  const x = fromDevice.x + (toDevice.x - fromDevice.x) * progress
  const y = fromDevice.y + (toDevice.y - fromDevice.y) * progress
  
  // Message visuel
  ctx.fillStyle = getMessageColor(message.type)
  ctx.beginPath()
  ctx.arc(x, y, 6, 0, 2 * Math.PI)
  ctx.fill()
  
  // Bordure
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.stroke()
}

function renderInteractions() {
  if (!interactionCtx) return
  
  interactionCtx.clearRect(0, 0, canvasSize.width, canvasSize.height)
  interactionCtx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  // Sélection en cours
  if (mouseState.isDown && !mouseState.isDragging && uiStore.currentTool === 'select') {
    const rect = getSelectionRect()
    interactionCtx.strokeStyle = '#3B82F6'
    interactionCtx.lineWidth = 1
    interactionCtx.setLineDash([5, 5])
    interactionCtx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    interactionCtx.setLineDash([])
  }
  
  // Création de lien
  if (uiStore.currentTool === 'link' && mouseState.isDragging && mouseState.draggedDevice) {
    const device = networkStore.devices.get(mouseState.draggedDevice)
    if (device) {
      interactionCtx.strokeStyle = '#10B981'
      interactionCtx.lineWidth = 2
      interactionCtx.setLineDash([3, 3])
      interactionCtx.beginPath()
      interactionCtx.moveTo(device.x * transform.scale + transform.panX, device.y * transform.scale + transform.panY)
      interactionCtx.lineTo(mouseState.currentX, mouseState.currentY)
      interactionCtx.stroke()
      interactionCtx.setLineDash([])
    }
  }
}

// Gestion des événements souris
function handleMouseDown(event) {
  const coords = getMouseCoords(event)
  
  mouseState.isDown = true
  mouseState.startX = coords.x
  mouseState.startY = coords.y
  mouseState.currentX = event.clientX
  mouseState.currentY = event.clientY
  
  const clickedDevice = getDeviceAtPosition(coords.x, coords.y)
  const clickedLink = getLinkAtPosition(coords.x, coords.y)
  
  closeContextMenu()
  
  switch (uiStore.currentTool) {
    case 'select':
      if (clickedDevice) {
        networkStore.selectElement(clickedDevice.id, 'device')
        mouseState.draggedDevice = clickedDevice.id
      } else if (clickedLink) {
        networkStore.selectElement(clickedLink.id, 'link')
      } else {
        networkStore.clearSelection()
      }
      break
      
    case 'move':
      if (clickedDevice) {
        mouseState.draggedDevice = clickedDevice.id
        mouseState.isDragging = true
      }
      break
      
    case 'link':
      if (clickedDevice) {
        mouseState.draggedDevice = clickedDevice.id
        mouseState.isDragging = true
      }
      break
      
    case 'delete':
      if (clickedDevice) {
        networkStore.removeDevice(clickedDevice.id)
        uiStore.showSuccess('Appareil supprimé')
      } else if (clickedLink) {
        networkStore.removeLink(clickedLink.id)
        uiStore.showSuccess('Lien supprimé')
      }
      break
  }
}

function handleMouseMove(event) {
  const coords = getMouseCoords(event)
  
  mouseState.currentX = event.clientX
  mouseState.currentY = event.clientY
  
  if (!mouseState.isDown) return
  
  const deltaX = coords.x - mouseState.startX
  const deltaY = coords.y - mouseState.startY
  
  if (uiStore.currentTool === 'move' && mouseState.draggedDevice) {
    // Déplacer l'appareil
    const device = networkStore.devices.get(mouseState.draggedDevice)
    if (device) {
      networkStore.moveDevice(mouseState.draggedDevice, coords.x, coords.y)
    }
  } else if (uiStore.currentTool === 'select' && !mouseState.draggedDevice) {
    // Sélection rectangle (TODO)
  } else if (!mouseState.draggedDevice) {
    // Pan du canvas
    transform.panX += deltaX
    transform.panY += deltaY
    mouseState.startX = coords.x
    mouseState.startY = coords.y
  }
}

function handleMouseUp(event) {
  const coords = getMouseCoords(event)
  
  if (uiStore.currentTool === 'link' && mouseState.draggedDevice && mouseState.isDragging) {
    const targetDevice = getDeviceAtPosition(coords.x, coords.y)
    if (targetDevice && targetDevice.id !== mouseState.draggedDevice) {
      // Créer un lien
      const linkId = networkStore.addLink(mouseState.draggedDevice, 0, targetDevice.id, 0)
      if (linkId) {
        uiStore.showSuccess('Lien créé')
      } else {
        uiStore.showError('Impossible de créer le lien')
      }
    }
  }
  
  mouseState.isDown = false
  mouseState.isDragging = false
  mouseState.draggedDevice = null
}

function handleWheel(event) {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(5, transform.scale * delta))
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // Zoom centré sur la souris
  const scaleDiff = newScale - transform.scale
  transform.panX -= mouseX * scaleDiff
  transform.panY -= mouseY * scaleDiff
  transform.scale = newScale
  
  uiStore.setCanvasTransform(transform.scale, transform.panX, transform.panY)
}

function handleRightClick(event) {
  const coords = getMouseCoords(event)
  const clickedDevice = getDeviceAtPosition(coords.x, coords.y)
  const clickedLink = getLinkAtPosition(coords.x, coords.y)
  
  const menuItems = []
  
  if (clickedDevice) {
    menuItems.push(
      { label: 'Configurer', action: 'configure', data: clickedDevice },
      { label: 'Supprimer', action: 'delete', data: clickedDevice },
      { type: 'separator' },
      { label: 'Propriétés', action: 'properties', data: clickedDevice }
    )
  } else if (clickedLink) {
    menuItems.push(
      { label: 'Supprimer le lien', action: 'delete-link', data: clickedLink }
    )
  } else {
    menuItems.push(
      { label: 'Ajouter un ordinateur', action: 'add-computer' },
      { label: 'Ajouter un serveur', action: 'add-server' },
      { label: 'Ajouter un routeur', action: 'add-router' }
    )
  }
  
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.items = menuItems
  contextMenu.visible = true
}

// Drag & Drop
function handleDrop(event) {
  event.preventDefault()
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    if (data.type === 'device') {
      const coords = getMouseCoords(event)
      const deviceId = networkStore.addDevice(data.deviceType, coords.x, coords.y)
      networkStore.selectElement(deviceId, 'device')
      uiStore.showSuccess(`${data.name} ajouté`)
    }
  } catch (error) {
    console.error('Erreur lors du drop:', error)
  }
}

// Fonctions utilitaires
function getMouseCoords(event) {
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (event.clientX - rect.left - transform.panX) / transform.scale
  const y = (event.clientY - rect.top - transform.panY) / transform.scale
  return { x, y }
}

function getDeviceAtPosition(x, y) {
  for (const device of networkStore.devices.values()) {
    const distance = Math.sqrt((device.x - x) ** 2 + (device.y - y) ** 2)
    if (distance <= 24) { // Rayon de 24px
      return device
    }
  }
  return null
}

function getLinkAtPosition(x, y) {
  for (const link of networkStore.links.values()) {
    const device1 = networkStore.devices.get(link.device1)
    const device2 = networkStore.devices.get(link.device2)
    if (device1 && device2) {
      const distance = distanceToLine(x, y, device1.x, device1.y, device2.x, device2.y)
      if (distance <= 5) { // Tolérance de 5px
        return link
      }
    }
  }
  return null
}

function distanceToLine(px, py, x1, y1, x2, y2) {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1
  
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1
  if (lenSq !== 0) {
    param = dot / lenSq
  }
  
  let xx, yy
  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }
  
  const dx = px - xx
  const dy = py - yy
  return Math.sqrt(dx * dx + dy * dy)
}

function getSelectionRect() {
  const x1 = Math.min(mouseState.startX, mouseState.currentX)
  const y1 = Math.min(mouseState.startY, mouseState.currentY)
  const x2 = Math.max(mouseState.startX, mouseState.currentX)
  const y2 = Math.max(mouseState.startY, mouseState.currentY)
  
  return {
    x: x1 * transform.scale + transform.panX,
    y: y1 * transform.scale + transform.panY,
    width: (x2 - x1) * transform.scale,
    height: (y2 - y1) * transform.scale
  }
}

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

function getMessageColor(type) {
  const colors = {
    dhcp: '#10B981',
    dns: '#F59E0B',
    http: '#EF4444',
    icmp: '#06B6D4'
  }
  return colors[type] || '#6B7280'
}

// Contrôles de zoom
function zoomIn() {
  transform.scale = Math.min(5, transform.scale * 1.2)
  uiStore.setCanvasTransform(transform.scale, transform.panX, transform.panY)
}

function zoomOut() {
  transform.scale = Math.max(0.1, transform.scale / 1.2)
  uiStore.setCanvasTransform(transform.scale, transform.panX, transform.panY)
}

function resetZoom() {
  transform.scale = 1
  transform.panX = 0
  transform.panY = 0
  uiStore.setCanvasTransform(transform.scale, transform.panX, transform.panY)
}

// Menu contextuel
function handleContextMenuSelect(item) {
  closeContextMenu()
  
  switch (item.action) {
    case 'configure':
      // Ouvrir la configuration de l'appareil
      uiStore.openDialog('device-config')
      break
    case 'delete':
      networkStore.removeDevice(item.data.id)
      uiStore.showSuccess('Appareil supprimé')
      break
    case 'delete-link':
      networkStore.removeLink(item.data.id)
      uiStore.showSuccess('Lien supprimé')
      break
    case 'add-computer':
      const coords = getMouseCoords({ clientX: contextMenu.x, clientY: contextMenu.y })
      networkStore.addDevice('computer', coords.x, coords.y)
      uiStore.showSuccess('Ordinateur ajouté')
      break
    // ... autres actions
  }
}

function closeContextMenu() {
  contextMenu.visible = false
}
</script>

<style>
canvas {
  image-rendering: crisp-edges;
}
</style>
