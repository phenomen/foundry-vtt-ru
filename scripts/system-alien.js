export function InitALIEN() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/alien",
    });
  }

  Hooks.once("ready", async function () {
    if (typeof Babele === "undefined" && game.user.isGM) {
      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы ALIEN RPG требуется установить и активировать модуль Babele.<p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  });
}
