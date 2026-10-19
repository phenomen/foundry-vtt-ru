import { createLookupConverter, registerCompendiumTranslations } from "#helpers";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "investigator");
}

const CATEGORIES = {
  "Academic": "Научные",
  "Exotic": "Экзотические",
  "Focus": "Специализированные",
  "Interpersonal": "Межличностные",
  "Physical": "Физические",
  "Presence": "Социальные",
  "Technical": "Прикладные",
  "General": "Общие",
  "Psychic Powers": "Мистические силы",
  "Resist": "Сопротивление",
  "Persuade": "Убеждение",
  "Rebuff": "Отпор",
  "Magic": "Магия",
  "Attack": "Атака",
  "Defense": "Защита",
};

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    convertCategory: createLookupConverter(CATEGORIES),
  });
}
