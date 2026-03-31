import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      formats: ["es"],
      name: "ru-ru",
    },
    emptyOutDir: true,
    minify: "oxc",
    outDir: "ru-ru",
    rolldownOptions: {
      external: ["../../babele/script/converters.js"],
      output: {
        chunkFileNames: "esm/[name].js",
        entryFileNames: "esm/[name].js",
      },
    },
    sourcemap: false,
  },
  fmt: {
    quoteProps: "consistent",
    singleAttributePerLine: true,
    endOfLine: "lf",
    // Defaults:
    // "arrowParens": "always",
    // "bracketSpacing": true,
    // "indentStyle": "space",
    // "indentWidth": 2,
    // "printWidth": 100,
    // "semi": true,
    // "singleQuote": false,
    // "trailingComma": "all"
    // "useTabs": false,
  },
  lint: {
    categories: {
      correctness: "error",
      pedantic: "off",
      perf: "warn",
      restriction: "warn",
      style: "warn",
      suspicious: "warn",
    },
    env: {
      browser: true,
      node: false,
    },
    options: {
      typeAware: false,
      typeCheck: false,
    },
    plugins: ["oxc"],
    rules: {
      "eslint/func-style": "off",
      "eslint/id-length": "off",
      "eslint/init-declarations": "off",
      "eslint/max-statements": "off",
      "eslint/no-magic-numbers": "off",
      "eslint/prefer-ternary:": "off",
      "eslint/sort-keys": "off",
      "no-console": "off",
      "no-process-exit": "off",
      "oxc/no-async-await": "off",
      "oxc/no-optional-chaining": "off",
      "oxc/no-rest-spread-properties": "off",
    },
  },
});
