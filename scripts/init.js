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

Hooks.once("init", async () => {

  /* LOAD SYSTEM-SPECIFIC CSS */
  const systemCSS = document.createElement("link");
  systemCSS.rel = "stylesheet";
  systemCSS.href = `/modules/ru-ru/styles/${game.system.id.toLowerCase()}.css`;
  document.head.appendChild(systemCSS);

  /* ADD CYRILLIC FONTS */
  const cyrillicFonts = {
    "Beaufort": { editor: true, fonts: []},
    "Exocet": { editor: true, fonts: []},
    "Fira Sans Extra Condensed": { editor: true, fonts: []},
    "GWENT": { editor: true, fonts: []},
    "Manuskript": { editor: true, fonts: []},
    "Marck Script": { editor: true, fonts: []},
    "Montserrat": { editor: true, fonts: []},
    "Noto Sans Mono": { editor: true, fonts: []},
    "Noto Sans": { editor: true, fonts: []},
    "Noto Serif": { editor: true, fonts: []},
    "OCR-A": { editor: true, fonts: []},
  };
  
  CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, cyrillicFonts);
  CONFIG.defaultFontFamily = "Noto Sans";

  /* CUSTOM LABEL FONT */
  game.settings.register("ru-ru", "sceneLabelFont", {
    name: "Шрифт подписей на сцене",
    hint: "Шрифт, используемый для имён токенов и названий заметок на сцене.",
    type: Number,
    default: 10,
    choices: Object.keys(CONFIG.fontDefinitions),
    scope: "world",
    config: true,
    restricted: true,
    onChange: (value) => {
      window.location.reload();
    },
  });


  CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[game.settings.get("ru-ru", "sceneLabelFont")];
  
  /* LOAD SYSTEM-SPECIFIC SCRIPTS */

  switch(game.system.id) {
    case "alienrpg":
      InitALIEN();
      break;
    case "CoC7":
      InitCOC7();
      break;
    case "yzecoriolis":
      InitCORIOLIS();
      break;
    case "deltagreen":
      InitDELTAGREEN();
      break;
    case "dnd5e":
      InitDND5();
      break;
    case "dungeonworld":
      InitDUNGEONWORLD();
      break;
    case "forbidden-lands":
      InitFBL();
      break;
    case "investigator":
      InitINVESTIGATOR();
      break;
    case "pf1":
      InitPF1E();
      break;
    case "wfrp4e":
      InitWFRP4();
      break;
    case "pbta":
      if (game.modules.get("masks-newgeneration-sheets")?.active) {
        InitMASKS();
      }
      break;
    case "sfrpgbb":
      InitSFRPGBB();
      break;
  }
  

  // QUICK INSERT FIX
  if (game.modules.get("quick-insert")?.active) {
    Hooks.on("ready", async function () {
      await game.settings.set("quick-insert", "embeddedIndexing", true);
    });
  }
});
