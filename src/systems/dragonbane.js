import { createTranslateItemListConverter, registerCompendiumTranslations } from "../babele.js";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "dragonbane");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    translateItemList: createTranslateItemListConverter({ sort: true }),
  });
}
