import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    host: true // 允许外部访问
  },
  resolve: {
    alias: {
      "@comic/ui-components": path.resolve(__dirname, "../../packages/ui-components/src"),
      "@comic/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@comic/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
    },
  },
});