export const Dnd5eAltInit = () => {
	/* Выбор источника перевода */
	game.settings.register("ru-ru", "altTranslation", {
		name: "Использовать альтернативный перевод",
		hint: "(Требуется модуль libWrapper) Использовать альтернативный перевод D&D5e от Phantom Studio. Иначе будет использоваться официальный перевод издательства Hobby World.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	if (game.settings.get("ru-ru", "altTranslation")) {
		if (typeof libWrapper === "function") {
			libWrapper.register(
				"ru-ru",
				"Localization.prototype._getTranslations",
				loadAltTranslation,
				"WRAPPER"
			);
		} else {
			new Dialog({
				title: "Альтернативный перевод",
				content: `<p>Для использования альтернативного перевода требуется активировать модуль <b>libWrapper</b></p>`,
				buttons: {
					done: {
						label: "Хорошо"
					}
				}
			}).render(true);
		}
	}

	/* Загрузка JSON с альтернативным переводом */
	async function loadAltTranslation(wrapped, lang) {
		const translations = await wrapped(lang);

		const files = [
			"modules/ru-ru/i18n/systems/dnd5e-alt.json",
			"modules/ru-ru/i18n/modules/always-hp-alt.json",
			"modules/ru-ru/i18n/modules/arbron-hp-bar-alt.json",
			"modules/ru-ru/i18n/modules/combat-utility-belt-alt.json",
			"modules/ru-ru/i18n/modules/dae-alt.json",
			"modules/ru-ru/i18n/modules/damage-log-alt.json",
			"modules/ru-ru/i18n/modules/health-monitor-alt.json",
			"modules/ru-ru/i18n/modules/midi-qol-alt.json",
			"modules/ru-ru/i18n/modules/tidy5e-sheet-alt.json",
			"modules/ru-ru/i18n/modules/token-action-hud-dnd5e-alt.json",
			"modules/ru-ru/i18n/modules/ready-set-roll-5e-alt.json"
		];

		const promises = files.map((file) => this._loadTranslationFile(file));

		await Promise.all(promises);
		for (let p of promises) {
			let altJson = await p;
			foundry.utils.mergeObject(translations, altJson, { inplace: true });
		}

		return translations;
	}
};
