import { setupBabele, translateValue } from "../shared.js";

const CLASSES = {
  Cutter: "Головорез",
  Ghost: "Призрак",
  Hound: "Ищейка",
  Hull: "Автоматон",
  Leech: "Умелец",
  Lurk: "Проныра",
  Slide: "Артист",
  Spider: "Кукловод",
  Vampire: "Вампир",
  Whisper: "Мистик",
  Assassins: "Душегубы",
  Bravos: "Бандиты",
  Cult: "Адепты",
  Hawkers: "Барыги",
  Shadows: "Тени",
  Smugglers: "Перевозчики",
};

export function init() {
  setupBabele("blades-in-the-dark");
  registerConverters();

  Hooks.on("ready", () => {
    if (game.system.version.startsWith("4")) {
      ui.notifications.warn(
        "Вы используете устаревшую версию системы. Для корректной работы, обновите систему до 5.0+",
      );
    }
  });
}

function registerConverters() {
  if (!game.babele) return;

  game.babele.registerConverters({
    convertClass: (cls) => {
      if (!cls) return;
      return translateValue(cls, CLASSES);
    },
  });
}
