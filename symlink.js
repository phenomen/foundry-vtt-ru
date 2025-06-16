import { constants } from "node:fs";
import { access, lstat, rm, symlink } from "node:fs/promises";
import { join, resolve } from "node:path";

/* 
Create a symlink from the build directory to the Foundry data directory.

Required Environment Variables:
- MODULE_ID: ID of the package
- PACKAGE_TYPE: type of the package to symlink (module/system)
- FOUNDRY_DATA_DIR: path to the Foundry data directory
- BUILD_DIR: path to the build directory
 */

async function createSymlink() {
	const moduleId = process.env.MODULE_ID;
	const foundryDataDir = process.env.FOUNDRY_DATA_DIR;
	const packageType = process.env.PACKAGE_TYPE;
	const buildDir = process.env.BUILD_DIR;

	if (!moduleId || !foundryDataDir || !packageType || !buildDir) {
		console.error(
			"Error: MODULE_ID, FOUNDRY_DATA_DIR, PACKAGE_TYPE, and BUILD_DIR environment variables must be set."
		);
		process.exit(1);
	}

	const packageDir = `${packageType}s`;
	const foundryPath = join(foundryDataDir, packageDir, moduleId);
	const devPath = resolve(buildDir);

	try {
		await access(devPath, constants.F_OK);
	} catch (_error) {
		console.error(`Error: The source directory does not exist: ${devPath}`);
		process.exit(1);
	}

	try {
		const stats = await lstat(foundryPath);
		if (stats.isSymbolicLink()) {
			console.log(`Removing existing symlink at: ${foundryPath}`);
			await rm(foundryPath, { recursive: true, force: true });
		} else {
			console.error(
				`Error: A file or directory that is not a symlink already exists at ${foundryPath}. Please remove it manually.`
			);
			process.exit(1);
		}
	} catch (error) {
		if (error.code !== "ENOENT") {
			console.error(`Error checking status of ${foundryPath}:`, error);
			process.exit(1);
		}
	}

	try {
		await symlink(devPath, foundryPath, "junction");
		console.log(`Successfully created symlink: ${foundryPath} -> ${devPath}`);
	} catch (error) {
		console.error("Failed to create symlink:", error);
		process.exit(1);
	}
}

createSymlink();
