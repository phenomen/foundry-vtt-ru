export function InitALIEN() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/alien",
    });
  } else {
    new Dialog({
      title: "Перевод библиотек",
      content: `<p>Для перевода библиотек системы ALIEN RPG требуется установить и активировать модуль <b>Babele</b><p>`,
      buttons: {
        done: {
          label: "Хорошо",
        },
      },
    }).render(true);
  }
}
