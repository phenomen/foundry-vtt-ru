export function InitPF2E() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/pf2e",
    });

    const translatedConditions = new Collection([
      ["Blinded", "Слепота"],
      ["Broken", "Поломка"],
      ["Clumsy", "Неуклюжесть"],
      ["Concealed", "Плохая видимость"],
      ["Confused", "Замешательство"],
      ["Controlled", "Контроль"],
      ["Dazzled", "Растерянность"],
      ["Deafened", "Глухота"],
      ["Doomed", "Обречённость"],
      ["Drained", "Истощение"],
      ["Dying", "При смерти"],
      ["Encumbered", "Нагруженность"],
      ["Enfeebled", "Слабость"],
      ["Fascinated", "Завороженность"],
      ["Fatigued", "Утомление"],
      ["Flat-Footed", "Застигнутость врасплох"],
      ["Fleeing", "Паника"],
      ["Friendly", "Дружелюбие"],
      ["Frightened", "Испуг"],
      ["Grabbed", "Захват"],
      ["Helpful", "Готовность помочь"],
      ["Hidden", "Спрятанность"],
      ["Hostile", "Враждебность"],
      ["Immobilized", "Неподвижность"],
      ["Immobilized", "Неподвижность"],
      ["Indifferent", "Безразличие"],
      ["Invisible", "Невидимость"],
      ["Observed", "Видимость"],
      ["Paralyzed", "Паралич"],
      ["Persistent Damage", "Продолжительный урон"],
      ["Petrified", "Окаменение"],
      ["Prone", "Распластанность"],
      ["Quickened", "Ускорение"],
      ["Restrained", "Обездвиженность"],
      ["Sickened", "Тошнота"],
      ["Slowed", "Замедление"],
      ["Stunned", "Шок"],
      ["Stupefied", "Ошеломление"],
      ["Unconscious", "Без сознания"],
      ["Undetected", "Необнаруженность"],
      ["Unfriendly", "Недружелюбие"],
      ["Unnoticed", "Незамеченность"],
      ["Wounded", "Ранение"],
    ]);

    const translate = function (originalCondition) {
      let translatedCondition = translatedConditions.get(originalCondition);
      return translatedCondition ? translatedCondition : originalCondition;
    };

    Babele.get().registerConverters({
      conditionArray: (values) => {
        return values
          ? values.map((value) => {
              return { condition: translate(value.condition) };
            })
          : null;
      },
    });

    Hooks.once("babele.ready", () => {
      game.pf2e.ConditionManager.init();

      if (typeof Babele === "undefined" && game.user.isGM) {
        new Dialog({
          title: "Перевод библиотек",
          content: `<p>Для перевода библиотек системы Pathfinder 2e требуется установить и активировать модуль Babele.<p>`,
          buttons: {
            done: {
              label: "Хорошо",
            },
          },
        }).render(true);
      }
    });
  }
}
