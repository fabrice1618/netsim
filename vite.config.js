import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@services': resolve(__dirname, 'src/services'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@legacy': resolve(__dirname, 'legacy')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist-v2',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'vue-router'],
          canvas: ['konva', 'vue-konva', 'd3'],
          ui: ['@headlessui/vue', '@heroicons/vue']
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: '@import "@/assets/styles/variables.css";'
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'pinia', 'konva', 'd3']
  }
})
