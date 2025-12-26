import { setupBabele } from "../shared.js";

export function init() {
  setupBabele("cy-borg");

  CONFIG.CY.appBacklashesTable = "Противодействие программ";
}
