export function InitMASKS() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/masks",
    });
  } else {
    new Dialog({
      title: "Перевод библиотек",
      content: `<p>Для перевода библиотек системы МАСКИ требуется установить и активировать модуль <b>Babele</b><p>`,
      buttons: {
        done: {
          label: "Хорошо",
        },
      },
    }).render(true);
  }
}
