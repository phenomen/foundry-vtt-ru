import { registerCompendiumTranslations } from "../babele.js";

export function registerBabeleTranslations(babele) {
  if (game.modules.get("masks-newgeneration-unofficial")?.active) {
    registerCompendiumTranslations(babele, "pbta/masks");
  }
}
