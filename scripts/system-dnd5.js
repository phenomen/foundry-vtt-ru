export function InitDND5() {
  // Выбор источника перевода
  game.settings.register("ru-ru", "altTranslation", {
    name: "Использовать альтернативный перевод",
    hint: "(Требуется модуль libWrapper) Использовать альтернативный перевод D&D5e от Phantom Studio. Иначе будет использоваться официальный перевод издательства Hobby World.",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  // Уведомление выбора перевода
  game.settings.register("ru-ru", "altTranslationSelected", {
    type: Boolean,
    default: false,
    scope: "world",
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  // Настройка активации Babele
  game.settings.register("ru-ru", "compendiumTranslation", {
    name: "Перевод библиотек",
    hint: "(Требуется модуль Babele) Некоторые библиотеки системы D&D5e будут переведены.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  if (!game.settings.get("ru-ru", "altTranslationSelected")) {
    new Dialog({
      title: "Выбор перевода",
      content: `<p>Выберите предпочитаемый перевод системы D&D5. Вы можете изменить это позже в настройках модуля</p>`,
      buttons: {
        hw: {
          label: "Hobby World",
          callback: () => {
            game.settings.set("ru-ru", "altTranslation", false);
            game.settings.set("ru-ru", "altTranslationSelected", true);
          },
        },
        ph: {
          label: "Phantom Studio",
          callback: () => {
            game.settings.set("ru-ru", "altTranslation", true);
            game.settings.set("ru-ru", "altTranslationSelected", true);
          },
        },
      },
    }).render(true);
  }

  if (game.settings.get("ru-ru", "altTranslation")) {
    if (typeof libWrapper === "function") {
      libWrapper.register("ru-ru", "game.i18n._getTranslations", loadAltTranslation, "MIXED");
    } else {
      new Dialog({
        title: "Альтернативный перевод",
        content: `<p>Для использования альтернативного перевода требуется активировать модуль <b>libWrapper</b></p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  }

  // Alternative D&D5 translation
  async function loadAltTranslation(wrapped, lang) {
    const translations = await wrapped(lang);
    const promises = [];

    promises.push(
      this._loadTranslationFile(`modules/ru-ru/i18n/systems/dnd5e-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/always-hp-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/arbron-hp-bar-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/combat-utility-belt-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/dae-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/damage-log-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/health-monitor-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/midi-qol-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/tidy5e-sheet-alt.json`),
      this._loadTranslationFile(`modules/ru-ru/i18n/modules/token-action-hud-alt.json`)
    );

    await Promise.all(promises);
    for (let p of promises) {
      let json = await p;
      foundry.utils.mergeObject(translations, json, { inplace: true });
    }

    return translations;
  }

  // Регистрация Babele
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: game.settings.get("ru-ru", "altTranslation") ? "compendium/dnd5e-alt" : "compendium/dnd5e",
    });
  } else {
    if (game.settings.get("ru-ru", "compendiumTranslation")) {
      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы D&D5 требуется активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля</p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
          never: {
            label: "Больше не показывать",
            callback: () => {
              game.settings.set("ru-ru", "compendiumTranslation", false);
            },
          },
        },
      }).render(true);
    }
  }
}
