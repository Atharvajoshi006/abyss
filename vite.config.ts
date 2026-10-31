import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function serviceWorkerPlugin(): Plugin {
  return {
    name: 'sw-precache-generator',
    apply: 'build',
    closeBundle() {
      const baseDir = import.meta.dirname ?? process.cwd()
      const distDir = path.resolve(baseDir, 'dist')
      const swTemplatePath = path.resolve(baseDir, 'public/sw.js')
      const swDistPath = path.resolve(distDir, 'sw.js')

      if (!fs.existsSync(distDir) || !fs.existsSync(swTemplatePath)) return

      const assetsDir = path.resolve(distDir, 'assets')
      const precacheUrls = ['/', '/index.html', '/favicon.svg', '/icons.svg']

      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir)
        for (const file of files) {
          if (!file.endsWith('.map')) {
            precacheUrls.push(`/assets/${file}`)
          }
        }
      }

      let swContent = fs.readFileSync(swTemplatePath, 'utf-8')
      const manifestInjection = `self.__PRECACHE_MANIFEST = ${JSON.stringify(precacheUrls, null, 2)};\n`
      swContent = manifestInjection + swContent

      fs.writeFileSync(swDistPath, swContent, 'utf-8')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    serviceWorkerPlugin(),
  ],
})
