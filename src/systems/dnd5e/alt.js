export function init() {
  game.settings.register("ru-ru", "altTranslation", {
    config: true,
    default: false,
    hint: "Использовать альтернативный перевод от Dungeons.ru. Иначе будет использоваться официальный перевод Hobby World и Adventure Guys (требуется модуль libWrapper)",
    name: "(D&D5E) Альтернативный перевод",
    onChange: () => {
      window.location.reload();
    },
    restricted: true,
    scope: "world",
    type: Boolean,
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
      foundry.utils.mergeObject(altTranslations, foundry.utils.expandObject(altJson));
    }
  }

  foundry.utils.mergeObject(game.i18n.translations, altTranslations);
}
