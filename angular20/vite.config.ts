import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import { resolve } from "path";
import { environment } from "./src/environments/environment";

export default defineConfig({
  base: environment.buildBaseUrl,
  plugins: [
    angular({
      tsconfig: resolve(__dirname, "tsconfig.app.json"),
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 4200,
    open: true,
  },
  build: {
    outDir: "dist/angular20-app",
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["@angular/common", "@angular/forms"],
  },
  publicDir: false,
});
