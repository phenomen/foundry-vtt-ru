import { resolveTranslatedItemName, translateItemListConverter } from "../babele-helpers.js";
import { setupBabele } from "../shared.js";

export function init() {
  setupBabele("scum-and-villainy");
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
        const { value: effects, translation: fieldTranslation, runtime } = context;

        if (!effects?.length) {
          return effects;
        }

        const effectNames = fieldTranslation?.effects;

        return effects.map((effect) => {
          const translated = foundry.utils.duplicate(effect);

          if (translated.name) {
            const localized = effectNames?.[translated.name];
            if (localized) {
              translated.name = localized;
            } else {
              translated.name = resolveTranslatedItemName(translated.name, { runtime });
            }
          }

          if (translated.system?.changes) {
            translated.system.changes = translated.system.changes.map((change) => {
              if (typeof change.value === "string") {
                change.value = resolveTranslatedItemName(change.value, { runtime });
              }
              return change;
            });
          }

          return translated;
        });
      },
    },
  });
}
