import { cp, rm } from "node:fs/promises";

const outdir = "ru-ru";
const bundlePath = `${outdir}/esm/index.js`;

await rm(outdir, { recursive: true, force: true });
await cp("public", outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.js"],
  outdir,
  target: "browser",
  format: "esm",
  minify: true,
  splitting: false,
  sourcemap: "none",
  naming: "esm/[name].[ext]",
  external: ["../../babele/script/converters.js"],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

const bundle = Bun.file(bundlePath);
if (!(await bundle.exists())) {
  throw new Error(`Build failed: ${bundlePath} is missing`);
}

const text = await bundle.text();
if (text.includes("import.meta.glob")) {
  throw new Error("Build failed: bundle still contains import.meta.glob");
}
