export function init() {
	game.settings.register("ru-ru", "altTranslation", {
		name: "(D&D5E) Альтернативный перевод",
		hint: "(Требуется модуль libWrapper) Использовать альтернативный перевод от Dungeons_ru. Иначе будет использоваться официальный перевод издательства Hobby World.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		},
	});

	if (game.settings.get("ru-ru", "altTranslation")) {
		if (typeof libWrapper === "function") {
			libWrapper.register(
				"ru-ru",
				"Localization.prototype._getTranslations",
				loadAltTranslation,
				"WRAPPER",
			);
		} else {
			new Dialog({
				title: "Альтернативный перевод",
				content:
					"<p>Для использования альтернативного перевода требуется активировать модуль <b>libWrapper</b></p>",
				buttons: {
					done: {
						label: "Хорошо",
					},
				},
			}).render(true);
		}
	}
}

/* Загрузка JSON с альтернативным переводом */
async function loadAltTranslation(wrapped, lang) {
	const translations = await wrapped(lang);
	const route = foundry.utils.getRoute("/");

	const files = [
		`${route}modules/ru-ru/i18n/systems/dnd5e-alt.json`,
	];

	const promises = files.map((file) => this._loadTranslationFile(file));

	await Promise.all(promises);
	for (const p of promises) {
		const altJson = await p;
		foundry.utils.mergeObject(translations, altJson, { inplace: true });
	}

	return translations;
}
