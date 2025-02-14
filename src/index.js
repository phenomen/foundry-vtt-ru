const scripts = import.meta.glob("./systems/*.js");

Hooks.once("init", () => {
	const system = game.system.id.toLowerCase();
	const route = foundry.utils.getRoute("/");

	/* Загрузка особых CSS стилей для систем */
	const systemCSS = document.createElement("link");
	systemCSS.rel = "stylesheet";
	systemCSS.href = `${route}modules/ru-ru/styles/${system}.css`;
	document.head.appendChild(systemCSS);

	/* Добавление шрифтов с кириллицей */
	const cyrillicFonts = {
		"Beaufort": { editor: true, fonts: [] },
		"Exocet": { editor: true, fonts: [] },
		"GWENT": { editor: true, fonts: [] },
		"Manuskript": { editor: true, fonts: [] },
		"Marck Script": { editor: true, fonts: [] },
		"OCR-A": { editor: true, fonts: [] },
		"Roboto Condensed": { editor: true, fonts: [] },
		"Roboto Serif": { editor: true, fonts: [] },
		"Roboto": { editor: true, fonts: [] },
	};

	CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, cyrillicFonts);
	CONFIG.defaultFontFamily = "Roboto";

	/* Настройка шрифта для подписей на сцене */
	game.settings.register("ru-ru", "sceneLabelFont", {
		name: "Шрифт подписей на сцене",
		hint: "Шрифт, используемый для имён токенов и названий заметок на сцене.",
		type: Number,
		default: Object.keys(CONFIG.fontDefinitions).indexOf(CONFIG.defaultFontFamily),
		choices: Object.keys(CONFIG.fontDefinitions),
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		},
	});

	/* Шрифт для подписей на сцене */
	CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
		game.settings.get("ru-ru", "sceneLabelFont")
	];

	/* Переключатель рода случайных прилагательных */
	/*
	game.settings.register("ru-ru", "displayAdjectiveControls", {
		name: "Переключатель рода случайных прилагательных",
		hint: "Если вы используете функцию добавления случайных прилагательных к токенам, вы можете добавить переключатель рода на панель инструментов.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		},
	});
	*/

	/* Пол прилагательных по умолчанию */
	CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

	/* Загрузка перевода FVTT V13 */
	//loadNextTranslations();

	/* Системные скрипты */
	for (const path in scripts) {
		scripts[path]().then((mod) => {
			if (path.includes(`${system}.js`)) {
				mod.init();
			}
		});
	}
});

/* Выбор пола для случайных прилагательных */
/* TODO: переделать на новый API для FVTT V13 */
/*
Hooks.on("getSceneControlButtons", getSceneControlButtons);

function getSceneControlButtons(controls) {
	if (game.user.isGM && game.settings.get("ru-ru", "displayAdjectiveControls")) {
		const tokens = controls.find((c) => c.name === "token");

		tokens.tools.push({
			name: "adjectives-mode",
			title: "Переключение рода прилагательных",
			icon: "fas fa-female",
			active: CONFIG.Token.adjectivesPrefix === "TOKEN.RussianAdjectivesF",
			toggle: true,
			onClick: (active) => {
				if (active) {
					ui.notifications.notify("Для случайных прилагательных используется женский род");
					CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesF";
				} else {
					ui.notifications.notify("Для случайных прилагательных используется мужской род");
					CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";
				}
			},
		});
	}
}
*/

/* TODO: после релиза FVTT V13, слияние в обратную сторону и спустя несколько обновлений V13, удалить этот код */
async function loadNextTranslations() {
	if (Number(game.version.slice(0, 2)) < 13) return;

	const nextTranslations = await foundry.utils.fetchJsonWithTimeout(
		"modules/ru-ru/i18n/core/foundry-v13.json",
	);

	game.i18n.translations = foundry.utils.mergeObject(game.i18n.translations, nextTranslations, {
		overwrite: true,
	});
}
