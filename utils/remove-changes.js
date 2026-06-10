/**
 * Removes all "changes" properties from Babele compendium JSON files.
 *
 * Usage:
 *   node utils/remove-changes.js [--dry-run] [path...]
 *
 * Default path: public/compendium
 */
import { access, glob, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ROOT = "public/compendium";

/**
 * @param {unknown} value
 * @returns {{ value: unknown; removed: number }}
 */
function stripChanges(value) {
  if (Array.isArray(value)) {
    let removed = 0;
    const next = value.map((item) => {
      const result = stripChanges(item);
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
      if (key === "changes") {
        removed += 1;
      } else {
        const result = stripChanges(child);
        removed += result.removed;
        next[key] = result.value;
      }
    }

    return { value: next, removed };
  }

  return { value, removed: 0 };
}

/**
 * @param {string} root
 * @returns {Promise<string[]>}
 */
async function collectJsonFiles(root) {
  const resolved = path.resolve(root);

  try {
    await access(resolved);
  } catch {
    throw new Error(`Path not found: ${resolved}`);
  }

  const files = [];

  for await (const file of glob("**/*.json", { cwd: resolved })) {
    files.push(path.join(resolved, file));
  }

  return files.sort();
}

/**
 * @param {string} filePath
 * @param {boolean} dryRun
 * @returns {Promise<{ removed: number; changed: boolean }>}
 */
async function processFile(filePath, dryRun) {
  const original = await readFile(filePath, "utf8");
  const data = JSON.parse(original);
  const { value, removed } = stripChanges(data);

  if (removed === 0) {
    return { removed: 0, changed: false };
  }

  const relative = path.relative(process.cwd(), filePath);

  if (dryRun) {
    console.log(`${relative}: would remove ${removed} "changes" block(s)`);
    return { removed, changed: true };
  }

  const updated = `${JSON.stringify(value, null, 2)}\n`;
  await writeFile(filePath, updated, "utf8");
  console.log(`${relative}: removed ${removed} "changes" block(s)`);
  return { removed, changed: true };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((arg) => arg !== "--dry-run");

  let roots;
  if (paths.length > 0) {
    roots = paths;
  } else {
    roots = [DEFAULT_ROOT];
  }

  const fileSets = await Promise.all(roots.map(collectJsonFiles));
  const files = fileSets.flat();
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

  console.log(`\n${action} ${totalRemoved} "changes" block(s) in ${filesChanged} file(s).`);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
