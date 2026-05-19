/**
Converts the legacy Babele format (arrays) into the new format (objects)
*/
import path from "node:path";

/**
 * @param {Record<string, unknown>[]} items
 * @returns {Record<string, unknown>}
 */
function arrayToMap(items) {
  /** @type {Record<string, unknown>} */
  const result = {};

  for (const item of items) {
    if (typeof item !== "object" || item === null || !("id" in item)) {
      throw new Error(`Entry missing id: ${JSON.stringify(item)}`);
    }

    const { id, ...rest } = item;

    if (typeof id !== "string") {
      throw new Error(`Entry id must be a string: ${JSON.stringify(item)}`);
    }

    if (id in result) {
      throw new Error(`Duplicate id: ${id}`);
    }

    result[id] = rest;
  }

  return result;
}

/**
 * @param {unknown} data
 * @returns {unknown}
 */
function convertBabeleFormat(data) {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  /** @type {Record<string, unknown>} */
  const result = { ...data };

  if (Array.isArray(result.entries)) {
    result.entries = arrayToMap(result.entries);

    for (const entry of Object.values(result.entries)) {
      if (typeof entry !== "object" || entry === null) {
        continue;
      }

      if (Array.isArray(entry.pages)) {
        entry.pages = arrayToMap(entry.pages);
      }
    }
  }

  return result;
}

async function main() {
  const inputPath = Bun.argv[2];

  if (!inputPath) {
    console.error("Usage: bun util:babeleformat <path-to-json>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(inputPath);
  const inputFile = Bun.file(resolvedPath);

  if (!(await inputFile.exists())) {
    console.error(`Error: file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const data = await inputFile.json();
  const converted = convertBabeleFormat(data);

  const dir = path.dirname(resolvedPath);
  const base = path.basename(resolvedPath, path.extname(resolvedPath));
  const ext = path.extname(resolvedPath);
  const outputPath = path.join(dir, `${base}.new${ext}`);

  await Bun.write(outputPath, JSON.stringify(converted, null, "\t"));

  console.log(`Output: ${outputPath}`);
}

main();
