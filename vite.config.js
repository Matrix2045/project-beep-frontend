import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/theme/index.scss";`,
      },
    },
  },
  define: {
    'process.env': {}
  },
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), 
    },
  },
  base: "/", 
  server: {
    port: 8080, 
    open: true, 
    cors: true, 
    host: "0.0.0.0", 
    proxy: {
      "^/api": {
        target: "http://13.214.203.20",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  optimizeDeps: {
    exclude: ["pg"]
  },
  compilerOptions: {
    types: ["node", "vite/client"],
  },
  build: {
    target: 'esnext'
  }
});
