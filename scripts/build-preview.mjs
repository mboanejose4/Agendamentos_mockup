import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// The standalone preview uses classic scripts so it also opens directly from disk.
await build({
  configFile: false,
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'preview',
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: { entry: 'src/main.js', name: 'Elo', formats: ['iife'], fileName: () => 'app.js', cssFileName: 'style' },
  },
})
await writeFile('preview/index.html', `<!doctype html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#376f57"><title>Elo · Serviços e agendamentos</title><link rel