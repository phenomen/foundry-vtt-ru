import {
  createLookupConverter,
  registerCompendiumTranslations,
  resolveTranslatedItemName,
} from "../babele-helpers.js";

const EXCEPTIONS = {
  "Arcane Background (Any)": "Мистический дар (любой)",
  "Arcane Background (Gifted)": "Мистический дар (феномен)",
  "Arcane Background (Magic)": "Мистический дар (магия)",
  "Arcane Background (Miracles)": "Мистический дар (чудеса)",
  "Arcane Background (Psionics)": "Мистический дар (псионика)",
  "Arcane Background (Weird Science)": "Мистический дар (безумная наука)",
  "Expert in affected Trait": "Профессионал+ в выбранном параметре",
  "Professional in affected Trait": "Профессионал в выбранном параметре",
  "Tough as Nails": "Несгибаемый",
  "Work the Room": "Заводила",
  "arcane skill": "мистический навык",
  "arcane skill d8+": "мистический навык d8+",
  "arcane skill d10+": "мистический навык d10+",
  "skill with the chosen weapon of d8+": "навык в данном оружии d8+",
  "maximum die type possible in affected Trait":
    "максимальная возможная кость в выбранном параметре",
};

const CATEGORIES = {
  "Background": "Предыстории",
  "Combat": "Боевые",
  "Leadership": "Лидерские",
  "Legendary": "Легендарные",
  "Power": "Мистические",
  "Professional": "Профессиональные",
  "Social": "Социальные",
  "Weird": "Сверхъестественные",
  "Edges": "Черты",
  "Hindrances": "Недостатки",
  "Adventure Toolkit": "Инструменты приключений",
  "Healing": "Лечение",
  "Special Ability Actions": "Действия особенностей",
  "Situational Rules": "Ситуативные правила",
  "Weapon Actions": "Действия снаряжения",
};

const RANKS = {
  Heroic: "Герой",
  Novice: "Новичок",
  Seasoned: "Закалённый",
  Veteran: "Ветеран",
};

const RANGES = {
  "Cone Template": "конусный шаблон",
  "Large Blast Template": "большой шаблон",
  "Medium Blast Template": "средний шаблон",
  "Self": "на себя",
  "Sm": "СМК",
  "Sm x 2": "СМК×2",
  "Small Blast Template": "малый шаблон",
  "Smarts x5 (Sound); Smarts (Silence)": "СМК×5 (звук); СМК (тишина)",
  "Touch": "касание",
};

const DURATIONS = {
  "10 minutes": "10 минут",
  "30 Minutes": "30 минут",
  "5": "5 минут",
  "5 (boost); Instant (lower)": "5 (усилить); мгновенное (ослабить)",
  "5 (detect), one hour (conceal)": "5 (обнаружение); 1 час (скрытие)",
  "5 minutes": "5 минут",
  "A brief conversation of about five minutes": "до 5 минут (короткая беседа)",
  "Instant": "мгновенное",
  "Instant (Sound); 5 (Silence)": "мгновенное (звук); 5 (тишина)",
  "Instant (slot); 5 (speed)": "мгновенное (замедление); 5 (ускорение)",
  "One Minute": "1 минута",
  "One Round": "1 раунд",
  "One day": "1 день",
  "One hour": "1 час",
  "Special": "особое",
  "Until the end of the victim's next turn": "до конца следующего хода цели",
};

export function init() {
  game.settings.register("ru-ru", "setupRules", {
    config: true,
    default: true,
    hint: "Автоматический перевод стандартных навыков и других настроек системы SWADE. Отключите, если желаете внести изменения вручную.",
    name: "(SWADE) Перевод настроек системы",
    restricted: true,
    scope: "world",
    type: Boolean,
  });

  Hooks.on("ready", () => {
    if (game.modules.get("swade-core-rules")?.active) {
      ui.notifications.info(
        "Обнаружен модуль SWADE Core Rules. Перевод базовой библиотеки был отключен во избежание конфликтов.",
      );
    }
    setupRules();
  });
}

export function registerBabeleTranslations(babele) {
  let path = "swade/basic";
  if (game.modules.get("swade-core-rules")?.active) {
    path = "swade/core";
  }
  registerCompendiumTranslations(babele, path);
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    convertCategory: createLookupConverter(CATEGORIES),
    convertDuration: createLookupConverter(DURATIONS),
    convertRange: createLookupConverter(RANGES),
    convertRank: createLookupConverter(RANKS),

    convertRequirements: {
      translate(context) {
        const { value: requirements, runtime } = context;
        if (!requirements) {
          return requirements;
        }

        const packIds = getRequirementPackIds();

        return requirements.map((data) => {
          if (!data.label) {
            return data;
          }

          const translatedLabel =
            EXCEPTIONS[data.label] ?? resolveTranslatedItemName(data.label, { runtime, packIds });

          if (translatedLabel !== data.label) {
            data.label = translatedLabel;
          }

          return data;
        });
      },
    },
  });
}

function getRequirementPackIds() {
  if (game.modules.get("swade-core-rules")?.active) {
    return [
      "swade-core-rules.swade-edges",
      "swade-core-rules.swade-hindrances",
      "swade-core-rules.swade-skills",
    ];
  }

  return ["swade.edges", "swade.hindrances", "swade.skills"];
}

function setupRules() {
  if (game.settings.get("ru-ru", "setupRules")) {
    game.settings.set(
      "swade",
      "coreSkills",
      "Атлетика, Внимание, Осведомлённость, Скрытность, Убеждение",
    );

    game.settings.set(
      "swade",
      "vehicleSkills",
      "Верховая езда, Вождение, Пилотирование, Судовождение",
    );

    if (game.modules.get("swade-core-rules")?.active) {
      game.settings.set("swade", "coreSkillsCompendium", "swade-core-rules.swade-skills");
    }

    if (game.modules.get("deadlands-core-rules")?.active) {
      game.settings.set("swade", "currencyName", "$");
    }
  }
}
