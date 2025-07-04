<template>
  <div
    v-if="visible"
    class="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <button
      v-for="item in items"
      :key="item.id"
      @click="handleItemClick(item)"
      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
      :class="{
        'text-red-600 dark:text-red-400': item.danger,
        'opacity-50 cursor-not-allowed': item.disabled
      }"
      :disabled="item.disabled"
    >
      <div class="flex items-center space-x-2">
        <svg v-if="item.icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="item.icon === 'edit'" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          <path v-else-if="item.icon === 'delete'" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM6 7a1 1 0 012 0v8a1 1 0 11-2 0V7zM10 7a1 1 0 112 0v8a1 1 0 11-2 0V7z"/>
          <path v-else-if="item.icon === 'copy'" d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 1 1 0 000 2h8v11H6V5z"/>
          <path v-else-if="item.icon === 'link'" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
          <path v-else-if="item.icon === 'settings'" d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          <path v-else-if="item.icon === 'add'" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
        </svg>
        <span>{{ item.label }}</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'close'])

const handleItemClick = (item) => {
  if (!item.disabled) {
    emit('select', item)
  }
}

// Fermer le menu si on clique en dehors
document.addEventListener('click', () => {
  if (props.visible) {
    emit('close')
  }
})
</script>
