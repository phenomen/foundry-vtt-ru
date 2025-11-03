import { defineConfig } from "vite";

const config = defineConfig({
	build: {
		outDir: "ru-ru",
		emptyOutDir: true,
		lib: {
			name: "ru-ru",
			entry: "src/index.js",
			formats: ["es"],
			sourcemap: false,
		},
		rolldownOptions: {
			output: {
				entryFileNames: "esm/[name].js",
				chunkFileNames: "esm/[name].js",
			},
		},
	},
});

export default config;
