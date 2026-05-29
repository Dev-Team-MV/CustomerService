import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const requireFromApp = createRequire(path.join(__dirname, 'package.json'))

/** Imports bajo frontend/shared deben resolver deps desde node_modules de esta app (no desde frontend/). */
function sharedDepsFromAppRoot() {
  return {
    name: 'shared-deps-from-app-root',
    resolveId(id, importer) {
      if (!importer) return null
      const normalizedImporter = importer.replace(/\\/g, '/')
      if (!normalizedImporter.includes('/shared/')) return null
      if (id.startsWith('.') || id.startsWith('\0') || id.startsWith('/')) return null
      if (id.startsWith('@shared')) return null
      try {
        return requireFromApp.resolve(id)
      } catch {
        return null
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), sharedDepsFromAppRoot()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  },
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
