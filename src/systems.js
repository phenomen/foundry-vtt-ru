import * as band_of_blades from "./systems/band-of-blades.js";
import * as blades_in_the_dark from "./systems/blades-in-the-dark.js";
import * as city_of_mist from "./systems/city-of-mist.js";
import * as coc7 from "./systems/coc7.js";
import * as coriolis_tgd from "./systems/coriolis-tgd.js";
import * as cosmere_rpg from "./systems/cosmere-rpg.js";
import * as crucible from "./systems/crucible.js";
import * as cy_borg from "./systems/cy-borg.js";
import * as delta_green from "./systems/deltagreen.js";
import * as dnd5e from "./systems/dnd5e.js";
import * as dragonbane from "./systems/dragonbane.js";
import * as dune from "./systems/dune.js";
import * as dungeon_world from "./systems/dungeonworld.js";
import * as forbidden_lands from "./systems/forbidden-lands.js";
import * as investigator from "./systems/investigator.js";
import * as mausritter from "./systems/mausritter.js";
import * as mosh from "./systems/mosh.js";
import * as mouse_guard from "./systems/mouseguard.js";
import * as pbta from "./systems/pbta.js";
import * as scum_and_villainy from "./systems/scum-and-villainy.js";
import * as slugblaster from "./systems/slugblaster.js";
import * as swade from "./systems/swade.js";

import { applyBabeleDefaults, warnBabeleMissing } from "#helpers";

// `game.system.id`
const systemModules = {
  "band-of-blades": band_of_blades,
  "blades-in-the-dark": blades_in_the_dark,
  "city-of-mist": city_of_mist,
  "coc7": coc7,
  "coriolis-tgd": coriolis_tgd,
  "cosmere-rpg": cosmere_rpg,
  "crucible": crucible,
  "cy-borg": cy_borg,
  "deltagreen": delta_green,
  "dnd5e": dnd5e,
  "dragonbane": dragonbane,
  "dune": dune,
  "dungeonworld": dungeon_world,
  "forbidden-lands": forbidden_lands,
  "investigator": investigator,
  "mausritter": mausritter,
  "mosh": mosh,
  "mouseguard": mouse_guard,
  "pbta": pbta,
  "scum-and-villainy": scum_and_villainy,
  "slugblaster": slugblaster,
  "swade": swade,
};

function getSystemModule() {
  return systemModules[game.system.id.toLowerCase()];
}

/**
 * Runs the current system's `init` and schedules the Babele warning if it has compendiums.
 */
export function initSystem() {
  const mod = getSystemModule();

  if (mod?.registerBabeleTranslations) {
    Hooks.once("ready", warnBabeleMissing);
  }

  mod?.init?.();
}

/**
 * Registers the current system's compendium translations and converters with Babele.
 *
 * @param {object} babele - Babele facade from the `babele.init` hook.
 */
export function registerSystemBabele(babele) {
  const mod = getSystemModule();
  if (!mod) {
    return;
  }

  mod.registerBabeleTranslations?.(babele);
  mod.registerBabeleConverters?.(babele);
  applyBabeleDefaults();
}
