import { Glob } from "bun";
import path from "path";

const manifest = Bun.file("./public/module.json");

let systems = [];
let modules = [];
let styles = [];

const globs = {
  systems: new Glob("public/i18n/systems/*.json"),
  modules: new Glob("public/i18n/modules/*.json"),
  styles: new Glob("public/styles/*.css"),
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

for await (const file of globs.systems.scan(".")) {
  systems.push({
    lang: "ru",
    path: file.replace(/\\/g, "/").replace("public/", ""),
    system: path.basename(file, ".json"),
  });
}

for await (const file of globs.modules.scan(".")) {
  modules.push({
    lang: "ru",
    path: file.replace(/\\/g, "/").replace("public/", ""),
    module: path.basename(file, ".json"),
  });
}

for await (const file of globs.styles.scan(".")) {
  styles.push(path.basename(file, ".css"));
}

languages.push(...systems, ...modules);

const manifestData = await manifest.json();
manifestData.languages = languages;
manifestData.flags.styles = styles;

await Bun.write("./public/module.json", JSON.stringify(manifestData, null, "\t"));
