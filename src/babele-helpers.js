/**
 * Shared helpers for Babele compendium translation.
 */

export const MODULE_ID = "ru-ru";
export const BABELE_LANG = "ru";

/**
 * Reads a module setting, or returns `defaultValue` if the hook has not registered it yet.
 *
 * @param {string} key
 * @param {boolean} [defaultValue=false]
 * @returns {boolean}
 */
export function getSettings(key, defaultValue = false) {
  if (!game.settings.settings.has(`${MODULE_ID}.${key}`)) {
    return defaultValue;
  }
  return game.settings.get(MODULE_ID, key);
}

/**
 * Registers one or more compendium translation directories for the current module.
 * Must run during `Hooks.once("babele.init", ...)`.
 *
 * @param {object} babele - Babele facade from the hook callback.
 * @param {string|string[]} paths - Path segment(s) under `compendium/` (e.g. `"swade/core"`).
 */
export function registerCompendiumTranslations(babele, paths) {
  if (!game.settings.get(MODULE_ID, "compendiumTranslation")) {
    return;
  }

  let pathList = paths;
  if (!Array.isArray(paths)) {
    pathList = [paths];
  }
  const dirs = pathList.map((path) => `compendium/${path}`);

  const registration = {
    module: MODULE_ID,
    lang: BABELE_LANG,
  };

  if (dirs.length === 1) {
    const [dir] = dirs;
    registration.dir = dir;
  } else {
    registration.dirs = dirs;
  }

  babele.register(registration);
}

/**
 * Applies useful Babele defaults when compendium translation is active.
 */
export function applyBabeleDefaults() {
  if (!game.settings.get(MODULE_ID, "compendiumTranslation")) {
    return;
  }

  game.settings.set("babele", "showOriginalName", true);
}

/**
 * Prompts the GM when compendium translation is enabled but Babele is missing.
 */
export function warnBabeleMissing() {
  if (!game.settings.get(MODULE_ID, "compendiumTranslation") || game.babele) {
    return;
  }

  const { title } = game.system;

  foundry.applications.api.DialogV2.prompt({
    window: { title: "Перевод библиотек" },
    content: `<p>Для перевода библиотек <b>${title}</b> требуется активировать модули <b>Babele и libWrapper</b></p>`,
    ok: { label: "Хорошо" },
  });
}

/**
 * Normalizes the `runtime` object Babele passes into converters.
 *
 * @param {object|null|undefined} runtime - Value from the converter context's `runtime` field.
 * @returns {object|null} Babele compendium runtime, or `null`.
 */
export function getCompendiumRuntime(runtime) {
  if (!runtime) {
    return null;
  }

  if (typeof runtime.translatedPackFor === "function") {
    return runtime;
  }

  if (typeof runtime.runtime === "function") {
    return runtime.runtime();
  }

  if (runtime.runtime?.translatedPackFor) {
    return runtime.runtime;
  }

  return null;
}

/**
 * @param {string} entryName - Compendium index name used for Babele matching.
 * @param {object} scope - Compendium runtime from {@link getCompendiumRuntime}.
 * @param {string} packId - Foundry compendium collection id.
 * @returns {object|null} Translation entry (`name`, `description`, …) or `null`.
 */
export function translatedItemEntryFromPack(entryName, scope, packId) {
  const trimmed = entryName?.trim();
  if (!trimmed || !scope || !packId) {
    return null;
  }

  const data = { name: trimmed };
  const pack = scope.mappedCompendiumFor?.(packId);

  if (pack?.hasTranslation?.(data, "Item", scope)) {
    return pack.translationsFor(data, "Item") ?? null;
  }

  return null;
}

/**
 * Resolves a name from the per-entry translation fragment for the current field.
 *
 * @param {string} trimmed - Source name, already trimmed.
 * @param {unknown} fieldTranslation - `translation` slice for this field from the active entry.
 * @returns {string|null} Translated name, or `null` if this field provides no override.
 */
function translatedNameFromField(trimmed, fieldTranslation) {
  if (
    !fieldTranslation ||
    typeof fieldTranslation !== "object" ||
    Array.isArray(fieldTranslation)
  ) {
    return null;
  }

  if (!Object.hasOwn(fieldTranslation, trimmed)) {
    return null;
  }

  const fragment = fieldTranslation[trimmed];
  if (typeof fragment === "string") {
    return fragment;
  }

  return fragment?.name ?? null;
}

/**
 * @param {string} trimmed - Source item name, already trimmed.
 * @param {object} scope - Compendium runtime from {@link getCompendiumRuntime}.
 * @param {string[]} packIds - Foundry compendium collection ids to search first.
 * @returns {string|null} Translated `name` from the matched entry, or `null`.
 */
function translatedNameFromPacks(trimmed, scope, packIds) {
  for (const packId of packIds) {
    const entry = translatedItemEntryFromPack(trimmed, scope, packId);
    if (entry?.name) {
      return entry.name;
    }
  }

  const data = { name: trimmed };
  const pack = scope.translatedPackFor("Item", data);
  if (!pack) {
    return null;
  }

  return pack.translationsFor(data, "Item")?.name ?? null;
}

/**
 * Translates a single compendium item name referenced by string.
 *
 * @param {string} name - Original English name as stored on the source document.
 * @param {object} [options]
 * @param {unknown} [options.fieldTranslation] - Optional per-entry field overrides from Babele.
 * @param {object} [options.runtime] - Babele runtime from the converter context.
 * @param {string[]} [options.packIds] - Compendiums to search before the generic Item fallback.
 * @returns {string} Translated name, or the original name if no translation exists.
 */
export function resolveTranslatedItemName(name, options = {}) {
  const { fieldTranslation, runtime, packIds = [] } = options;
  const trimmed = name.trim();
  if (!trimmed) {
    return trimmed;
  }

  const fromField = translatedNameFromField(trimmed, fieldTranslation);
  if (fromField) {
    return fromField;
  }

  const scope = getCompendiumRuntime(runtime);
  if (!scope) {
    return trimmed;
  }

  return translatedNameFromPacks(trimmed, scope, packIds) ?? trimmed;
}

/**
 * Translates a comma-separated list of compendium item names.
 *
 * @param {string} list - Comma-separated source names.
 * @param {object} [options]
 * @param {unknown} [options.fieldTranslation] - Optional per-entry field overrides from Babele.
 * @param {object} [options.runtime] - Babele runtime from the converter context.
 * @param {boolean} [options.sort] - If true, sort translated segments alphabetically.
 * @param {string[]} [options.packIds] - Compendiums to search before the generic Item fallback.
 * @returns {string} Comma-separated translated names.
 */
export function translateItemListValue(list, options = {}) {
  const { fieldTranslation, runtime, sort = false, packIds = [] } = options;

  if (!list || typeof list !== "string") {
    return list || "";
  }

  const segments = list
    .split(",")
    .map((segment) => resolveTranslatedItemName(segment, { fieldTranslation, runtime, packIds }));

  if (sort) {
    segments.sort((a, b) => a.localeCompare(b));
  }

  return segments.join(", ");
}

/**
 * Babele converter for `mappings.json` fields that use `translateItemList`.
 */
export const translateItemListConverter = {
  translate(context) {
    const { value: list, translation: fieldTranslation, runtime } = context;
    return translateItemListValue(list, { fieldTranslation, runtime });
  },
};

/**
 * @param {object} [options]
 * @param {boolean} [options.sort] - Sort translated segments alphabetically.
 * @returns {{ translate: (context: object) => string }}
 */
export function createTranslateItemListConverter({ sort = false } = {}) {
  return {
    translate(context) {
      const { value: list, translation: fieldTranslation, runtime } = context;
      return translateItemListValue(list, { fieldTranslation, runtime, sort });
    },
  };
}

/**
 * Creates a Babele converter that maps a scalar value through a lookup table.
 *
 * @param {Record<string, string>} lookup
 * @returns {{ translate: (context: object) => string|undefined }}
 */
export function createLookupConverter(lookup) {
  return {
    translate(context) {
      const { value } = context;
      if (!value) {
        return value;
      }
      return translateValue(value, lookup);
    },
  };
}

export function translateValue(value, translations) {
  const translated = translations[value.trim()];
  if (typeof translated !== "string" || translated === "") {
    return value;
  }
  return translated;
}

export function translateList(value, translations) {
  return value
    .split(", ")
    .map((item) => translateValue(item, translations))
    .join(", ");
}

export function parseParentheses(str) {
  const regex = /^(\S+(?:\s+\S+)*)\s+\(([^)]+)\)$/;
  const match = str.match(regex);

  if (match) {
    return {
      main: match[1],
      sub: match[2],
    };
  }

  return {
    main: str.trim(),
    sub: null,
  };
}
