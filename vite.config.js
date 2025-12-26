import { defineConfig } from "vite";
import { id } from "./public/module.json";

const config = defineConfig({
  build: {
    outDir: id,
    emptyOutDir: true,
    minify: "oxc",
    lib: {
      name: id,
      entry: "src/index.js",
      formats: ["es"],
      sourcemap: false,
    },
    rolldownOptions: {
      output: {
        entryFileNames: "esm/[name].js",
        chunkFileNames: "esm/[name].js",
      },
      external: ["../../babele/script/converters.js"],
    },
  },
});

export default config;
