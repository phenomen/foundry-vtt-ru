import { InitDELTAGREEN } from "./system-deltagreen.js";
import { InitDND5 } from "./system-dnd5.js";
import { InitDUNGEONWORLD } from "./system-dungeonworld.js";
import { InitPF2E } from "./system-pf2e.js";
import { InitWFRP4 } from "./system-wfrp4.js";
import { InitALIEN } from "./system-alien.js";

Hooks.once("init", async () => {
  // Load system-specific CSS styles
  loadCSS("modules/ru-ru/styles/" + game.system.id + ".css");

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
});

Hooks.once("ready", async () => {
  if (typeof libWrapper === "function") {
    libWrapper.register(
      "ru-ru",
      "game.keyboard._handleKeys",
      handleKeysCyrillic,
      "OVERRIDE"
    );

    function handleKeysCyrillic(event, key, up) {
      const modifiers = {
        key: key,
        isShift: event.shiftKey,
        isCtrl: event.ctrlKey || event.metaKey,
        isAlt: event.altKey,
        hasFocus: this.hasFocus,
        hasModifier:
          event.shiftKey || event.ctrlKey || event.metaKey || event.altKey,
      };

      if (key === "Tab") this._onTab(event, up, modifiers);
      else if (key === "Escape") this._onEscape(event, up, modifiers);
      else if (key === "Space") this._onSpace(event, up, modifiers);
      else if (key in this.moveKeys) this._onMovement(event, up, modifiers);
      else if (this.digitKeys.includes(key))
        this._onDigit(event, up, modifiers);
      else if (["Delete", "Backspace"].includes(key))
        this._onDelete(event, up, modifiers);
      else if (key === "Alt") this._onAlt(event, up, modifiers);
      else if (key.toLowerCase() === "z" || key.toLowerCase() === "я")
        this._onKeyZ(event, up, modifiers);
      else if (key.toLowerCase() === "c" || key.toLowerCase() === "с")
        this._onKeyC(event, up, modifiers);
      else if (key.toLowerCase() === "v" || key.toLowerCase() === "м")
        this._onKeyV(event, up, modifiers);
      else if (key in this.zoomKeys) this._onKeyZoom(event, up, modifiers);
    }
  }
});
