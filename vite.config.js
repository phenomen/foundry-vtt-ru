import path from "node:path";
import "dotenv/config";

const mod = process.env.MODULE_NAME;

const config = {
	root: "src/",
	base: `/modules/${mod}/`,
	publicDir: path.resolve(__dirname, "public"),
	build: {
		outDir: path.resolve(__dirname, mod),
		minify: true,
		emptyOutDir: true,
		sourcemap: false,
		brotliSize: true,
		lib: {
			name: mod,
			entry: path.resolve(__dirname, "src/index.js"),
			formats: ["es"],
			fileName: mod
		},
		rollupOptions: {
			external: [/^.\/fonts\/*/]
		}
	}
};

export default config;
