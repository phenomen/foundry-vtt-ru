export function init() {
	/* Уведомление выбора перевода */
	game.settings.register("ru-ru", "altTranslationSelected", {
		type: Boolean,
		default: false,
		scope: "world",
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	/* Настройка Babele */
	game.settings.register("ru-ru", "compendiumTranslation", {
		name: "Перевод библиотек",
		hint: "(Требуется модуль Babele) Некоторые библиотеки системы D&D5e будут переведены.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	if (!game.settings.get("ru-ru", "altTranslationSelected")) {
		new Dialog({
			title: "Выбор перевода",
			content: `<p>Выберите предпочитаемый перевод системы D&D5. Вы можете изменить это позже в настройках модуля</p>`,
			buttons: {
				hw: {
					label: "Hobby World",
					callback: () => {
						game.settings.set("ru-ru", "altTranslation", false);
						game.settings.set("ru-ru", "altTranslationSelected", true);
					}
				},
				ph: {
					label: "Phantom Studio",
					callback: () => {
						game.settings.set("ru-ru", "altTranslation", true);
						game.settings.set("ru-ru", "altTranslationSelected", true);
					}
				}
			}
		}).render(true);
	}

	/* Регистрация Babele */
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: game.settings.get("ru-ru", "altTranslation")
				? "compendium/dnd5e-alt"
				: "compendium/dnd5e"
		});

		game.settings.set("babele", "showOriginalName", true);

		Babele.get().registerConverters({
			dndpages(pages, translations) {
				return pages.map((data) => {
					if (!translations) {
						return data;
					}

					let translation;

					if (Array.isArray(translations)) {
						translation = translations.find((t) => t.id === data._id || t.id === data.name);
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
							height: translation.height ?? data.video?.height
						},
						system: translation.system ?? data.system,
						translated: true
					});
				});
			}
		});
	} else {
		if (game.settings.get("ru-ru", "compendiumTranslation")) {
			new Dialog({
				title: "Перевод библиотек",
				content: `<p>Для перевода библиотек системы D&D5 требуется активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля</p>`,
				buttons: {
					done: {
						label: "Хорошо"
					},
					never: {
						label: "Больше не показывать",
						callback: () => {
							game.settings.set("ru-ru", "compendiumTranslation", false);
						}
					}
				}
			}).render(true);
		}
	}

	/*  Настройка автоопределения анимаций AA  */
	Hooks.on("renderSettingsConfig", (app, html, data) => {
		if (!game.user.isGM) return;

		const lastMenuSetting = html
			.find(`input[name="ru-ru.compendiumTranslation"]`)
			.closest(".form-group");

		const updateAAButton = $(`
  <label>
    Перед переводом анимаций требуется включить модули Automated Animations, D&D5e Animations, JB2A Patreon
  </label>
  <div class="form-group">
      <button type="button">
          <i class="fas fa-cogs"></i>
          <label>Перевести анимации</label>
      </button>
  </div>
  `);
		updateAAButton.find("button").click((e) => {
			e.preventDefault();
			updateAA();
		});

		lastMenuSetting.after(updateAAButton);
	});
}

async function updateAA() {
	const translatedSettings = await foundry.utils.fetchJsonWithTimeout(
		"/modules/ru-ru/i18n/modules/aa-autorec.json"
	);

	const currentSettings = AutomatedAnimations.AutorecManager.getAutorecEntries();

	const newSettings = {
		melee: mergeArrays(currentSettings.melee, translatedSettings.melee),
		range: mergeArrays(currentSettings.range, translatedSettings.range),
		ontoken: mergeArrays(currentSettings.ontoken, translatedSettings.ontoken),
		templatefx: mergeArrays(currentSettings.templatefx, translatedSettings.templatefx),
		aura: mergeArrays(currentSettings.aura, translatedSettings.aura),
		preset: mergeArrays(currentSettings.preset, translatedSettings.preset),
		aefx: mergeArrays(currentSettings.aefx, translatedSettings.aefx),
		version: "5"
	};

	AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify(newSettings), {
		submitAll: true
	});
}

function mergeArrays(array1, array2) {
	const mergedArray = array1.map((item1) => {
		const matchingItem = array2.find((item2) => item2.metaData.label === item1.metaData.label);
		if (matchingItem) {
			return { ...item1, ...matchingItem };
		}
		return item1;
	});

	return mergedArray;
}
