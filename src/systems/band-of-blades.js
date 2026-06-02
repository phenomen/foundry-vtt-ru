import { createLookupConverter, registerCompendiumTranslations } from "../babele-helpers.js";

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
  babele.registerConverters({
    classConverter: createLookupConverter(CLASSES),

    effectsConverter: {
      translate(context) {
        const { value: effects, translation: translations } = context;
        if (!effects || !translations) {
          return effects;
        }

        return effects.map((effect) => {
          if (effect.name && translations[effect.name]) {
            effect.name = translations[effect.name];
          }
          return effect;
        });
      },
    },
  });
}
