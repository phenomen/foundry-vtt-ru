/**
 * Loads the system-specific stylesheet when the manifest lists one for the current system.
 */
export function loadSystemStyles() {
  const systemId = game.system.id.toLowerCase();
  if (!game.modules.get("ru-ru").flags.styles.includes(systemId)) {
    return;
  }

  const systemCSS = document.createElement("link");
  systemCSS.rel = "stylesheet";
  systemCSS.href = `${foundry.utils.getRoute("/")}modules/ru-ru/styles/${systemId}.css`;
  document.head.appendChild(systemCSS);
}
