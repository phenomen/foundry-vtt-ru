import { defineConfig } from "vite";

const config = defineConfig({
	build: {
		outDir: "ru-ru",
		lib: {
			entry: "src/index.js",
			formats: ["es"],
			name: "ru-ru",
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
