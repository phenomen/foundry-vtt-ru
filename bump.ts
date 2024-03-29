import manifest from "./public/module.json";

const files: string[] = ["./public/module.json", "./README.md"];
const version: string = manifest.version;
const patch: string = bumpPatch(version);

function bumpPatch(version: string) {
	const versionParts = version.split(".");
	const patch = parseInt(versionParts[2], 10);
	versionParts[2] = (patch + 1).toString();
	return versionParts.join(".");
}

for (const file of files) {
	const text = await Bun.file(file).text();
	const bumped = text.replace(version, patch);
	await Bun.write(file, bumped);
}

console.log(`-- VERSION BUMPED TO ${patch} --`);
