import { defineConfig } from "vite";

const config = defineConfig({
	build: {
		outDir: "ru-ru",
		lib: {
			name: "ru-ru",
			entry: "src/index.js",
			formats: ["es"],
			sourcemap: false,
		},
		rollupOptions: {
			output: {
				entryFileNames: "esm/[name].js",
				chunkFileNames: "esm/[name].js",
			},
		},
	},
});

export default config;
