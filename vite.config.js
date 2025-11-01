import { defineConfig } from "vite";
import * as fs from "fs"

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
	plugins: [
		{
			name: "build-script",
			buildStart(options) {
				const systemStyles = fs.readdirSync("public/styles").filter(f => !f.startsWith("_")).map(f => f.split(".")[0]);
				const manifest = JSON.parse(fs.readFileSync("public/module.json", "utf-8"));
				manifest.flags = Object.assign(manifest.flags, { styles: systemStyles });
				fs.writeFileSync("public/module.json", JSON.stringify(manifest, null, "\t"))
			}
		}
	]
});

export default config;
