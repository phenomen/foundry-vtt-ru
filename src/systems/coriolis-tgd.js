import { setupBabele } from "../shared.js";

/** Cache for loaded translation files */
const translationCache = new Map();

export async function init() {
  setupBabele("coriolis-tgd");

  if (!game.babele) return;

  // Pre-load translation files before registering converters
  await loadTranslationFiles([
    "coriolis-tgd-core.custom.automations",
    "coriolis-tgd-core.custom.features",
  ]);

  registerConverters();
}

/**
 * Loads multiple translation files and caches them.
 *
 * @param {string[]} fileNames - Array of file names (without .json extension)
 */
async function loadTranslationFiles(fileNames) {
  await Promise.all(fileNames.map(loadTranslationFile));
}

/**
 * Loads a translation file from the module's compendium directory.
 * Results are cached to avoid repeated fetches.
 *
 * @param {string} fileName - The file name (without .json extension)
 * @returns {Promise<object>} - The entries object from the translation file
 */
async function loadTranslationFile(fileName) {
  if (translationCache.has(fileName)) {
    return translationCache.get(fileName);
  }

  try {
    const path = `modules/ru-ru/compendium/coriolis-tgd/${fileName}.json`;
    const data = await foundry.utils.fetchJsonWithTimeout(path);
    const entries = data.entries || {};
    translationCache.set(fileName, entries);
    return entries;
  } catch (error) {
    console.error(`[ru-ru] Failed to load translation file: ${fileName}`, error);
    translationCache.set(fileName, {});
    return {};
  }
}

function registerConverters() {
  game.babele.registerConverters({
    convertAutomations: applyTranslation("coriolis-tgd-core.custom.automations"),
    convertFeatures: applyTranslation("coriolis-tgd-core.custom.features"),
  });
}

/**
 * Creates a converter for nested objects that translates name/description fields.
 *
 * Babele passes 5 parameters to converters:
 * - originalValue: the value at the mapped path
 * - fieldTranslations: per-item translations for this field (from the entry)
 * - data: full original item data
 * - tc: TranslatedCompendium instance
 * - translations: full translations object for the item
 *
 * Translations are looked up by the `name` field of each entry. The converter
 * supports two sources (in priority order):
 * 1. Per-item translations from the compendium entry (fieldTranslations)
 * 2. Global translations from the pre-loaded translation file (fallback)
 *
 * @param {string} fileName - The translation file name (without .json extension)
 * @returns {function} - A converter function for Babele
 */
function applyTranslation(fileName) {
  return (originalValue, fieldTranslations) => {
    if (!originalValue || typeof originalValue !== "object") {
      return originalValue;
    }

    const globalTranslations = translationCache.get(fileName) || {};

    if (
      !fieldTranslations &&
      (!globalTranslations || Object.keys(globalTranslations).length === 0)
    ) {
      return originalValue;
    }

    const result = {};

    for (const [id, entry] of Object.entries(originalValue)) {
      if (!entry?.name) {
        result[id] = entry;
        continue;
      }

      // Look up translation by name: per-item first, then global fallback
      const translation = fieldTranslations?.[entry.name] || globalTranslations[entry.name];

      if (!translation) {
        result[id] = entry;
        continue;
      }

      result[id] = foundry.utils.mergeObject(entry, {
        name: translation.name ?? entry.name,
        description: translation.description ?? entry.description,
        translated: true,
      });
    }

    return result;
  };
}
