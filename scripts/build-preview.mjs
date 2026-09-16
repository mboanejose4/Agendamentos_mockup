import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// The standalone preview uses classic scripts so it also opens directly from disk.
await build({
  configFile: false,
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'preview',
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: { entry: 'src/main.ts', name: 'MarcaFacil', formats: ['iife'], fileName: () => 'app.js', cssFileName: 'style' },
  },
})
await writeFile('preview/index.html', `<!doctype html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#019e51"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet"><title>MarcaFácil · Serviços e agendamentos</title><link rel="stylesheet" href="style.css"></head>
<body><div id="app"></div><script src="app.js"><\/script></body></html>
`)
