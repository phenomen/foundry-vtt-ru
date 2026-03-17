/**
Create a symlink from the build directory to the Foundry data directory.

Required Environment Variables:
- PACKAGE_TYPE: type of the package to symlink (module/system)
- FOUNDRY_DATA_DIR: path to the Foundry data directory
*/
import { access, lstat, rm, symlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { constants } from "node:fs";

async function main() {
  const foundryDataDir = process.env.FOUNDRY_DATA_DIR;
  const packageType = process.env.PACKAGE_TYPE;

  if (!foundryDataDir || !packageType) {
    console.error("Error: FOUNDRY_DATA_DIR and PACKAGE_TYPE environment variables must be set.");
    process.exit(1);
  }

  const manifestPath = resolve("./public/module.json") || resolve("./public/system.json");

  if (!manifestPath) {
    console.error("Error: public/module.json or public/system.json does not exist");
    process.exit(1);
  }

  let manifest;

  try {
    manifest = await Bun.file(manifestPath).json();
  } catch (error) {
    console.error(`Error: Failed to read manifest at ${manifestPath}`);
    console.error(error);
    process.exit(1);
  }

  const moduleId = manifest.id;

  if (!moduleId) {
    console.error("Error: 'id' field is missing in module.json");
    process.exit(1);
  }

  const packageDir = `${packageType}s`;
  const foundryPath = join(foundryDataDir, packageDir, moduleId);
  const devPath = resolve("./public");

  try {
    await access(devPath, constants.F_OK);
  } catch (error) {
    console.error(`Error: The source directory does not exist: ${devPath}`);
    console.error(error);
    process.exit(1);
  }

  try {
    const stats = await lstat(foundryPath);
    if (stats.isSymbolicLink()) {
      console.warn(`Removing existing symlink at: ${foundryPath}`);
      await rm(foundryPath, {
        force: true,
        recursive: true,
      });
    } else {
      console.error(
        `Error: A file or directory that is not a symlink already exists at ${foundryPath}. Please remove it manually.`,
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
    console.warn(`Successfully created symlink: ${foundryPath} -> ${devPath}`);
  } catch (error) {
    console.error("Failed to create symlink:", error);
    process.exit(1);
  }
}

main();
