const DATASET_SETTING = "forbidden-lands.datasetDir";

export function init() {
  Hooks.on("ready", () => {
    if (game.settings.settings.get(DATASET_SETTING)?.scope === "world" && !game.user.isGM) {
      return;
    }
    game.settings.set(
      "forbidden-lands",
      "datasetDir",
      "modules/ru-ru/compendium/fbl/dataset/dataset-ru.json",
    );
  });
}
