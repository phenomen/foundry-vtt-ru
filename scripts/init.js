import { InitDELTAGREEN } from "./system-deltagreen.js";
import { InitDND5 } from "./system-dnd5.js";
import { InitDUNGEONWORLD } from "./system-dungeonworld.js";
import { InitPF2E } from "./system-pf2e.js";
import { InitWFRP4 } from "./system-wfrp4.js";

Hooks.once("init", async() => {
    // Load system-specific CSS styles
    loadCSS("modules/ru-ru/styles/" + game.system.id + ".css");

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

    // PATHFINDER 2
    if (game.system.id === "pf2e") {
        InitPF2E();
    }

    // WFRP4
    if (game.system.id === "wfrp4e") {
        InitWFRP4();
    }
});