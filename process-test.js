import { rm, rename, access } from "node:fs/promises";
import { join } from "node:path";
import "dotenv/config";

const modules = process.env.MODULES_PATH;
const mod = process.env.MODULE_NAME;
const modulePath = join(modules, mod);

async function removeOld() {
	try {
		const exists = await access(modulePath);

		if (exists) {
			await rm(modulePath, { recursive: true });
		}
	} catch (err) {
		console.error(err);
	}
}

async function moveNew() {
	try {
		await rename(`./${mod}`, modulePath);
	} catch (err) {
		console.error(err);
	}
}

async function main() {
	await removeOld();
	await moveNew();
}

main();
