import { Converters } from "../../babele/script/converters.js";
import { setupBabele } from "../shared.js";

export function init() {
  setupBabele("slugblaster");
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    fromPackCustom: Converters.fromPack({
      description: "system.description",
      name: "name",
    }),

    rollTableCustom: (results, translations) =>
      results.map((data) => {
        if (!translations) {
          return data;
        }

        const translation =
          translations[data._id] ||
          translations[data.name] ||
          translations[`${data.range[0]}-${data.range[1]}`];

        if (!translation) {
          return data;
        }

        if (typeof translation === "string") {
          return foundry.utils.mergeObject(data, {
            description: translation,
            translated: true,
          });
        }

        return foundry.utils.mergeObject(data, {
          description: translation.description ?? data.description,
          name: translation.name ?? data.name,
          translated: true,
        });
      }),
  });
}
