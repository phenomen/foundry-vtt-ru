export function setupBabele(id) {
	const title = game.system.title;

	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: `compendium/${id}`,
		});
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
	return translations[value] || value;
}

export function translateList(value, translations) {
	return value
		.split(", ")
		.map((item) => {
			return translateValue(item, translations);
		})
		.join(", ");
}
