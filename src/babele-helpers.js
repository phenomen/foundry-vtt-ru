/**
 * Shared helpers for Babele custom converters.
 *
 * Used when a compendium field stores references to other items by name instead of embedded documents. Lookups go through Babele's runtime API.
 */

/**
 * Setup Babele for a specific compendium.
 * @param {string} id - The ID of the compendium to setup.
 */

export function setupBabele(id) {
  if (!game.settings.get("ru-ru", "compendiumTranslation")) {
    return;
  }

  const { title } = game.system;

  if (game.babele) {
    game.babele.register({
      dir: `compendium/${id}`,
      lang: "ru",
      module: "ru-ru",
    });

    game.settings.set("babele", "showOriginalName", true);
  } else {
    foundry.applications.api.DialogV2.prompt({
      window: { title: "Перевод библиотек" },
      content: `<p>Для перевода библиотек <b>${title}</b> требуется активировать модули <b>Babele и libWrapper</b></p>`,
      ok: { label: "Хорошо" },
    });
  }
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
 * @param {string} entryName - Compendium index name used for Babele matching.
 * @param {object} scope - Compendium runtime from {@link getCompendiumRuntime}.
 * @param {string} packId - Foundry compendium collection id.
 * @returns {object|null} Translation entry (`name`, `description`, …) or `null`.
 */
function translatedItemEntryFromPack(entryName, scope, packId) {
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
 * Resolves a name by looking up Babele translations in compendium packs.
 *
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
 * Babele converter object for `mappings.json` fields that use `translateItemList`.
 *
 */
export const translateItemListConverter = {
  translate(context) {
    const { value: list, translation: fieldTranslation, runtime } = context;
    return translateItemListValue(list, { fieldTranslation, runtime });
  },
};

export function translateValue(value, translations) {
  return translations[value.trim()] || value;
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
