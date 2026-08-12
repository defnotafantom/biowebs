import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, open: true },

  build: {
    /* il grosso del peso è Three.js e non si può evitare: è la
       libreria che disegna la scena. Ma tenerla in un file suo
       vuol dire che chi torna sul sito non la riscarica quando
       cambiamo un testo — resta nella cache del browser. */
    rollupOptions: {
      output: {
        manualChunks: {
          tre: ['three'],
          reagisci: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
    assetsInlineLimit: 2048,
  },
})
