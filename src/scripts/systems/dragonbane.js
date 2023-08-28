export function init() {
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: "compendium/dragonbane"
		});
	} else {
		new Dialog({
			title: "Перевод библиотек",
			content: `<p>Для перевода библиотек Dragonbane требуется активировать модули <b>Babele и libWrapper</b><p>`,
			buttons: {
				done: {
					label: "Хорошо"
				}
			}
		}).render(true);
	}
}
