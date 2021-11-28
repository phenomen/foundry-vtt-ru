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

  // Регистрация Babele
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/dnd5e",
    });

    // Добавление настройки перевода величин в метрическую систему
    game.settings.register("ru-ru", "metricConversion", {
      name: "Конверсия величин в метрическую систему",
      hint: "Значения длинны и веса будут переведены в метры и килограммы. Включение этой настройки перерассчитывает значения в предметах и заклинаниях, но не меняет название величины - это вы можете включить в настройках системы D&D5.",
      type: Boolean,
      default: false,
      scope: "world",
      config: true,
      onChange: (value) => {
        window.location.reload();
      },
    });
  } else {
    new Dialog({
      title: "Перевод библиотек",
      content: `<p>Для перевода библиотек системы D&D5 требуется установить и активировать модуль <b>Babele</b><p>`,
      buttons: {
        done: {
          label: "Хорошо",
        },
      },
    }).render(true);
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
