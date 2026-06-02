import { applyBabeleDefaults, warnBabeleMissing } from "./babele-helpers.js";
import { init as dnd5eAlt } from "./systems/dnd5e/alt.js";

const systemScripts = import.meta.glob("./systems/*.js");

const CYRILLIC_FONTS = [
  "Beaufort",
  "Exocet",
  "GWENT",
  "Manuskript",
  "Marck Script",
  "OCR-A",
  "Roboto",
  "Roboto Condensed",
  "Roboto Serif",
];

function getSystemScriptPath(systemId) {
  return `./systems/${systemId}.js`;
}

async function loadSystemModule(systemId) {
  const load = systemScripts[getSystemScriptPath(systemId)];
  if (!load) {
    return null;
  }
  return load();
}

Hooks.once("babele.init", async (babele) => {
  const systemId = game.system.id.toLowerCase();
  const mod = await loadSystemModule(systemId);
  if (!mod) {
    return;
  }

  await mod.registerBabeleTranslations?.(babele);
  await mod.registerBabeleConverters?.(babele);
  applyBabeleDefaults();
});

Hooks.once("init", async () => {
  const systemId = game.system.id.toLowerCase();

  // Have to load this synchronously
  if (systemId === "dnd5e") {
    dnd5eAlt();
  }

  const route = foundry.utils.getRoute("/");

  if (game.modules.get("ru-ru").flags.styles.includes(systemId)) {
    const systemCSS = document.createElement("link");
    systemCSS.rel = "stylesheet";
    systemCSS.href = `${route}modules/ru-ru/styles/${systemId}.css`;
    document.head.appendChild(systemCSS);
  }

  const cyrillicFonts = Object.fromEntries(
    CYRILLIC_FONTS.map((family) => [family, { editor: true, fonts: [] }]),
  );

  CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, cyrillicFonts);
  CONFIG.defaultFontFamily = "Roboto";

  game.settings.register("ru-ru", "compendiumTranslation", {
    config: true,
    default: true,
    hint: "Некоторые библиотеки системы будут переведены (требуется модуль Babele). Отключите, если хотите использовать оригинальные библиотеки.",
    name: "Перевод библиотек",
    onChange: () => {
      window.location.reload();
    },
    restricted: true,
    scope: "world",
    type: Boolean,
  });

  game.settings.register("ru-ru", "sceneLabelFont", {
    choices: Object.keys(CONFIG.fontDefinitions),
    config: true,
    default: Object.keys(CONFIG.fontDefinitions).indexOf(CONFIG.defaultFontFamily),
    hint: "Шрифт, используемый для имён токенов и названий заметок на сцене.",
    name: "Шрифт подписей на сцене",
    onChange: () => {
      window.location.reload();
    },
    restricted: true,
    scope: "world",
    type: Number,
  });

  CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
    game.settings.get("ru-ru", "sceneLabelFont")
  ];

  CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

  const mod = await loadSystemModule(systemId);

  if (mod?.registerBabeleTranslations) {
    warnBabeleMissing();
  }

  await mod?.init?.();
});
