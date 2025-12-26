import { setupBabele } from "../shared.js";
import { Converters } from "../../babele/script/converters.js";

export function init() {
  setupBabele("slugblaster");
  registerConverters();
}

function registerConverters() {
  game.babele.registerConverters({
    fromPackCustom: Converters.fromPack({
      name: "name",
      description: "system.description",
    }),

    rollTableCustom: (results, translations) => {
      return results.map((data) => {
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
          name: translation.name ?? data.name,
          description: translation.description ?? data.description,
          translated: true,
        });
      });
    },
  });
}
