import { mkdir, cp, readdir } from "node:fs/promises";
import { parseArgs } from "util";
import { transform } from "lightningcss";
import manifest from "./public/module.json";

/* 
Parse args
*/
const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		id: {
			type: "string"
		},
		bump: {
			type: "string"
		},
		css: {
			type: "boolean"
		}
	},
	strict: true,
	allowPositionals: true
});

/*
Build source into dist
*/
async function buildSource() {
	await Bun.build({
		entrypoints: ["./src/index.js"],
		format: "esm",
		outdir: `./${values.id}`,
		publicPath: `/modules/${values.id}/`,
		minify: true,
		sourcemap: "none"
	});
}

/* 
Copy static files into dist 
*/
async function copyDirectory(src: string, dest: string) {
	await mkdir(dest, { recursive: true });
	await cp(src, dest, { recursive: true, force: true });
}

/* 
Bump semver in manifest and readme.
Temporal solution until Bun's semver gets inc() -> https://bun.sh/docs/api/semver
Mode: 0 = major, 1 = minor, 2 = patch 
*/
async function bumpVersion(mode: number) {
	const version = manifest.version;
	const versionFiles = ["./public/module.json", "./README.md"];
	const versionParts = version.split(".");
	const digit = parseInt(versionParts[mode], 10);
	versionParts[mode] = (digit + 1).toString();
	const next = versionParts.join(".");

	for (const file of versionFiles) {
		const text = await Bun.file(file).text();
		const bumped = text.replace(version, next);
		await Bun.write(file, bumped);
	}
}

/*
Minify and optimize CSS using LightningCSS
*/
async function transformCSS() {
	const cssFiles = await readdir("./public/styles");

	for (const file of cssFiles) {
		let { code } = transform({
			filename: file,
			code: Buffer.from(await Bun.file(`./public/styles/${file}`).text()),
			minify: true,
			sourceMap: false
		});

		await Bun.write(`./${values.id}/styles/${file}`, code);
	}
}

/*
Process functions. Order is important
*/
async function main() {
	console.log("-- BUILDING SOURCE...");
	await buildSource();

	if (values.bump) {
		console.log("-- BUMPING VERSION...");
		await bumpVersion(parseInt(values.bump));
	}

	console.log("-- COPYING STATIC FILES...");
	await copyDirectory("./public", `./${values.id}`);

	if (values.css) {
		console.log("-- OPTIMIZING CSS...");
		await transformCSS();
	}
}

await main();
