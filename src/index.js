import { applySceneLabelFont, registerFonts } from "./fonts.js";
import { initSystem, registerSystemBabele } from "./systems.js";
import { loadSystemStyles } from "./styles.js";
import { registerSettings } from "./settings.js";

let initialized = false;
let pendingBabele = null;

// Babele fires this from its own `init` hook, which can run before ours. Our settings
// (and system settings such as dnd5e `altTranslation`) must exist first, so wait for them.
Hooks.once("babele.init", (babele) => {
  if (initialized) {
    registerSystemBabele(babele);
  } else {
    pendingBabele = babele;
  }
});

Hooks.once("init", () => {
  loadSystemStyles();
  registerFonts();
  registerSettings();
  applySceneLabelFont();
  CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";
  initSystem();

  initialized = true;
  if (pendingBabele) {
    registerSystemBabele(pendingBabele);
  }
});
