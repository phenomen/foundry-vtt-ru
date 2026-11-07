import { lookupField, registerCompendiumTranslations } from "#helpers";

const CLASSES = {
  Bartan: "Бартан",
  General: "Общий",
  Heavy: "Гоплит",
  Medic: "Врач",
  Officer: "Офицер",
  Orite: "Орите",
  Panyar: "Паньяр",
  Rookie: "Новобранец",
  Scout: "Разведчик",
  Sniper: "Снайпер",
  Soldier: "Солдат",
  Zemyati: "Земьяти",
};

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "band-of-blades");
}

export function registerBabeleConverters(babele) {
  babele.registerMapping({
    Item: { class: lookupField("system.class", CLASSES) },
  });
}
