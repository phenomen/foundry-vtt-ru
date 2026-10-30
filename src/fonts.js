const CYRILLIC_FONTS = [
  "Beaufort",
  "Exocet",
  "GWENT",
  "Manuskript",
  "Marck Script",
  "OCR-A",
  "Roboto",
  "Roboto Condensed",
  "Roboto Serif",
];

/**
 * Adds the bundled Cyrillic fonts to Foundry and makes Roboto the default.
 */
export function registerFonts() {
  const cyrillicFonts = Object.fromEntries(
    CYRILLIC_FONTS.map((family) => [family, { editor: true, fonts: [] }]),
  );

  CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, cyrillicFonts);
  CONFIG.defaultFontFamily = "Roboto";
}

/**
 * Applies the `sceneLabelFont` setting to token names and note labels.
 */
export function applySceneLabelFont() {
  CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
    game.settings.get("ru-ru", "sceneLabelFont")
  ];
}
