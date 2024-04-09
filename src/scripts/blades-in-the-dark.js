export function init() {
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: "compendium/blades-in-the-dark",
		});
	} else {
		new Dialog({
			title: "Перевод библиотек",
			content:
				"<p>Для перевода библиотек Blades in the Dark требуется активировать модули <b>Babele и libWrapper</b><p>",
			buttons: {
				done: {
					label: "Хорошо",
				},
			},
		}).render(true);
	}

	Hooks.on("ready", () => {
		if (game.system.version.startsWith("4")) {
			ui.notifications.warn(
				"Вы используете устаревшую версию системы Blades in the Dark. Для корректной работы, обновите систему до 5.0+",
			);
		}
	});
}
