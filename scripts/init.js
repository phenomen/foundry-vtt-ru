import { InitDELTAGREEN } from "./system-deltagreen.js";
import { InitDND5 } from "./system-dnd5.js";
import { InitDUNGEONWORLD } from "./system-dungeonworld.js";
import { InitPF1E } from "./system-pf1e.js";
import { InitWFRP4 } from "./system-wfrp4.js";
import { InitALIEN } from "./system-alien.js";
import { InitCORIOLIS } from "./system-coriolis.js";
import { InitINVESTIGATOR } from "./system-investigator.js";
import { InitCOC7 } from "./system-coc7.js";
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
    "Inter",
    "PT Serif",
    "Alegreya Sans",
    "Beaufort",
    "Manuskript",
    "Marck Script",
    "Modesto Condensed",
    "OCR-A",
    "Oswald",
    "GWENT",
    "Exocet",
    "Roboto Mono",
  ];

  // ALIEN
  if (game.system.id === "alienrpg") {
    InitALIEN();
  }

  // CALL OF CTHULHU
  if (game.system.id === "CoC7") {
    InitCOC7();
  }

  // CORIOLIS
  if (game.system.id === "yzecoriolis") {
    InitCORIOLIS();
  }

  // DELTA GREEN
  if (game.system.id === "deltagreen") {
    InitDELTAGREEN();
  }

  // D&D5
  if (game.system.id === "dnd5e") {
    InitDND5();
  }

  // DUNGEON WORLD
  if (game.system.id === "dungeonworld") {
    InitDUNGEONWORLD();
  }

  // INVESTIGATOR
  if (game.system.id === "investigator") {
    InitINVESTIGATOR();
  }

  // PATHFINDER 1
  if (game.system.id === "pf1") {
    InitPF1E();
  }

  // WFRP4
  if (game.system.id === "wfrp4e") {
    InitWFRP4();
  }

  // AGE OF SIGMAR SOULBOUND
  //if (game.system.id === "age-of-sigmar-soulbound") {
  //  InitAOS();
  //}
});
