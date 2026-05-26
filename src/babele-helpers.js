/**
 * @param {object|null|undefined} runtime
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
 * @param {string} trimmed
 * @param {unknown} fieldTranslation
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
 * @param {string} trimmed
 * @param {object} scope
 * @param {string[]} packIds
 */
function translatedNameFromPacks(trimmed, scope, packIds) {
  const data = { name: trimmed };

  for (const packId of packIds) {
    const pack = scope.mappedCompendiumFor?.(packId);
    if (pack?.hasTranslation?.(data, "Item", scope)) {
      const entry = pack.translationsFor(data, "Item");
      if (entry?.name) {
        return entry.name;
      }
    }
  }

  const pack = scope.translatedPackFor("Item", data);
  if (!pack) {
    return null;
  }

  return pack.translationsFor(data, "Item")?.name ?? null;
}

/**
 * @param {string} name
 * @param {object} [options]
 * @param {unknown} [options.fieldTranslation]
 * @param {object} [options.runtime]
 * @param {string[]} [options.packIds]
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
 * @param {string} list
 * @param {object} [options]
 * @param {unknown} [options.fieldTranslation]
 * @param {object} [options.runtime]
 * @param {boolean} [options.sort]
 * @param {string[]} [options.packIds]
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

/** @type {{ translate: (context: object) => string }} */
export const translateItemListConverter = {
  translate(context) {
    const { value: list, translation: fieldTranslation, runtime } = context;
    return translateItemListValue(list, { fieldTranslation, runtime });
  },
};
