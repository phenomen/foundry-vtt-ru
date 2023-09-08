export function init() {
	if (game.modules.get("masks-newgeneration-sheets")?.active) {
		if (typeof Babele !== "undefined") {
			Babele.get().register({
				module: "ru-ru",
				lang: "ru",
				dir: "compendium/masks"
			});
		} else {
			new Dialog({
				title: "Перевод библиотек",
				content: `<p>Для перевода библиотек системы МАСКИ требуется установить и активировать модули <b>Babele и libWrapper</b><p>`,
				buttons: {
					done: {
						label: "Хорошо"
					}
				}
			}).render(true);
		}
	}
}
