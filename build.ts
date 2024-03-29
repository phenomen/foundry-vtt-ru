import { mkdir, cp } from "node:fs/promises";

async function buildSource() {
	await Bun.build({
		entrypoints: ["./src/index.js"],
		format: "esm",
		outdir: "./ru-ru",
		publicPath: "/modules/ru-ru/",
		minify: true,
		sourcemap: "none"
	});
}

async function copyDirectory(src: string, dest: string) {
	await mkdir(dest, { recursive: true });
	await cp(src, dest, { recursive: true, force: true });
}

await buildSource()
	.then(() => console.log("-- SOURCE BUILT --"))
	.catch(console.error);

await copyDirectory("./public", "./ru-ru")
	.then(() => console.log("-- PUBLIC DIR COPIED --"))
	.catch(console.error);
