import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { defineConfig } from 'vite'
import AsyncCatch from 'vite-plugin-async-catch'
import styleImport from 'vite-plugin-style-import'
var os = require('os'), ip = '', ifaces = os.networkInterfaces() // 获取本机ip

console.log(ip)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // AsyncCatch({ catchCode: `console.error(e)` }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // build: {
    // outDir: '../backend/static',
  // },
})
