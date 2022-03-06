import { InitDELTAGREEN } from "./system-deltagreen.js";
import { InitDND5 } from "./system-dnd5.js";
import { InitDUNGEONWORLD } from "./system-dungeonworld.js";
import { InitPF1E } from "./system-pf1e.js";
import { InitPF2E } from "./system-pf2e.js";
import { InitWFRP4 } from "./system-wfrp4.js";
import { InitALIEN } from "./system-alien.js";
import { InitCORIOLIS } from "./system-coriolis.js";
//import { InitAOS } from "./system-age-of-sigmar-soulbound.js";

Hooks.once("init", async () => {
  // Load system-specific CSS styles
  loadCSS("modules/ru-ru/styles/" + game.system.id.toLowerCase() + ".css");

  // Add Cyrillic fonts to the font list
  CONFIG.defaultFontFamily = "Inter";

  CONFIG.fontFamilies = [
    "Arial",
    "Courier",
    "Courier New",
    "Helvetica",
    "Signika",
    "Times",
    "Times New Roman",
    "-- КИРИЛЛИЦА --",
    "Beaufort",
    "GWENT",
    "Inter",
    "Manuskript",
    "Marck Script",
    "Modesto Condensed",
    "OCR-A",
    "Oswald",
    "PT Serif",
    "Roboto Mono",
  ];

  // D&D5
  if (game.system.id === "dnd5e") {
    InitDND5();
  }

  // DELTA GREEN
  if (game.system.id === "deltagreen") {
    InitDELTAGREEN();
  }

  // DUNGEON WORLD
  if (game.system.id === "dungeonworld") {
    InitDUNGEONWORLD();
  }

  // PATHFINDER 1
  if (game.system.id === "pf1") {
    InitPF1E();
  }

  // PATHFINDER 2
  if (game.system.id === "pf2e") {
    InitPF2E();
  }

  // WFRP4
  if (game.system.id === "wfrp4e") {
    InitWFRP4();
  }

  // ALIEN
  if (game.system.id === "alienrpg") {
    InitALIEN();
  }

  // CORIOLIS
  if (game.system.id === "yzecoriolis") {
    InitCORIOLIS();
  }

  // AGE OF SIGMAR SOULBOUND
  //if (game.system.id === "age-of-sigmar-soulbound") {
  //  InitAOS();
  //}
});
