import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // ✅ quan trọng cho production. Nếu deploy trên subfolder, ví dụ '/app/', đổi lại.
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent'
      }
    })
  ],
  server: {
    port: 4000, // dev port
    open: true, // tự mở browser khi start
    host: true // cho phép LAN access
  },
  build: {
    outDir: 'dist', // folder build chuẩn
    sourcemap: false, // tắt source map production
    chunkSizeWarningLimit: 1000, // cảnh báo chunk lớn
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor' // tách thư viện bên ngoài ra chunk riêng
          }
        }
      }
    }
  }
})
