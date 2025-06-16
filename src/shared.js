export function setupBabele(id) {
  const title = game.system.title;

  if (game.babele) {
    game.babele.register({
      module: "ru-ru",
      lang: "ru",
      dir: `compendium/${id}`,
    });

    game.settings.set("babele", "showOriginalName", true);
  } else {
    new Dialog({
      title: "Перевод библиотек",
      content: `<p>Для перевода библиотек <b>${title}</b> требуется активировать модули <b>Babele и libWrapper</b><p>`,
      buttons: {
        done: {
          label: "Хорошо",
        },
      },
    }).render(true);
  }
}

export function translateValue(value, translations) {
  return translations[value.trim()] || value;
}

export function translateList(value, translations) {
  return value
    .split(", ")
    .map((item) => translateValue(item, translations))
    .join(", ");
}

export function parseParentheses(str) {
  const regex = /^(.*)\s+\((.*)\)$/;
  const match = str.match(regex);

  if (match) {
    const main = match[1];
    const sub = match[2];
    return { main: main.trim(), sub: sub.trim() || undefined };
  }

  return { main: str.trim(), sub: undefined };
}
