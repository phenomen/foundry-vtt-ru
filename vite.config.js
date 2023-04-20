const path = require("path");

const config = {
  root: "src/",
  base: "/modules/ru-ru/",
  publicDir: path.resolve(__dirname, "public"),
  server: {
    port: 30001,
    open: true,
    proxy: {
      "^(?!/modules/ru-ru)": "http://localhost:30000/",
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "ru-ru"),
    emptyOutDir: true,
    sourcemap: false,
    brotliSize: true,
    lib: {
      name: "ru-ru",
      entry: path.resolve(__dirname, "src/index.js"),
      formats: ["es"],
      fileName: "ru-ru",
    },
  },
};

export default config;
