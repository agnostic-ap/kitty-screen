import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the browser (web) build.
 * Run:
 *   bun run web:dev    – development server on port 5174
 *   bun run web:build  – production output to dist-web/
 *
 * Before running, copy your cat videos into web-public/assets/:
 *   bun run web:assets
 */
export default defineConfig({
  plugins: [react()],

  // Static assets served from web-public/ (videos, icons, etc.)
  publicDir: "web-public",

  server: {
    port: 5174,
  },

  build: {
    outDir: "dist-web",
    rollupOptions: {
      input: "web.html",
    },
  },
});
