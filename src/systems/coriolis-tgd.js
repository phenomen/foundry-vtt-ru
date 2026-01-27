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
    convertAutomations: createNestedTranslator("coriolis-tgd-core.custom.automations"),
    convertFeatures: createNestedTranslator("coriolis-tgd-core.custom.features"),
  });
}

/**
 * Creates a converter for nested objects that translates name/description fields
 * by looking up entries from a pre-loaded translation file.
 *
 * Expected data structure:
 * {
 *   "someId": { "name": "OriginalName", "description": "...", ... },
 *   "otherId": { "name": "AnotherName", ... }
 * }
 *
 * Translation file structure:
 * {
 *   "entries": {
 *     "OriginalName": { "name": "TranslatedName", "description": "..." }
 *   }
 * }
 *
 * @param {string} fileName - The translation file name (without .json extension)
 * @returns {function} - A converter function for Babele
 */
function createNestedTranslator(fileName) {
  return (data) => {
    if (!data || typeof data !== "object") return data;

    const translations = translationCache.get(fileName);

    if (!translations || Object.keys(translations).length === 0) {
      return data;
    }

    const result = {};

    for (const [id, entry] of Object.entries(data)) {
      if (!entry?.name) {
        result[id] = entry;
        continue;
      }

      const translation = translations[entry.name];

      if (!translation) {
        result[id] = entry;
        continue;
      }

      result[id] = {
        ...entry,
        name: translation.name ?? entry.name,
        description: translation.description ?? entry.description,
      };
    }

    return result;
  };
}
