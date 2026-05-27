import { setupBabele } from "../shared.js";

/** Cache for loaded translation files */
const translationCache = new Map();

export async function init() {
  setupBabele("coriolis-tgd");
}

export async function registerBabeleConverters(babele) {
  await loadTranslationFiles([
    "coriolis-tgd-core.custom.automations",
    "coriolis-tgd-core.custom.features",
  ]);

  babele.registerConverters({
    convertAutomations: applyTranslation("coriolis-tgd-core.custom.automations"),
    convertFeatures: applyTranslation("coriolis-tgd-core.custom.features"),
  });
}

/**
 * @param {string[]} fileNames
 */
async function loadTranslationFiles(fileNames) {
  await Promise.all(fileNames.map(loadTranslationFile));
}

/**
 * @param {string} fileName
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

/**
 * @param {string} fileName
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
      if (entry?.name) {
        const translation = fieldTranslations?.[entry.name] || globalTranslations[entry.name];

        if (translation) {
          result[id] = foundry.utils.mergeObject(entry, {
            description: translation.description ?? entry.description,
            name: translation.name ?? entry.name,
            translated: true,
          });
        } else {
          result[id] = entry;
        }
      } else {
        result[id] = entry;
      }
    }

    return result;
  };
}
