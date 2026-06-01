import { setupBabele } from "../babele-helpers.js";

export function init() {
  setupBabele("mausritter");

  CONFIG.MAUSRITTER.tables = {
    birthsign: "Мышь - Знак рождения",
    coatColor: "Мышь - Цвет окраса",
    coatPattern: "Мышь - Узор окраса",
    firstName: "Мышиные имена - Имя при рождении",
    lastName: "Мышиные имена - Матроним",
    npcAppearance: "Мыши ведущего - Внешность",
    npcBirthsign: "Мыши ведущего - Знак рождения и склонности",
    npcQuirk: "Мыши ведущего - Особенность",
    npcRelationship: "Мыши ведущего - Отношения",
    npcSocial: "Мыши ведущего - Положение в обществе и плата за услуги",
    npcWants: "Мыши ведущего - Желания",
    physicalDetail: "Мышь - Физическая особенность",
    tables: "Таблицы",
  };
}
