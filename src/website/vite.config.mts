import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'react-mockframe/styles/mockframe.css': resolve(__dirname, '../package/dist/styles/mockframe.min.css'),
      'react-mockframe': resolve(__dirname, '../package'),
    },
  },
})
