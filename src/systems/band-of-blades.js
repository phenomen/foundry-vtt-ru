import { setupBabele, translateValue } from "../babele-helpers.js";

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

export function init() {
  setupBabele("band-of-blades");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    classConverter: (cls) => {
      if (!cls) {
        return;
      }
      return translateValue(cls, CLASSES);
    },

    effectsConverter: (effects, translations) => {
      if (!effects || !translations) {
        return;
      }
      return effects.map((effect) => {
        if (effect.name && translations[effect.name]) {
          effect.name = translations[effect.name];
        }
        return effect;
      });
    },
  });
}
