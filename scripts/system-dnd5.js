export function InitDND5() {
  //Сортировка списка навыков в алфавитном порядке
  async function sortSkillsAlpha() {
    const lists = document.getElementsByClassName("skills-list");
    for (let list of lists) {
      const competences = list.childNodes;
      let complist = [];
      for (let sk of competences) {
        if (sk.innerText && sk.tagName == "LI") {
          complist.push(sk);
        }
      }
      complist.sort(function (a, b) {
        return a.innerText.localeCompare(b.innerText);
      });
      for (let sk of complist) {
        list.appendChild(sk);
      }
    }
  }

  Hooks.on("renderActorSheet", async function () {
    sortSkillsAlpha();
  });

  // Выбор источника перевода
  game.settings.register("ru-ru", "altTranslation", {
    name: "Использовать официальный перевод",
    hint: "Использовать официальный перевод D&D5e от издательства Hobby World. Иначе будет использовать альтернативный перевод от Phantom Studio. (Требуется модуль libWrapper)",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  // Настройка активации Babele
  game.settings.register("ru-ru", "compendiumTranslation", {
    name: "Перевод библиотек",
    hint: "Некоторые библиотеки системы D&D5e будут переведены. (Требуется модуль Babele)",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  // Добавление настройки перевода величин в метрическую систему
  game.settings.register("ru-ru", "metricConversion", {
    name: "Конверсия величин в метрическую систему",
    hint: "Значения длинны и веса будут переведены в метры и килограммы. Включение этой настройки перерассчитывает значения в предметах и заклинаниях, но не меняет название величины - это вы можете включить в настройках системы D&D5. (Требуется модуль Babele)",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  if (!game.settings.get("ru-ru", "altTranslation")) {
    libWrapper.register("ru-ru", "game.i18n._getTranslations", loadAltTranslation, "OVERRIDE");
  }

  async function loadAltTranslation() {
    const translations = {};
    const promises = [];
    const lang = "ru";

    // Include core supported translations
    if (CONST.CORE_SUPPORTED_LANGUAGES.includes(lang)) {
      promises.push(this._loadTranslationFile(`lang/${lang}.json`));
    }

    // Default module translations
    if (this.defaultModule !== "core" && game.modules?.has(this.defaultModule)) {
      const defaultModule = game.modules.get(this.defaultModule);
      this._filterLanguagePaths(defaultModule, lang).forEach((path) => {
        promises.push(this._loadTranslationFile(path));
      });
    }

    // Game system translations
    if (game.system) {
      this._filterLanguagePaths(game.system, lang).forEach((path) => {
        promises.push(this._loadTranslationFile(path));
      });
    }

    // Additional (non-default) module translations
    if (game.modules) {
      for (let module of game.modules.values()) {
        if (!module.active || module.id === this.defaultModule) continue;
        this._filterLanguagePaths(module, lang).forEach((path) => {
          promises.push(this._loadTranslationFile(path));
        });
      }
    }

    /// Alternative D&D5 translation
    promises.push(this._loadTranslationFile(`modules/ru-ru/i18n/systems/dnd5e-alt.json`));

    // Merge translations in load order and return the prepared dictionary
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
      dir: "compendium/dnd5e",
    });
  } else {
    if (game.settings.get("ru-ru", "compendiumTranslation")) {
      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы D&D5 требуется установить и активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля, чтобы это окно больше не отображалось.</p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  }

  Babele.get().registerConverters({
    "weight": (value) => {
      if (game.settings.get("ru-ru", "metricConversion")) {
        return parseInt(value) / 2;
      } else {
        return value;
      }
    },
    "range": (range) => {
      if (range) {
        if (game.settings.get("ru-ru", "metricConversion")) {
          if (range.units === "ft") {
            if (range.long) {
              range = mergeObject(range, { long: range.long * 0.3 });
            }
            range.units = "m";
            return mergeObject(range, { value: range.value * 0.3 });
          }
          if (range.units === "mi") {
            if (range.long) {
              range = mergeObject(range, { long: range.long * 1.5 });
            }
            range.units = "km";
            return mergeObject(range, { value: range.value * 1.5 });
          }
        }
        return range;
      }
    },
    "movement": (movement) => {
      if (movement) {
        if (game.settings.get("ru-ru", "metricConversion")) {
          if (movement.units === "ft") {
            for (var i in movement) {
              if (movement[i] === "ft") {
                movement[i] = "m";
              } else {
                movement[i] = movement[i] * 0.3;
              }
            }
          }
          if (movement.units === "mi") {
            for (var i in movement) {
              if (movement[i] === "mi") {
                movement[i] = "km";
              } else {
                movement[i] = movement[i] * 1.5;
              }
            }
          }
        }
        return movement;
      }
    },
  });

  Hooks.on("createActor", (actor) => {
    if (game.settings.get("ru-ru", "metricConversion") && actor.data.data.attributes.movement.walk == 30) {
      mergeObject(actor.data.data.attributes.movement, { units: "m", walk: 9 });
      actor.update({ data: actor.data.data });
      actor.render(true);
    }
  });
}
