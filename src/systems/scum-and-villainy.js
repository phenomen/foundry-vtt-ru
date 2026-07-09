import {
  registerCompendiumTranslations,
  resolveTranslatedItemName,
  translateItemListConverter,
  translateValue,
} from "../babele-helpers.js";

const CLASSES = {
  Mechanic: "Механик",
  Muscle: "Здоровяк",
  Mystic: "Мистик",
  Pilot: "Пилот",
  Scoundrel: "Пройдоха",
  Speaker: "Переговорщик",
  Stitch: "Умник",
};

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "scum-and-villainy");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    translateItemList: translateItemListConverter,

    translateItemName: {
      translate(context) {
        const { value: name, translation: fieldTranslation, runtime } = context;

        if (!name || typeof name !== "string") {
          return name;
        }

        return resolveTranslatedItemName(name, { fieldTranslation, runtime });
      },
    },

    translateEffects: {
      translate(context) {
        const { value: effects } = context;
        if (!effects?.length) {
          return effects;
        }

        return effects.map((effect) => {
          const translated = foundry.utils.duplicate(effect);
          const changes = translated.system?.changes ?? translated.changes;
          if (!changes?.length) {
            return translated;
          }

          for (const change of changes) {
            if (change.key === "system.character_class" && typeof change.value === "string") {
              change.value = translateValue(change.value, CLASSES);
            }
          }

          return translated;
        });
      },
    },
  });
}
