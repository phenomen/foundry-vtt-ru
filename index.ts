import { cp, mkdir, readdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { transform } from "lightningcss";
import manifest from "./public/module.json";

interface BuildOptions {
	id: string;
	bump?: string;
	css?: boolean;
}

const options = parseCommandLineArgs();

async function main() {
	console.log("-- BUILDING SOURCE...");
	await buildSource(options.id);

	if (options.bump) {
		console.log("-- BUMPING VERSION...");
		await bumpVersion(options.bump);
	}

	console.log("-- COPYING STATIC FILES...");
	await copyDirectory("./public", `./${options.id}`);

	console.log("-- OPTIMIZING CSS...");
	await optimizeCSS(options.id);
}

function parseCommandLineArgs(): BuildOptions {
	const { values } = parseArgs({
		args: Bun.argv,
		options: {
			id: { type: "string" },
			bump: { type: "string" },
			css: { type: "boolean" },
		},
		strict: true,
		allowPositionals: true,
	});

	if (!values.id) {
		throw new Error("Missing required option: --id");
	}

	return values as BuildOptions;
}

async function buildSource(id: string) {
	const result = await Bun.build({
		entrypoints: ["./src/index.js"],
		format: "esm",
		outdir: `./${id}`,
		publicPath: `/modules/${id}/`,
		minify: true,
		splitting: false,
		sourcemap: "linked",
	});

	if (!result.success) {
		throw new AggregateError(result.logs, "Build failed");
	}
}

async function copyDirectory(src: string, dest: string) {
	await mkdir(dest, { recursive: true });
	await cp(src, dest, { recursive: true, force: true });
}

async function bumpVersion(mode: string) {
	const version = manifest.version;
	const versionFiles = ["./public/module.json", "./README.md"];
	const [major, minor, patch] = version.split(".");

	let newVersion: string;
	switch (mode) {
		case "major":
			newVersion = `${Number.parseInt(major) + 1}.0.0`;
			break;
		case "minor":
			newVersion = `${major}.${Number.parseInt(minor) + 1}.0`;
			break;
		case "patch":
			newVersion = `${major}.${minor}.${Number.parseInt(patch) + 1}`;
			break;
		default:
			throw new Error(`Invalid bump mode: ${mode}`);
	}

	for (const file of versionFiles) {
		const text = await Bun.file(file).text();
		const bumped = text.replace(version, newVersion);
		await Bun.write(file, bumped);
	}
}

async function optimizeCSS(id: string) {
	const cssFiles = await readdir("./src/styles");

	for (const file of cssFiles) {
		const { code } = transform({
			filename: file,
			code: Buffer.from(await Bun.file(`./src/styles/${file}`).text()),
			minify: options.css,
			sourceMap: false,
		});

		await Bun.write(`./${id}/styles/${file}`, code);
	}
}

await main();
