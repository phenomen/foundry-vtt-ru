import { setupBabele } from "../babele-helpers.js";

export function init() {
  setupBabele("cy-borg");

  CONFIG.CY.appBacklashesTable = "Противодействие программ";
}
