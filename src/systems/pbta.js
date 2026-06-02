import { registerCompendiumTranslations } from "../babele-helpers.js";

export function registerBabeleTranslations(babele) {
  if (game.modules.get("masks-newgeneration-unofficial")?.active) {
    registerCompendiumTranslations(babele, "pbta/masks");
  }
}
