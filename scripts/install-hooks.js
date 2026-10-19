import { chmod, copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

if (!existsSync(".git")) {
  process.exit(0);
}

await mkdir(".git/hooks", { recursive: true });
await copyFile("scripts/git-hooks/pre-commit", ".git/hooks/pre-commit");
await chmod(".git/hooks/pre-commit", 0o755);
