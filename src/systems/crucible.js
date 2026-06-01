import { getCompendiumRuntime, setupBabele } from "../babele-helpers.js";

export function init() {
  setupBabele("crucible");
}

/**
 * Crucible actor detail blocks use `identifier` (e.g. `human`) while Babele entries are
 * keyed by compendium item names (e.g. `Human`).
 *
 * @param {string} identifier
 * @returns {string|null}
 */
function compendiumEntryNameFromIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return null;
  }

  return identifier.charAt(0).toUpperCase() + identifier.slice(1);
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
 * Merges translated `name` and `description` onto a Crucible `system.details.*` block.
 *
 * Actor detail data stores `description` on the root object, not `system.description` like
 * compendium Items. Babele's `document` + `Item` mapping does not apply here reliably.
 *
 * @param {object} detail - Source synthetic detail item from the actor.
 * @param {object} [options]
 * @param {object} [options.runtime] - Babele runtime from the converter context.
 * @param {string} [options.packId] - Compendium to resolve (e.g. `crucible.ancestry`).
 * @param {unknown} [options.fieldTranslation] - Per-actor override fragment from Babele.
 * @returns {object}
 */
function translateEmbeddedDetail(detail, options = {}) {
  const { runtime, packId, fieldTranslation } = options;

  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return detail;
  }

  const scope = getCompendiumRuntime(runtime);
  const result = { ...detail };

  const applyEntry = (entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return;
    }

    if (entry.name) {
      result.name = entry.name;
    }

    if (entry.description) {
      result.description = entry.description;
    }
  };

  if (scope && packId) {
    const matchNames = [];
    const fromIdentifier = compendiumEntryNameFromIdentifier(detail.identifier);

    if (fromIdentifier) {
      matchNames.push(fromIdentifier);
    }

    if (typeof detail.name === "string" && detail.name.trim()) {
      matchNames.push(detail.name.trim());
    }

    for (const entryName of matchNames) {
      const entry = translatedItemEntryFromPack(entryName, scope, packId);
      if (entry) {
        applyEntry(entry);
        break;
      }
    }
  }

  if (
    fieldTranslation &&
    typeof fieldTranslation === "object" &&
    !Array.isArray(fieldTranslation)
  ) {
    applyEntry(fieldTranslation);
  }

  return result;
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    crucibleEmbeddedDetail: {
      translate(context) {
        const { value, translation: fieldTranslation, runtime, params } = context;
        const packId = params?.packId;

        if (!packId) {
          return value;
        }

        return translateEmbeddedDetail(value, { runtime, packId, fieldTranslation });
      },
    },
  });
}
