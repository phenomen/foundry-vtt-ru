import { setupBabele, translateValue } from "../babele-helpers.js";

const CLASSES = {
  Assassins: "Душегубы",
  Bravos: "Бандиты",
  Cult: "Адепты",
  Cutter: "Головорез",
  Ghost: "Призрак",
  Hawkers: "Барыги",
  Hound: "Ищейка",
  Hull: "Автоматон",
  Leech: "Умелец",
  Lurk: "Проныра",
  Shadows: "Тени",
  Slide: "Артист",
  Smugglers: "Перевозчики",
  Spider: "Кукловод",
  Vampire: "Вампир",
  Whisper: "Мистик",
};

export function init() {
  setupBabele("blades-in-the-dark");

  Hooks.on("ready", () => {
    if (game.system.version.startsWith("4")) {
      ui.notifications.warn(
        "Вы используете устаревшую версию системы. Для корректной работы, обновите систему до 5.0+",
      );
    }
  });
}

export function registerBabeleConverters(babele) {
  babele.registerConverters({
    convertClass: (cls) => {
      if (!cls) {
        return;
      }
      return translateValue(cls, CLASSES);
    },
  });
}
