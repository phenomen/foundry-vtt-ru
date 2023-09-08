export function init() {
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: "compendium/dungeonworld"
		});
	} else {
		new Dialog({
			title: "Перевод библиотек",
			content: `<p>Для перевода библиотек Dungeon World требуется установить и активировать модули <b>Babele и libWrapper</b><p>`,
			buttons: {
				done: {
					label: "Хорошо"
				}
			}
		}).render(true);
	}
}
