export async function init() {
  game.settings.register("ru-ru", "altTranslation", {
    name: "(D&D5E) Альтернативный перевод",
    hint: "Использовать альтернативный перевод от Dungeons.ru. Иначе будет использоваться официальный перевод Hobby World и Adventure Guys (требуется модуль libWrapper)",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (_value) => {
      window.location.reload();
    },
  });

  if (typeof libWrapper === "function" && game.settings.get("ru-ru", "altTranslation")) {
    libWrapper.register("ru-ru", "game.i18n.setLanguage", loadAltTranslation, "MIXED");
  }
}

async function loadAltTranslation(wrapped, ...args) {
  await wrapped(...args);

  const route = foundry.utils.getRoute("/");
  const modulePath = "modules/ru-ru/i18n/modules/alt/";
  const systemPath = "modules/ru-ru/i18n/systems/alt/";

  const systemFiles = ["dnd5e.json", "dnd5e-plural.json"];
  const moduleFiles = [
    "action-pack.json",
    "activeauras.json",
    "always-hp.json",
    "arbron-hp-bar.json",
    "autoanimations.json",
    "bossbar.json",
    "combat-utility-belt.json",
    "combatbooster.json",
    "compendium-browser.json",
    "damage-log.json",
    "dnd5e-system-customizer.json",
    "enhancedcombathud-dnd5e.json",
    "enhancedcombathud.json",
    "epic-rolls-5e.json",
    "gatherer.json",
    "health-monitor.json",
    "healthestimate.json",
    "lmrtfy.json",
    "midi-qol.json",
    "ready-set-roll-5e.json",
    "splatter.json",
    "tidy5e-sheet.json",
    "token-action-hud-dnd5e.json",
    "vision-5e.json",
  ];

  const files = [
    ...systemFiles.map((file) => `${route}${systemPath}${file}`),
    ...moduleFiles.map((file) => `${route}${modulePath}${file}`),
  ];

  // Временный объект, чтобы не мержить в петле огромный объект основного перевода
  const altTranslations = {};

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        return await foundry.utils.fetchJsonWithTimeout(file);
      } catch (error) {
        console.warn(`Не удалось загрузить файл: ${file}`, error);
        return null;
      }
    }),
  );

  for (const altJson of results) {
    if (altJson) {
      // Мерж развёрнутого объекта, как это делается в game.i18n.#loadTranslationFile
      foundry.utils.mergeObject(altTranslations, foundry.utils.expandObject(altJson));
    }
  }
  // Мерж альтернативного перевода в основной
  foundry.utils.mergeObject(game.i18n.translations, altTranslations);
}
