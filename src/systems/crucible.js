import { setupBabele } from "../shared.js";

export function init() {
  setupBabele("crucible");
  registerConverters();
}

function registerConverters() {
  if (!game.babele) {
    return;
  }

  /**
   * Crucible stores `Item.system.description` as a string for talents, spells
   * and summons, but as an object `{ public, private }` for equipment (weapons,
   * armor, consumables). Babele's built-in primitive converter cannot translate
   * this dual shape, which leaves equipment items untranslated when imported
   * (most visibly inside actor inventories).
   *
   * The translation file stores the translated description under
   * `descriptionPublic` for the object shape and `description` for the string
   * shape. This converter reads both keys from the field-level translations
   * and returns whichever matches the original shape.
   */
  game.babele.registerConverters({
    convertDescription: (originalValue, _fieldTranslations, data, _tc, translations) => {
      const t = translations ?? {};
      if (typeof originalValue === "string") {
        return typeof t.description === "string" ? t.description : originalValue;
      }
      if (originalValue && typeof originalValue === "object") {
        const next = { ...originalValue };
        if (typeof t.descriptionPublic === "string") next.public = t.descriptionPublic;
        if (typeof t.descriptionPrivate === "string") next.private = t.descriptionPrivate;
        return next;
      }
      return originalValue;
    },
  });
}
