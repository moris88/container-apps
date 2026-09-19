import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  plugins: [react(), tailwindcss()],
});
