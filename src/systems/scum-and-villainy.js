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
  });
}
