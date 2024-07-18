import { setupBabele } from "../shared.js";

export function init() {
	/* Регистрация настроек */
	game.settings.register("ru-ru", "altTranslation", {
		name: "(D&D5E) Альтернативный перевод",
		hint: "(Требуется модуль libWrapper) Использовать альтернативный перевод D&D5E от Phantom Studio. Иначе будет использоваться официальный перевод издательства Hobby World.",
		type: String,
		default: "hw",
		scope: "world",
		config: true,
		restricted: true,
		requiresReload: true,
		choices: {
			hw: "Нет",
			ps: "Phantom Studio",
			dr: "dungeons.ru/dnd.su",
		},
	});

	game.settings.register("ru-ru", "compendiumTranslation", {
		name: "(D&D5E) Перевод библиотек",
		hint: "(Требуется модуль Babele) Библиотеки системы D&D5E будут переведены.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		requiresReload: true,
	});

	/* Миграция значения настройки altTranslation */
	if (
		["true", "false"].includes(game.settings.get("ru-ru", "altTranslation"))
	) {
		const value =
			game.settings.get("ru-ru", "altTranslation") === "true" ? "ps" : "hw";
		game.settings.storage
			.get("world")
			.getSetting("ru-ru.altTranslation").value = value;

		Hooks.once("ready", async () => {
			game.settings.set("ru-ru", "altTranslation", value);
		});
	}

	/* Регистрация Babele */
	if (game.settings.get("ru-ru", "compendiumTranslation")) {
		if (typeof game.babele !== "undefined") {
			/* Библиотеки D&D */
			setupBabele(`dnd5e/${game.settings.get("ru-ru", "altTranslation")}`);

			/* Библиотеки Ruins of Symbaroum */
			if (game.modules.get("symbaroum5ecore")?.active) {
				setupBabele("dnd5e/ros");
			}

			game.babele.registerConverters({
				dndpages(pages, translations) {
					return pages.map((data) => {
						if (!translations) {
							return data;
						}

						let translation;

						if (Array.isArray(translations)) {
							translation = translations.find(
								(t) => t.id === data._id || t.id === data.name,
							);
						} else {
							translation = translations[data.name];
						}

						if (!translation) {
							return data;
						}

						return mergeObject(data, {
							name: translation.name,
							image: { caption: translation.caption ?? data.image?.caption },
							src: translation.src ?? data.src,
							text: { content: translation.text ?? data.text?.content },
							video: {
								width: translation.width ?? data.video?.width,
								height: translation.height ?? data.video?.height,
							},
							system: { tooltip: translation.tooltip ?? data.system.tooltip },
							translated: true,
						});
					});
				},
			});
		} else {
			new Dialog({
				title: "Использование",
				content:
					"<p>Для перевода библиотек системы D&D5E требуется активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля</p>",
				buttons: {
					done: {
						label: "Хорошо",
					},
					never: {
						label: "Больше не показывать",
						callback: () => {
							game.settings.set("ru-ru", "compendiumTranslation", false);
						},
					},
				},
			}).render(true);
		}
	}

	/* Регистрация альтернативного перевода */
	if (game.settings.get("ru-ru", "altTranslation") !== "hw") {
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

	/*  Настройка автоопределения анимаций AA  */
	Hooks.on("renderSettingsConfig", async (app, html, data) => {
		if (!game.user.isGM) return;

		const lastMenuSetting = html
			.find(`input[name="ru-ru.compendiumTranslation"]`)
			.closest(".form-group");

		const template_data = {
			label:
				"Перед переводом анимаций требуется включить модули Automated Animations, D&D5E Animations, JB2A Patreon",
			button_label: "Перевести анимации",
		};

		let button_html = await renderTemplate(
			"modules/ru-ru/templates/dnd5e-settings-update-aa-button.hbs",
			template_data,
		);

		button_html = $(button_html);
		button_html.find("button").click((e) => {
			e.preventDefault();
			updateAA();
		});

		lastMenuSetting.after(button_html);
	});
}

/* Загрузка JSON с альтернативным переводом */
async function loadAltTranslation(wrapped, lang) {
	const translations = await wrapped(lang);

	const variant = game.settings.get("ru-ru", "altTranslation");

	const files = [
		"modules/ru-ru/i18n/systems/dnd5e-alt-ps.json",
		"modules/ru-ru/i18n/modules/always-hp-alt.json",
		"modules/ru-ru/i18n/modules/arbron-hp-bar-alt.json",
		"modules/ru-ru/i18n/modules/combat-utility-belt-alt.json",
		"modules/ru-ru/i18n/modules/dae-alt.json",
		"modules/ru-ru/i18n/modules/damage-log-alt.json",
		"modules/ru-ru/i18n/modules/health-monitor-alt.json",
		"modules/ru-ru/i18n/modules/midi-qol-alt.json",
		"modules/ru-ru/i18n/modules/tidy5e-sheet-alt.json",
		"modules/ru-ru/i18n/modules/token-action-hud-dnd5e-alt.json",
		"modules/ru-ru/i18n/modules/ready-set-roll-5e-alt.json",
	];

	const promises = files.map((file) => this._loadTranslationFile(file));

	await Promise.all(promises);

	if (variant === "dr") {
		const alt_files = ["modules/ru-ru/i18n/systems/dnd5e-alt-dr.json"];
		const alt_promises = alt_files.map((file) =>
			this._loadTranslationFile(file),
		);
		await Promise.all(alt_promises);
		promises.push(...alt_promises);
	}

	for (const p of promises) {
		const altJson = await p;
		foundry.utils.mergeObject(translations, altJson, { inplace: true });
	}

	return translations;
}

/* Обновление базы AA */
async function updateAA() {
	const translatedSettings = await foundry.utils.fetchJsonWithTimeout(
		"/modules/ru-ru/i18n/modules/aa-autorec.json",
	);

	const currentSettings =
		AutomatedAnimations.AutorecManager.getAutorecEntries();

	const newSettings = {
		melee: mergeArrays(currentSettings.melee, translatedSettings.melee),
		range: mergeArrays(currentSettings.range, translatedSettings.range),
		ontoken: mergeArrays(currentSettings.ontoken, translatedSettings.ontoken),
		templatefx: mergeArrays(
			currentSettings.templatefx,
			translatedSettings.templatefx,
		),
		aura: mergeArrays(currentSettings.aura, translatedSettings.aura),
		preset: mergeArrays(currentSettings.preset, translatedSettings.preset),
		aefx: mergeArrays(currentSettings.aefx, translatedSettings.aefx),
		version: "5",
	};

	AutomatedAnimations.AutorecManager.overwriteMenus(
		JSON.stringify(newSettings),
		{
			submitAll: true,
		},
	);
}

function mergeArrays(array1, array2) {
	const labelMap = new Map(array2.map((item) => [item.metaData.label, item]));

	return array1.map((item) => {
		const matchingItem = labelMap.get(item.metaData.label);
		return matchingItem ? { ...item, ...matchingItem } : item;
	});
}
