import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    port: 4000, // 👈 đổi port ở đây
    open: true, // (tuỳ chọn) tự mở browser khi start
    host: true, // (tuỳ chọn) cho phép truy cập từ LAN
  },
});
