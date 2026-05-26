import { glob } from "node:fs/promises";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const patterns = {
  modules: "public/i18n/modules/*.json",
  systems: "public/i18n/systems/*.json",
  styles: "public/styles/*.css",
};

const languages = [
  {
    lang: "ru",
    name: "Russian",
    path: "i18n/core/foundry.json",
  },
  {
    lang: "ru",
    path: "i18n/core/extras.json",
  },
  {
    lang: "ru",
    path: "i18n/core/adjectives_m.json",
  },
  {
    lang: "ru",
    path: "i18n/systems/misc/dnd5e-plural.json",
    system: "dnd5e",
  },
];

function toPublicPath(file) {
  return file.replace(/\\/g, "/").replace("public/", "");
}

async function main() {
  const manifestPath = "./public/module.json";
  const manifestData = JSON.parse(await readFile(manifestPath, "utf8"));

  const systems = [];
  const modules = [];
  const styles = [];

  for await (const file of glob(patterns.systems)) {
    systems.push({
      lang: "ru",
      path: toPublicPath(file),
      system: path.basename(file, ".json"),
    });
  }

  for await (const file of glob(patterns.modules)) {
    modules.push({
      module: path.basename(file, ".json"),
      path: toPublicPath(file),
      lang: "ru",
    });
  }

  for await (const file of glob(patterns.styles)) {
    const name = path.basename(file, ".css");
    if (name !== "_fonts" && name !== "_main") {
      styles.push(name);
    }
  }

  languages.push(...systems, ...modules);

  manifestData.languages = languages;
  manifestData.flags.styles = styles;

  await writeFile(manifestPath, JSON.stringify(manifestData, null, "\t"), "utf8");
}

main();
