import { cp, rm } from "node:fs/promises";

const outdir = "ru-ru";

await rm(outdir, { recursive: true, force: true });
await cp("public", outdir, { recursive: true });

await Bun.build({
  entrypoints: ["./src/index.js"],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  naming: "esm/[name].[ext]",
});
