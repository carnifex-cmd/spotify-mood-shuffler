import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Custom plugin to copy icons to dist
const copyIconsPlugin = () => {
  return {
    name: 'copy-icons',
    writeBundle() {
      const sourceIcon = resolve(__dirname, 'src/assets/icon128.png')
      const destIcon = resolve(__dirname, 'dist/icon128.png')
      
      if (existsSync(sourceIcon)) {
        copyFileSync(sourceIcon, destIcon)
        console.log('✓ Copied icon128.png to dist/')
      } else {
        console.warn('⚠ icon128.png not found in src/assets/')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyIconsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'background.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
