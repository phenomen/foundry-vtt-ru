import AUTOMATIONS from "./coriolis-tgd/automations.json" with { type: "json" };
import FEATURES from "./coriolis-tgd/features.json" with { type: "json" };
import { registerCompendiumTranslations } from "#helpers";

export function registerBabeleTranslations(babele) {
  registerCompendiumTranslations(babele, "coriolis-tgd");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    convertAutomations: createNestedConverter(AUTOMATIONS),
    convertFeatures: createNestedConverter(FEATURES),
  });

  // Automations and features appear on items in every pack (and on items embedded in actors).
  babele.registerMapping({
    Item: {
      automations: { path: "system.automations", converter: "convertAutomations" },
      features: { path: "system.features", converter: "convertFeatures" },
    },
  });
}

/**
 * Creates a Babele converter for id-keyed objects such as `system.features`.
 * Each nested entry is matched by `name`: the item's own entry wins, then the shared dictionary.
 *
 * @param {Record<string, {name?: string, description?: string}>} dictionary
 * @returns {{ translate: (context: object) => object }}
 */
function createNestedConverter(dictionary) {
  return {
    translate(context) {
      const { value, translation: fieldTranslation } = context;
      if (!value || typeof value !== "object") {
        return value;
      }

      return Object.fromEntries(
        Object.entries(value).map(([id, entry]) => {
          const translation = entry?.name
            ? (fieldTranslation?.[entry.name] ?? dictionary[entry.name])
            : null;
          if (!translation) {
            return [id, entry];
          }

          return [
            id,
            {
              ...entry,
              name: translation.name ?? entry.name,
              description: translation.description ?? entry.description,
            },
          ];
        }),
      );
    },
  };
}
