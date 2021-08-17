import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/web',
  build: {
    target: 'es2021',
    outDir: '../../dist/',
  }
})
