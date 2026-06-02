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
        continue;
      }

      const result = stripChanges(child);
      removed += result.removed;
      next[key] = result.value;
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

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const paths = args.filter((arg) => arg !== "--dry-run");

  const roots = paths.length > 0 ? paths : [DEFAULT_ROOT];

  let totalRemoved = 0;
  let filesChanged = 0;

  for (const root of roots) {
    const files = await collectJsonFiles(root);

    for (const filePath of files) {
      const original = await readFile(filePath, "utf8");
      const data = JSON.parse(original);
      const { value, removed } = stripChanges(data);

      if (removed === 0) {
        continue;
      }

      totalRemoved += removed;
      filesChanged += 1;

      const relative = path.relative(process.cwd(), filePath);

      if (dryRun) {
        console.log(`${relative}: would remove ${removed} "changes" block(s)`);
        continue;
      }

      const updated = `${JSON.stringify(value, null, 2)}\n`;
      await writeFile(filePath, updated, "utf8");
      console.log(`${relative}: removed ${removed} "changes" block(s)`);
    }
  }

  const action = dryRun ? "Would remove" : "Removed";
  console.log(`\n${action} ${totalRemoved} "changes" block(s) in ${filesChanged} file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
