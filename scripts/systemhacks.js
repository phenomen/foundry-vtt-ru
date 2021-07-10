Hooks.once("init", async () => {
  loadCSS("modules/ru-ru/styles/" + game.system.id + ".css");

  // D&D5

  if (game.system.id === "dnd5e") {
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
  }

  // DELTA GREEN

  if (game.system.id === "deltagreen") {
    async function sortSkillsAlpha() {
      const lists = document.getElementsByClassName("grid grid-3col");
      for (let list of lists) {
        const competences = list.childNodes;
        let complist = [];
        for (let sk of competences) {
          if (sk.innerText && sk.tagName == "DIV") {
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
  }

  // PATHFINDER 2

  if (game.system.id === "pf2e") {

    if (typeof Babele === "undefined") {

      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы Pathfinder 2e требуется установить и активировать модуль Babele.<p>`,
        buttons: {
            done: {
                label: "Хорошо"
            }
        }
    }).render(true) 
      
    }


    if (typeof Babele !== "undefined") {

      Babele.get().register({
        module: "ru-ru",
        lang: "ru",
        dir: "compendium/pf2e",
      });      
      
      const translatedConditions = new Collection ([
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
          ["Wounded", "Ранение"]
        ]);
      
      const translate = function(originalCondition) {
          let translatedCondition = translatedConditions.get(originalCondition);    
          return translatedCondition ? translatedCondition : originalCondition;
      };
            
      Babele.get().registerConverters({
        "conditionArray": (values) => {
            return values ? values.map(value =>  {  return { "condition": translate(value.condition) }; }) : null;
        }
    });

      Hooks.once("babele.ready", () => {
        game.pf2e.ConditionManager.init();
      });

    }
  }


  // DUNGEON WORLD

  if (game.system.id === "dungeonworld") {
    if (typeof Babele !== "undefined") {
      Babele.get().register({
        module: "ru-ru",
        lang: "ru",
        dir: "compendium/dungeonworld",
      });
    }
  }

  // END
});
