import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src-tauri/app',
  build: {
    target: 'es2021',
    outDir: '../dist/',
  }
})
