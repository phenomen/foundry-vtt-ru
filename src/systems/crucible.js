import { registerCompendiumTranslations } from "#helpers";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "crucible");
}

function originalName(document) {
  return document?.flags?.babele?.originalName ?? document?.originalName ?? document?.name;
}

export function registerBabeleConverters(babele) {
  babele.registerIdentityExtractors({ crucibleOriginalName: originalName });
  babele.registerConverters({
    // These fields are absent from the authoritative Babele export templates.
    crucibleOmit: {
      translate() {
        return undefined;
      },
      extract() {
        return undefined;
      },
    },
    // Keep category/folder dictionaries keyed exactly as in the English exports.
    crucibleNames: {
      translate({ value, translation }) {
        if (!Array.isArray(value)) {
          return value;
        }
        return value.map((document) => {
          const key = originalName(document);
          const name = translation?.[key];
          if (typeof name !== "string") {
            return document;
          }
          return {
            ...document,
            name,
            flags: {
              ...document.flags,
              babele: { ...document.flags?.babele, originalName: key },
            },
          };
        });
      },
      extract({ value }) {
        if (!Array.isArray(value) || !value.length) {
          return undefined;
        }
        const result = {};
        for (const document of value) {
          const key = originalName(document);
          if (!key || typeof document.name !== "string") {
            continue;
          }
          if (Object.hasOwn(result, key) && result[key] !== document.name) {
            throw new Error(`Conflicting Crucible collection names: ${key}`);
          }
          result[key] = document.name;
        }
        return result;
      },
    },
  });
}
