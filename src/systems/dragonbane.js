import { setupBabele } from "../babele-helpers.js";
import { translateItemListValue } from "../babele-helpers.js";

export function init() {
  setupBabele("dragonbane");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    translateItemList: {
      translate(context) {
        const { value: list, translation: fieldTranslation, runtime } = context;
        return translateItemListValue(list, { fieldTranslation, runtime, sort: true });
      },
    },
  });
}
