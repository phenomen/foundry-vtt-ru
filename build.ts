import { promises as fs } from "node:fs";
import path from "node:path";

// Build source
async function buildSource() {
	await Bun.build({
		entrypoints: ["./src/index.js"],
		format: "esm",
		outdir: "./ru-ru",
		publicPath: "/modules/ru-ru/",
		minify: true,
		sourcemap: "external"
	});
}

async function copyDirectory(src: string, dest: string) {
	await fs.mkdir(dest, { recursive: true });
	let entries = await fs.readdir(src, { withFileTypes: true });

	for (let entry of entries) {
		let srcPath = path.join(src, entry.name);
		let destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			await fs.copyFile(srcPath, destPath);
		}
	}
}

//async function minifyCSS() {}

await buildSource()
	.then(() => console.log("-- BUILD DONE --"))
	.catch(console.error);

await copyDirectory("./public", "./ru-ru")
	.then(() => console.log("-- PUBLIC COPY DONE --"))
	.catch(console.error);
