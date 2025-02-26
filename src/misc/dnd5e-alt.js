export function init() {
	game.settings.register("ru-ru", "altTranslation", {
		name: "(D&D5E) Альтернативный перевод",
		hint: "Использовать альтернативный перевод от Dungeons_ru. Иначе будет использоваться официальный перевод издательства Hobby World и Adventure Guys (требуется модуль libWrapper)",
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

	const modulePath = "modules/ru-ru/i18n/modules/alt/";
	const systemPath = "modules/ru-ru/i18n/systems/alt/";

	const files = [
		`${route}${systemPath}dnd5e.json`,
		`${route}${systemPath}dnd5e-plural.json`,
		`${route}${modulePath}action-pack.json`,
		`${route}${modulePath}activeauras.json`,
		`${route}${modulePath}always-hp.json`,
		`${route}${modulePath}arbron-hp-bar.json`,
		`${route}${modulePath}bossbar.json`,
		`${route}${modulePath}combat-utility-belt.json`,
		`${route}${modulePath}combatbooster.json`,
		`${route}${modulePath}compendium-browser.json`,
		`${route}${modulePath}damage-log.json`,
		`${route}${modulePath}dnd5e-system-customizer.json`,
		`${route}${modulePath}enhancedcombathud-dnd5e.json`,
		`${route}${modulePath}enhancedcombathud.json`,
		`${route}${modulePath}epic-rolls-5e.json`,
		`${route}${modulePath}health-monitor.json`,
		`${route}${modulePath}healthestimate.json`,
		`${route}${modulePath}lmrtfy.json`,
		`${route}${modulePath}midi-qol.json`,
		`${route}${modulePath}ready-set-roll-5e.json`,
		`${route}${modulePath}tidy5e-sheet.json`,
		`${route}${modulePath}token-action-hud-dnd5e.json`,
		`${route}${modulePath}vision-5e.json`,
	];

	const promises = files.map((file) => this._loadTranslationFile(file));

	await Promise.all(promises);
	for (const p of promises) {
		const altJson = await p;
		foundry.utils.mergeObject(translations, altJson, { inplace: true });
	}

	return translations;
}
