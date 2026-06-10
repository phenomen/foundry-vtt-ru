/**
 * Removes all embedded "items" from Babele compendium JSON files.
 *
 * Usage:
 *   node utils/remove-items.js [--dry-run] [path...]
 */
import { access, glob, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_FILES = [
  "public/compendium/dnd5e/ag/dnd5e.actors24.json",
  "public/compendium/dnd5e/ag/dnd5e.heroes.json",
  "public/compendium/dnd5e/ag/dnd5e.monsters.json",
];

/**
 * @param {unknown} value
 * @returns {{ value: unknown; removed: number }}
 */
function stripItems(value) {
  if (Array.isArray(value)) {
    let removed = 0;
    const next = value.map((item) => {
      const result = stripItems(item);
      removed += result.removed;
      return result.value;
    });
    return { value: next, removed };
  }

  if (typeof value === "object" && value !== null) {
    let removed = 0;
    /** @type {Record<string, unknown>} */
    const next = {};

    for (const [key, child] of Object.entries(value)) {
      if (key === "items") {
        removed += 1;
      } else {
        const result = stripItems(child);
        removed += result.removed;
        next[key] = result.value;
      }
    }

    return { value: next, removed };
  }

  return { value, removed: 0 };
}

/**
 * @param {string} target
 * @returns {Promise<string[]>}
 */
async function resolveJsonFiles(target) {
  const resolved = path.resolve(target);

  try {
    await access(resolved);
  } catch {
    throw new Error(`Path not found: ${resolved}`);
  }

  const info = await stat(resolved);

  if (info.isFile()) {
    return [resolved];
  }

  const files = [];

  for await (const file of glob("**/*.json", { cwd: resolved })) {
    files.push(path.join(resolved, file));
  }

  return files.sort();
}

/**
 * @param {string[]} targets
 * @returns {Promise<string[]>}
 */
async function collectFiles(targets) {
  const fileSets = await Promise.all(targets.map(resolveJsonFiles));
  const files = [];

  for (const resolved of fileSets) {
    for (const file of resolved) {
      if (!files.includes(file)) {
        files.push(file);
      }
    }
  }

  return files;
}

/**
 * @param {string} filePath
 * @param {boolean} dryRun
 * @returns {Promise<{ removed: number; changed: boolean }>}
 */
async function processFile(filePath, dryRun) {
  const original = await readFile(filePath, "utf8");
  const data = JSON.parse(original);
  const { value, removed } = stripItems(data);

  if (removed === 0) {
    return { removed: 0, changed: false };
  }

  const relative = path.relative(process.cwd(), filePath);

  if (dryRun) {
    console.log(`${relative}: would remove ${removed} "items" block(s)`);
    return { removed, changed: true };
  }

  const updated = `${JSON.stringify(value, null, 2)}\n`;
  await writeFile(filePath, updated, "utf8");
  console.log(`${relative}: removed ${removed} "items" block(s)`);
  return { removed, changed: true };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((arg) => arg !== "--dry-run");

  let targets;
  if (paths.length > 0) {
    targets = paths;
  } else {
    targets = DEFAULT_FILES;
  }

  const files = await collectFiles(targets);
  const results = await Promise.all(files.map((filePath) => processFile(filePath, dryRun)));

  let totalRemoved = 0;
  let filesChanged = 0;

  for (const result of results) {
    totalRemoved += result.removed;
    if (result.changed) {
      filesChanged += 1;
    }
  }

  let action;
  if (dryRun) {
    action = "Would remove";
  } else {
    action = "Removed";
  }

  console.log(`\n${action} ${totalRemoved} "items" block(s) in ${filesChanged} file(s).`);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
