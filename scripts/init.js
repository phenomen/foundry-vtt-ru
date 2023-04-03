import { InitDELTAGREEN } from "./system-deltagreen.js";
import { InitDND5 } from "./system-dnd5.js";
import { InitDUNGEONWORLD } from "./system-dungeonworld.js";
import { InitPF1E } from "./system-pf1e.js";
import { InitWFRP4 } from "./system-wfrp4.js";
import { InitALIEN } from "./system-alien.js";
import { InitCORIOLIS } from "./system-coriolis.js";
import { InitINVESTIGATOR } from "./system-investigator.js";
import { InitCOC7 } from "./system-coc7.js";
import { InitMASKS } from "./system-masks.js";
import { InitSFRPGBB } from "./system-sfrpgbb.js";
import { InitFBL } from "./system-fbl.js";
//import { InitAOS } from "./system-age-of-sigmar-soulbound.js";

Hooks.once("init", async () => {
  try {
    const systemCSS = document.createElement("link");
    systemCSS.rel = "stylesheet";
    systemCSS.href = `/styles/${game.system.id.toLowerCase()}.css`;
    systemCSS.addEventListener("error", (event) => {
      console.error(`Failed to load ${systemCSS.href}`);
    });
    systemCSS.setAttribute("cache-control", "public, max-age=3600");
    insertAfter(systemCSS, document.head.childNodes[document.head.childNodes.length - 1]);
  } catch (error) {
    console.error(error);
  }

  const cyrillicFonts = [
    "Arial",
    "Courier",
    "Courier New",
    "Modesto Condensed",
    "Signika",
    "Times",
    "Times New Roman",
    "Noto Sans",
    "Noto Serif",
    "Noto Sans Mono",
    "Fira Sans Extra Condensed",
    "Beaufort",
    "Manuskript",
    "Marck Script",
    "OCR-A",
    "GWENT",
    "Exocet",
  ];

  CONFIG._fontFamilies = cyrillicFonts;

  // Add Cyrillic fonts to the font list
  game.settings.register("ru-ru", "tokenFontFamily", {
    name: "Шрифт подписей на сцене",
    hint: "Шрифт, используемый для имён токенов и названий заметок на сцене.",
    type: Number,
    default: 10,
    choices: cyrillicFonts,
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });

  CONFIG.defaultFontFamily = "Noto Sans";
  CONFIG.canvasTextStyle.fontFamily = cyrillicFonts[game.settings.get("ru-ru", "tokenFontFamily")];

  //System-specific scripts

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

  // FORBIDDEN LANDS
  if (game.system.id === "forbidden-lands") {
    InitFBL();
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

  // MASKS
  if (game.system.id === "pbta" && game.modules.get("masks-newgeneration-sheets")?.active) {
    InitMASKS();
  }

  // SFBB
  if (game.system.id === "sfrpgbb") {
    InitSFRPGBB();
  }

  // AGE OF SIGMAR SOULBOUND
  //if (game.system.id === "age-of-sigmar-soulbound") {
  //  InitAOS();
  //}

  // QUICK INSERT FIX
  if (game.modules.get("quick-insert")?.active) {
    Hooks.on("ready", async function () {
      await game.settings.set("quick-insert", "embeddedIndexing", true);
    });
  }
});

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
