import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-tiptap': ['@tiptap/react', '@tiptap/starter-kit',
                            '@tiptap/extension-link', '@tiptap/extension-image',
                            '@tiptap/extension-youtube', '@tiptap/extension-text-align',
                            '@tiptap/extension-underline', '@tiptap/extension-placeholder'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:7004', changeOrigin: true },
    },
  },
  preview: {
    port: 7009,
    host: true,
    allowedHosts: ['app.abeiradocaos.com.br'],
    proxy: {
      '/api': { target: 'http://localhost:7004', changeOrigin: true },
    },
  },
})
