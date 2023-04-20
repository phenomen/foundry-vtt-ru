export function init() {
  if (typeof Babele === "undefined") {
    new Dialog({
      title: "Перевод библиотек",
      content: `<p>Для перевода библиотек системы WFRP4 требуется установить и активировать модуль <b>Babele</b><p>`,
      buttons: {
        done: {
          label: "Хорошо",
        },
      },
    }).render(true);
  } else {
    let specs = {
      "Any": "Любое",
      //Difficulties
      "Very Easy": "Элементарная",
      "Easy": "Лёгкая",
      "Average": "Заурядная",
      "Challenging": "Серьёзная",
      "Difficultly": "Трудная",
      "Hard": "Тяжёлая",
      "Very Hard": "Безумная",
      // Corruption
      "Minor": "Лёгкий",
      "Moderate": "Сильный",
      "Major": "Серьезный",
    };

    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/wfrp4e",
    });

    Babele.get().registerConverters({
      entry_effects: (effects, translations, data, translatedCompendium, translatedEntry) => {
        if (effects) {
          return effects.map((effect) => {
            if (data.name === effect.label) {
              effect.label = translatedEntry.name;
            }
            return effect;
          });
        }
      },
      injury_effects: (effects, translations, data, translatedCompendium, translatedEntry) => {
        if (effects) {
          let baseName = data.name.replace(/ \(.*\)/, "");
          return effects.map((effect) => {
            if (baseName === effect.label) {
              effect.label = translatedEntry.name;
            }
            return effect;
          });
        }
      },
      disease_effects: (effects, translations, data, translatedCompendium, translatedEntry) => {
        if (effects) {
          let translatedSymptoms = translatedEntry.symptoms.split(/,\s?/).reduce((acc, curr) => {
            for (const [key, symptom] of Object.entries(game.wfrp4e.config.symptoms)) {
              if (curr.startsWith(symptom)) {
                return (acc[key] = curr), acc;
              }
            }
          }, {});
          return effects.map((effect) => {
            for (const symptom in game.wfrp4e.config.symptoms) {
              if (effect.label.toLowerCase().startsWith(symptom.split(/[A-Z]/)[0])) {
                effect.label = translatedSymptoms[symptom];
                break;
              }
            }

            if (effect.label.startsWith("Незаживающая рана")) {
              effect.flags.wfrp4e.script = effect.flags.wfrp4e.script.replaceAll(
                "Endurance",
                game.i18n.localize("NAME.Endurance")
              );
            }

            if (effect.label.startsWith("Судороги")) {
              effect.flags.wfrp4e.script = effect.flags.wfrp4e.script.replaceAll(
                "Moderate",
                "сильные"
              );
            }

            if (effect.label.startsWith("Летальный исход")) {
              effect.flags.wfrp4e.script = effect.flags.wfrp4e.script
                .replaceAll("Moderate", "вероятный")
                .replaceAll("Severe", "очень вероятный");
            }

            return effect;
          });
        }
      },
      condition_effects: (effects) => {
        if (effects) {
          return effects.map((effect) => {
            let effectKey = "WFRP4E.ConditionName." + effect.label;
            let translatedEffect = game.i18n.localize(effectKey);
            if (translatedEffect !== effectKey) {
              effect.label = translatedEffect;
            }
            return effect;
          });
        }
      },
      npc_characteristics: (chars) => {
        for (let key in chars) {
          let char = chars[key];
          let abrev = char.abrev;

          // Some of NPCs have localization keys in their characteristics, meanwhile others don't
          // This will patch NPCs that don't utilize translation keys
          if (abrev && !abrev.includes("CHARAbbrev.")) {
            char.label = "CHAR." + abrev;
            char.abrev = "CHARAbbrev." + abrev;
          }
        }

        return chars;
      },
      npc_traits: (npcTraits) => {
        if (!npcTraits) {
          return;
        }

        const fullTraits = WfrpCompendiumTranslations.traits();
        const fullSkills = WfrpCompendiumTranslations.skills();
        const fullTalents = WfrpCompendiumTranslations.talents();
        const fullCareers = WfrpCompendiumTranslations.careers();
        const fullTrappings = WfrpCompendiumTranslations.trappings();
        const fullSpells = WfrpCompendiumTranslations.spells();
        const fullPrayers = WfrpCompendiumTranslations.prayers();

        for (let originalTrait of npcTraits) {
          let parsedTrait = parseTraitName(originalTrait.name);

          if (originalTrait.type === "trait") {
            let translatedTrait =
              fullTraits.find((trait) => trait === parsedTrait.baseName) ||
              fullTraits.find((trait) => trait.startsWith(parsedTrait.baseName));
            if (!translatedTrait) {
              continue;
            }

            originalTrait.name = translatedTrait.name.replace(/ \(.*\)/, parsedTrait.special);
            if (typeof originalTrait.type !== "undefined") {
              originalTrait.name = originalTrait.name.replace("#", parsedTrait.tentacles);
            }
            originalTrait.system.description.value = translatedTrait.description;

            if (isNaN(originalTrait.system.specification.value)) {
              // This is a string, so translate it
              originalTrait.system.specification.value = translateSpecification(
                originalTrait.system.specification.value
              );
            }
          } else if (originalTrait.type === "skill") {
            let translatedSkill = translateSkill(parsedTrait, fullSkills);

            if (translatedSkill) {
              originalTrait.name = translatedSkill.name.replace(/ \( ?\)/, parsedTrait.special);
              originalTrait.system.description.value = translatedSkill.description;
            }
          } else if (originalTrait.type === "prayer") {
            let translatedTrait = fullPrayers.find((prayer) => prayer === parsedTrait.baseName);
            if (translatedTrait) {
              originalTrait.name = translatedTrait.name + parsedTrait.special;
              originalTrait.system.description.value = translatedTrait.description;
            }
          } else if (originalTrait.type === "spell") {
            let translatedTrait = fullSpells.find((spell) => spell === parsedTrait.baseName);
            if (translatedTrait) {
              originalTrait.name = translatedTrait.name + parsedTrait.special;
              originalTrait.system.description.value = translatedTrait.description;
            }
          } else if (originalTrait.type === "talent") {
            let translatedTrait = fullTalents.find((talent) => talent === parsedTrait.baseName);

            if (translatedTrait) {
              originalTrait.name = translatedTrait.name + parsedTrait.special;
              originalTrait.system.description.value = translatedTrait.description;
              originalTrait.system.tests = translatedTrait.tests;
            }
          } else if (originalTrait.type === "career") {
            let translatedTrait = fullCareers.find((career) => career === originalTrait.name);
            if (translatedTrait) {
              originalTrait.name = translatedTrait.name;
            }
          } else if (
            originalTrait.type === "trapping" ||
            originalTrait.type === "weapon" ||
            originalTrait.type === "armour" ||
            originalTrait.type === "container" ||
            originalTrait.type === "money"
          ) {
            let translatedTrapping = fullTrappings.find(
              (trapping) => trapping === originalTrait.name
            );
            if (!translatedTrapping) {
              continue;
            }

            originalTrait.name = translatedTrapping.name;
            originalTrait.system.description = translatedTrapping.description;
          }
        }
        return npcTraits;
      },
      skills: (skills) => {
        const fullSkills = WfrpCompendiumTranslations.skills();
        return skills.map((skill) => {
          let parsedSkill = parseTraitName(skill);
          let translatedSkill = translateSkill(parsedSkill, fullSkills);

          if (translatedSkill) {
            return translatedSkill.name.replace(/ \( ?\)/, parsedSkill.special);
          }

          return skill;
        });
      },
      talents: (talents) => {
        const fullTalents = WfrpCompendiumTranslations.talents();
        return talents.map((talent) => {
          let parsedTalent = parseTraitName(talent);
          let translatedTalent = fullTalents.find((talent) => talent === parsedTalent.baseName);

          if (translatedTalent) {
            return translatedTalent.name + parsedTalent.special;
          }

          return talent;
        });
      },
    });

    function translateSkill(parsedSkill, fullSkills) {
      if (parsedSkill.special) {
        let translatedSkill = fullSkills.find(
          (skill) => skill === parsedSkill.baseName + parsedSkill.special
        );

        if (translatedSkill) {
          return translatedSkill;
        }
      }

      return fullSkills.find((skill) => skill.match(new RegExp(parsedSkill.baseName + "( ( ?))?")));
    }

    function translateSpecification(originalSpecification) {
      let trimmedSpecification = originalSpecification.trim();
      let specificationKey = "SPEC." + trimmedSpecification;
      let specification = specs[trimmedSpecification] || game.i18n.localize(specificationKey);

      return specification !== specificationKey ? specification : trimmedSpecification;
    }

    function parseTraitName(traitName) {
      traitName = traitName.trim();
      let parsedTrait = {
        baseName: traitName,
        special: "",
        tentacles: "",
      };

      // Process specific Tentacles case
      if (traitName.includes("Tentacles")) {
        let res = /(?<tentacles>\d+)x Tentacles/i.exec(traitName);
        parsedTrait.baseName = "# Tentacles";
        parsedTrait.tentacles = res.groups.tentacles;
      }

      // Process specific skills name with (xxxx) inside
      if (traitName.includes("(") && traitName.includes(")")) {
        let res = /(.*) *\((.*)\)/i.exec(traitName);
        parsedTrait.baseName = res[1].trim();
        parsedTrait.special = " (" + translateSpecification(res[2]) + ")";
      }

      return parsedTrait;
    }
    //END

    Hooks.once("ready", () => {
      patchWfrpConfig();

      function patchWfrpConfig() {
        const WFRP4E = {};

        WFRP4E.weaponTypes = {
          melee: "Оружие ближнего боя",
          ranged: "Дистанционное оружие",
        };

        WFRP4E.magicLores = {
          petty: "Простейшие заклинания",
          beasts: "Школа Зверей",
          death: "Школа Смерти",
          fire: "Школа Огня",
          heavens: "Школа Небес",
          metal: "Школа Металла",
          life: "Школа Жизни",
          light: "Школа Света",
          shadow: "Школа Тени",
          hedgecraft: "Школа Знахарства",
          witchcraft: "Школа Ведьмовства",
          daemonology: "Школа Демонологии",
          necromancy: "Школа Некромантии",
          nurgle: "Школа Нургла",
          slaanesh: "Школа Слаанеша",
          tzeentch: "Школа Тзинча",
        };

        WFRP4E.magicWind = {
          petty: "Нет",
          beasts: "Гарр",
          death: "Шаиш",
          fire: "Акши",
          heavens: "Азир",
          metal: "Шамон",
          life: "Гайран",
          light: "Хиш",
          shadow: "Улгу",
          hedgecraft: "Нет",
          witchcraft: "Нет",
          daemonology: "Дхар",
          necromancy: "Дхар",
          nurgle: "Дхар",
          slaanesh: "Дхар",
          tzeentch: "Дхар",
        };

        // Species
        WFRP4E.species = {
          human: "Человек",
          dwarf: "Гном",
          halfling: "Полурослик",
          helf: "Высший эльф",
          welf: "Лесной эльф",
        };

        WFRP4E.subspecies = {
          human: {
            reiklander: {
              name: "Рейкландец",
              skills: [
                "Обращение с животными",
                "Обаяние",
                "Хладнокровие",
                "Оценка",
                "Сплетничество",
                "Торговля",
                "Язык (бретонский)",
                "Язык (вестерландский)",
                "Лидерство",
                "Знание (Рейкланд)",
                "Рукопашный бой (основное)",
                "Стрельба (луки)",
              ],
              talents: ["Роковое Пророчество", "Смекалка, Учтивость", 3],
            },
          },
        };

        WFRP4E.speciesSkills = {
          human: [
            "Обращение с животными",
            "Обаяние",
            "Хладнокровие",
            "Оценка",
            "Сплетничество",
            "Торговля",
            "Язык (бретонский)",
            "Язык (вестерландский)",
            "Лидерство",
            "Знание (Рейкланд)",
            "Рукопашный бой (основное)",
            "Стрельба (луки)",
          ],
          dwarf: [
            "Кутёж",
            "Хладнокровие",
            "Стойкость",
            "Артистизм (сказительство)",
            "Оценка",
            "Запугивание",
            "Язык (кхазалид)",
            "Знание (гномы)",
            "Знание (геология)",
            "Знание (металлургия)",
            "Рукопашный бой (основное)",
            "Ремесло (любое)",
          ],
          halfling: [
            "Обаяние",
            "Кутёж",
            "Уклонение",
            "Азартные игры",
            "Торговля",
            "Интуиция",
            "Язык (мутландский)",
            "Знание (Рейкланд)",
            "Наблюдательность",
            "Ловкость рук",
            "Скрытность (любая)",
            "Ремесло (повар)",
          ],
          helf: [
            "Хладнокровие",
            "Артистизм (пение)",
            "Оценка",
            "Язык (эльтарин)",
            "Лидерство",
            "Рукопашный бой (основное)",
            "Ориентирование",
            "Наблюдательность",
            "Музицирование (любое)",
            "Стрельба (луки)",
            "Хождение под парусом",
            "Плавание",
          ],
          welf: [
            "Атлетика",
            "Лазание",
            "Стойкость",
            "Артистизм (пение)",
            "Запугивание",
            "Язык (эльтарин)",
            "Рукопашный бой (основное)",
            "Выживание",
            "Наблюдательность",
            "Стрельба (луки)",
            "Скрытность (дикая природа)",
            "Выслеживание",
          ],
        };

        WFRP4E.speciesTalents = {
          human: ["Роковое Пророчество", "Смекалка, Учтивость", 3],
          dwarf: [
            "Устойчивость к магии",
            "Сумеречное зрение",
            "Грамотность, Непреклонность",
            "Целеустремлённость, Твёрдость духа",
            "Бугай",
            0,
          ],
          halfling: [
            "Обострённое восприятие (Вкус)",
            "Сумеречное зрение",
            "Устойчивость (Хаос)",
            "Небольшой",
            2,
          ],
          helf: [
            "Обострённое восприятие (Зрение)",
            "Самообладание, Смекалка",
            "Сумеречное зрение",
            "Второе зрение, Шестое чувство",
            "Грамотность",
            0,
          ],
          welf: [
            "Обострённое восприятие (Зрение)",
            "Здоровяк, Второе зрение",
            "Сумеречное зрение",
            "Грамотность, Закалка",
            "Скиталец",
            0,
          ],
        };

        // Weapon Group Descriptions
        WFRP4E.weaponGroupDescriptions = {
          basic: "основное",
          cavalry: "WFRP4E.GroupDescription.Cavalry",
          fencing: "фехтовальное",
          brawling: "кулачное",
          flail: "WFRP4E.GroupDescription.Flail",
          parry: "WFRP4E.GroupDescription.Parry",
          polearm: "древковое",
          twohanded: "двуручное",
          blackpowder: "WFRP4E.GroupDescription.Blackpowder",
          bow: "лук",
          crossbow: "WFRP4E.GroupDescription.Crossbow",
          entangling: "ловчее",
          engineering: "WFRP4E.GroupDescription.Engineering",
          explosives: "WFRP4E.GroupDescription.Explosives",
          sling: "праща",
          throwing: "WFRP4E.GroupDescription.Throwing",
        };

        WFRP4E.symptoms = {
          blight: "Летальный исход",
          buboes: "Бубоны",
          convulsions: "Судороги",
          coughsAndSneezes: "Чихание и кашель",
          fever: "Жар",
          flux: "Понос",
          gangrene: "Гангрена",
          lingering: "Осложнения",
          malaise: "Слабость",
          nausea: "Тошнота",
          pox: "Сыпь",
          wounded: "Незаживающая рана",
          delirium: "Бред",
          swelling: "Вздутие",
        };

        for (let obj in WFRP4E) {
          for (let el in WFRP4E[obj]) {
            if (typeof WFRP4E[obj][el] === "string") {
              WFRP4E[obj][el] = game.i18n.localize(WFRP4E[obj][el]);
            }
          }
        }

        mergeObject(game.wfrp4e.config, WFRP4E);

        // Patching system items/effects/statuses
        game.wfrp4e.config.symptomEffects.blight.label = "Летальный исход";
        game.wfrp4e.config.symptomEffects.buboes.label = "Бубоны";
        game.wfrp4e.config.symptomEffects.convulsions.label = "Судороги";
        game.wfrp4e.config.symptomEffects.coughsAndSneezes.label = "Чихание и кашель";
        game.wfrp4e.config.symptomEffects.fever.label = "Жар";
        game.wfrp4e.config.symptomEffects.flux.label = "Понос";
        game.wfrp4e.config.symptomEffects.gangrene.label = "Гангрена";
        game.wfrp4e.config.symptomEffects.lingering.label = "Осложнения";
        game.wfrp4e.config.symptomEffects.malaise.label = "Слабость";
        game.wfrp4e.config.symptomEffects.nausea.label = "Тошнота";
        game.wfrp4e.config.symptomEffects.pox.label = "Сыпь";
        game.wfrp4e.config.symptomEffects.wounded.label = "Незаживающая рана";
        game.wfrp4e.config.symptomEffects.delirium.label = "Бред";
        game.wfrp4e.config.symptomEffects.swelling.label = "Вздутие";
      }
    });

    class WfrpCompendiumTranslations {
      static coreModuleEnabled = !!game.modules.filter(
        (mod) => mod.id === "wfrp4e-core" && mod.active
      ).length;
      // adventures and other expansions could provide new traits, spells prayers etc. let's discover them
      static itemCompendiums = [
        "wfrp4e-altdorf.altdorf-items",
        "wfrp4e-archives1.archives1-items",
        "wfrp4e-dotr.dotr-items",
        "wfrp4e-eis.eisitems",
        "wfrp4e-middenheim.middenheim-items",
        "wfrp4e-rnhd.rnhd-items",
        "wfrp4e-starter-set.starter-set-items",
        "wfrp4e-ua1.ua1-items",
        "wfrp4e-ua2.ua2-items",
      ];
      packs = [];

      constructor(pack) {
        this.packs = [];
        if (pack) {
          this.packs.push(pack);
        }

        WfrpCompendiumTranslations.itemCompendiums
          .map((packName) => game.babele.packs.get(packName))
          .forEach((itemPack) => {
            if (itemPack) {
              this.packs.push(itemPack);
            }
          });
      }

      find(condition) {
        for (let pack of this.packs) {
          for (let translation of Object.keys(pack.translations)) {
            if (condition(translation)) {
              return pack.translations[translation];
            }
          }
        }

        return null;
      }

      static traits() {
        return new WfrpCompendiumTranslations(game.babele.packs.get("wfrp4e-core.traits"));
      }

      static skills() {
        return new WfrpCompendiumTranslations(
          game.babele.packs.get(this.coreModuleEnabled ? "wfrp4e-core.skills" : "wfrp4e.basic")
        );
      }

      static talents() {
        return new WfrpCompendiumTranslations(game.babele.packs.get("wfrp4e-core.talents"));
      }

      static careers() {
        return new WfrpCompendiumTranslations(game.babele.packs.get("wfrp4e-core.careers"));
      }

      static trappings() {
        return new WfrpCompendiumTranslations(
          game.babele.packs.get(this.coreModuleEnabled ? "wfrp4e-core.trappings" : "wfrp4e.basic")
        );
      }

      static spells() {
        return new WfrpCompendiumTranslations(game.babele.packs.get("wfrp4e-core.spells"));
      }

      static prayers() {
        return new WfrpCompendiumTranslations(game.babele.packs.get("wfrp4e-core.prayers"));
      }
    }
  }
}
