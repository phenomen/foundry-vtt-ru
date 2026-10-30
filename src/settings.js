/**
 * Registers the module-wide settings. Must run after `registerFonts`,
 * because `sceneLabelFont` lists the entries of `CONFIG.fontDefinitions`.
 */
export function registerSettings() {
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
}
