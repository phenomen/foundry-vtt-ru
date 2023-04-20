import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { transform } from "lightningcss";

const srcDir = "./src/styles/";
const distDir = "./ru-ru/styles/";

mkdir(distDir, { recursive: true }).catch((err) => {
  console.error(`Error creating directory ${distDir}: ${err.message}`);
});

readdir(srcDir)
  .then(async (files) => {
    const cssFiles = files.filter((file) => file.endsWith(".css"));

    for (const file of cssFiles) {
      const srcPath = path.join(srcDir, file);
      const distPath = path.join(distDir, file);

      try {
        const srcCode = await readFile(srcPath);

        const { code } = await transform({
          filename: file,
          code: srcCode,
          minify: true,
          sourceMap: false,
        });

        await writeFile(distPath, code);
      } catch (err) {
        console.error(`Error minifying ${srcPath}: ${err.message}`);
      }
    }
  })
  .catch((err) => {
    console.error(err);
  });
