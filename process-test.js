import { rm, rename } from "node:fs/promises";
import { join } from "node:path";

const modules = "D:\\Foundry\\Data\\modules";
const module = "ru-ru";
const modulePath = join(modules, module);

async function removeOld() {
	try {
		await rm(modulePath, { recursive: true });
	} catch (err) {
		console.error(err);
	}
}

async function moveNew() {
	try {
		await rename("./ru-ru", modulePath);
	} catch (err) {
		console.error(err);
	}
}

async function main() {
	await removeOld();
	await moveNew();
}

main();
