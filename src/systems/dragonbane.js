import { createTranslateItemListConverter, registerCompendiumTranslations } from "#helpers";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "dragonbane");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    translateItemList: createTranslateItemListConverter({ sort: true }),
  });
}
