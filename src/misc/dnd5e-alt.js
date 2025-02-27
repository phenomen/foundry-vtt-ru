export function init() {
	game.settings.register("ru-ru", "altTranslation", {
		name: "(D&D5E) Альтернативный перевод",
		hint: "Использовать альтернативный перевод от Dungeons.ru. Иначе будет использоваться официальный перевод Hobby World и Adventure Guys (требуется модуль libWrapper)",
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

	const systemFiles = ["dnd5e.json", "dnd5e-plural.json"];
	const moduleFiles = [
		"action-pack.json",
		"activeauras.json",
		"always-hp.json",
		"arbron-hp-bar.json",
		"bossbar.json",
		"combat-utility-belt.json",
		"combatbooster.json",
		"compendium-browser.json",
		"damage-log.json",
		"dnd5e-system-customizer.json",
		"enhancedcombathud-dnd5e.json",
		"enhancedcombathud.json",
		"epic-rolls-5e.json",
		"health-monitor.json",
		"healthestimate.json",
		"lmrtfy.json",
		"midi-qol.json",
		"ready-set-roll-5e.json",
		"tidy5e-sheet.json",
		"token-action-hud-dnd5e.json",
		"vision-5e.json",
	];

	const files = [
		...systemFiles.map((file) => `${route}${systemPath}${file}`),
		...moduleFiles.map((file) => `${route}${modulePath}${file}`),
	];

	const altTranslations = {};

	for (const file of files) {
		try {
			const altJson = await this._loadTranslationFile(file);
			foundry.utils.mergeObject(altTranslations, altJson, { inplace: true });
		} catch (error) {
			console.warn(`Не удалось загрузить перевод: ${file}`, error);
		}
	}

	foundry.utils.mergeObject(translations, altTranslations, { inplace: true });

	return translations;
}
