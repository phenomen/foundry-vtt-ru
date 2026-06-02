/**
 * Removes all "items" properties from Babele compendium JSON files.
 *
 * Usage:
 *   node utils/remove-items.js [--dry-run] [path...]
 *
 * Default files:
 *   public/compendium/dnd5e/ag/dnd5e.actors24.json
 *   public/compendium/dnd5e/ag/dnd5e.heroes.json
 *   public/compendium/dnd5e/ag/dnd5e.monsters.json
 */
import { access, glob, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_FILES = [
  "public/compendium/dnd5e/ag/dnd5e.actors24.json",
  "public/compendium/dnd5e/ag/dnd5e.heroes.json",
  "public/compendium/dnd5e/ag/dnd5e.monsters.json",
  "public/compendium/swade/core/swade-core-rules.swade-bestiary.json",
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
        continue;
      }

      const result = stripItems(child);
      removed += result.removed;
      next[key] = result.value;
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
  const files = [];

  for (const target of targets) {
    for (const file of await resolveJsonFiles(target)) {
      if (!files.includes(file)) {
        files.push(file);
      }
    }
  }

  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((arg) => arg !== "--dry-run");

  const targets = paths.length > 0 ? paths : DEFAULT_FILES;
  const files = await collectFiles(targets);

  let totalRemoved = 0;
  let filesChanged = 0;

  for (const filePath of files) {
    const original = await readFile(filePath, "utf8");
    const data = JSON.parse(original);
    const { value, removed } = stripItems(data);

    if (removed === 0) {
      continue;
    }

    totalRemoved += removed;
    filesChanged += 1;

    const relative = path.relative(process.cwd(), filePath);

    if (dryRun) {
      console.log(`${relative}: would remove ${removed} "items" block(s)`);
      continue;
    }

    const updated = `${JSON.stringify(value, null, 2)}\n`;
    await writeFile(filePath, updated, "utf8");
    console.log(`${relative}: removed ${removed} "items" block(s)`);
  }

  const action = dryRun ? "Would remove" : "Removed";
  console.log(`\n${action} ${totalRemoved} "items" block(s) in ${filesChanged} file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
