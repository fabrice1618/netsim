    <template>
  <div class="space-y-4">
    <!-- Informations du lien -->
    <div class="flex items-center space-x-3">
      <div class="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg">
        🔗
      </div>
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white">Liaison réseau</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ link.type || 'Ethernet' }}</p>
      </div>
    </div>
    
    <!-- Appareils connectés -->
    <div class="space-y-3">
      <h5 class="form-label">Appareils connectés</h5>
      
      <div class="space-y-2">
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
              :style="{ backgroundColor: getDeviceColor(device1?.type) }"
            >
              {{ getDeviceIcon(device1?.type) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ device1?.name || 'Appareil inconnu' }}
              </p>
              <p class="text-xs text-gray-500">Port {{ link.port1 }}</p>
            </div>
          </div>
          <ArrowRightIcon class="w-4 h-4 text-gray-400" />
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
              :style="{ backgroundColor: getDeviceColor(device2?.type) }"
            >
              {{ getDeviceIcon(device2?.type) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ device2?.name || 'Appareil inconnu' }}
              </p>
              <p class="text-xs text-gray-500">Port {{ link.port2 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- État du lien -->
    <div class="space-y-3">
      <h5 class="form-label">État de la liaison</h5>
      
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :class="link.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ getLinkStatusText(link.status) }}
          </span>
        </div>
        <button
          @click="toggleLinkStatus"
          class="text-xs px-2 py-1 rounded"
          :class="link.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
        >
          {{ link.status === 'active' ? 'Désactiver' : 'Activer' }}
        </button>
      </div>
    </div>
    
    <!-- Propriétés techniques -->
    <div class="space-y-3">
      <h5 class="form-label">Propriétés</h5>
      
      <div>
        <label class="form-label">Type de liaison</label>
        <select
          v-model="linkType"
          @change="updateLinkType"
          class="form-input"
        >
          <option value="ethernet">Ethernet</option>
          <option value="fiber">Fibre optique</option>
          <option value="wireless">Sans fil</option>
          <option value="serial">Série</option>
        </select>
      </div>
      
      <div>
        <label class="form-label">Bande passante</label>
        <select
          v-model="linkBandwidth"
          @change="updateLinkBandwidth"
          class="form-input"
        >
          <option value="10">10 Mbps</option>
          <option value="100">100 Mbps</option>
          <option value="1000">1 Gbps</option>
          <option value="10000">10 Gbps</option>
        </select>
      </div>
      
      <div>
        <label class="form-label">Latence (ms)</label>
        <input
          v-model.number="linkLatency"
          @blur="updateLinkLatency"
          type="number"
          min="0"
          max="1000"
          class="form-input"
          placeholder="1"
        />
      </div>
    </div>
    
    <!-- Statistiques -->
    <div class="space-y-3">
      <h5 class="form-label">Statistiques</h5>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p class="text-2xl font-bold text-blue-600">{{ linkStats.packetsIn || 0 }}</p>
          <p class="text-xs text-gray-500">Paquets entrants</p>
        </div>
        <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p class="text-2xl font-bold text-green-600">{{ linkStats.packetsOut || 0 }}</p>
          <p class="text-xs text-gray-500">Paquets sortants</p>
        </div>
      </div>
      
      <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Utilisation:</span>
          <span class="font-medium">{{ linkStats.utilization || 0 }}%</span>
        </div>
        <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full"
            :style="{ width: `${linkStats.utilization || 0}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="pt-3 border-t border-gray-200 dark:border-gray-600">
      <div class="flex space-x-2">
        <button
          @click="resetStats"
          class="btn-secondary flex-1"
        >
          <ArrowPathIcon class="w-4 h-4 mr-2" />
          Réinitialiser stats
        </button>
        <button
          @click="deleteLink"
          class="btn-danger"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNetworkStore } from '@/stores/network'
import { useUIStore } from '@/stores/ui'
import { ArrowRightIcon, ArrowPathIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  link: {
    type: Object,
    required: true
  }
})

const networkStore = useNetworkStore()
const uiStore = useUIStore()

// Propriétés éditables
const linkType = ref(props.link.type || 'ethernet')
const linkBandwidth = ref(props.link.bandwidth || '100')
const linkLatency = ref(props.link.latency || 1)

// Statistiques du lien (simulées)
const linkStats = ref({
  packetsIn: Math.floor(Math.random() * 1000),
  packetsOut: Math.floor(Math.random() * 1000),
  utilization: Math.floor(Math.random() * 50)
})

// Appareils connectés
const device1 = computed(() => networkStore.devices.get(props.link.device1))
const device2 = computed(() => networkStore.devices.get(props.link.device2))

// Watchers
watch(() => props.link.type, (newType) => {
  linkType.value = newType || 'ethernet'
})

// Actions
function toggleLinkStatus() {
  const newStatus = props.link.status === 'active' ? 'inactive' : 'active'
  networkStore.updateLink(props.link.id, { status: newStatus })
  uiStore.showSuccess(newStatus === 'active' ? 'Lien activé' : 'Lien désactivé')
}

function updateLinkType() {
  networkStore.updateLink(props.link.id, { type: linkType.value })
}

function updateLinkBandwidth() {
  networkStore.updateLink(props.link.id, { bandwidth: linkBandwidth.value })
}

function updateLinkLatency() {
  networkStore.updateLink(props.link.id, { latency: linkLatency.value })
}

function resetStats() {
  linkStats.value = {
    packetsIn: 0,
    packetsOut: 0,
    utilization: 0
  }
  uiStore.showSuccess('Statistiques réinitialisées')
}

function deleteLink() {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette liaison ?')) {
    networkStore.removeLink(props.link.id)
    uiStore.showSuccess('Liaison supprimée')
  }
}

// Utilitaires
function getLinkStatusText(status) {
  const statusMap = {
    active: 'Actif',
    inactive: 'Inactif',
    error: 'Erreur'
  }
  return statusMap[status] || 'Inconnu'
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
</script>
