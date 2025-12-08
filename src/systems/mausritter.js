import { setupBabele } from "../shared.js";

export function init() {
  setupBabele("mausritter");

  CONFIG.MAUSRITTER.tables = {
    tables: "Таблицы",
    birthsign: "Мышь - Знак рождения",
    physicalDetail: "Мышь - Физическая особенность",
    coatPattern: "Мышь - Узор окраса",
    coatColor: "Мышь - Цвет окраса",
    firstName: "Мышиные имена - Имя при рождении",
    lastName: "Мышиные имена - Матроним",
    npcAppearance: "Мыши ведущего - Внешность",
    npcBirthsign: "Мыши ведущего - Знак рождения и склонности",
    npcQuirk: "Мыши ведущего - Особенность",
    npcSocial: "Мыши ведущего - Положение в обществе и плата за услуги",
    npcWants: "Мыши ведущего - Желания",
    npcRelationship: "Мыши ведущего - Отношения",
  };
}
