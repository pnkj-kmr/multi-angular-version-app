import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import { resolve } from "path";

// Get component name from environment variable, default to 'login'
const componentName = process.env["WEB_COMPONENT_NAME"] || "login";

// Validate that the component directory exists
const componentPath = resolve(__dirname, `src/web-component/${componentName}`);
const htmlEntryPath = resolve(componentPath, "index.html");

export default defineConfig({
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
    port: 4201,
    open: true,
  },
  build: {
    outDir: `dist/web-component/${componentName}`,
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: htmlEntryPath,
      output: {
        entryFileNames: `${componentName}-web-component.js`,
        chunkFileNames: "chunk-[hash].js",
        assetFileNames: "assets/[name].[ext]",
        format: "es",
        inlineDynamicImports: true,
        manualChunks: undefined, // Don't split chunks
      },
      treeshake: false,
      preserveEntrySignatures: "allow-extension",
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    minify: true, // Disable minification for debugging
  },
  optimizeDeps: {
    include: [
      "@angular/common",
      "@angular/forms",
      "@angular/elements",
      "@angular/core",
      "@angular/platform-browser",
      "@angular/router",
      "zone.js",
      "rxjs",
    ],
  },
  publicDir: false,
});
