import { rm, rename, access } from "node:fs/promises";
import { join } from "node:path";
import "dotenv/config";

const modules = process.env.MODULES_PATH;
const mod = process.env.MODULE_NAME;
const modulePath = join(modules, mod);

async function removeOld() {
	try {
		await rm(modulePath, { recursive: true });
		console.log(`Removed old ${mod} from ${modules}`);
	} catch (err) {
		console.error(err);
	}
}

async function moveNew() {
	try {
		await rename(`./${mod}`, modulePath);
		console.log(`Moved new ${mod} to ${modules}`);
	} catch (err) {
		console.error(err);
	}
}

async function main() {
	await removeOld();
	await moveNew();
}

main();
