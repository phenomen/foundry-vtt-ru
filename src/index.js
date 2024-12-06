const scripts = import.meta.glob("./systems/*.js");
import { init as INIT_DND5E_ALT } from "./misc/dnd5e-alt.js";

Hooks.once("init", () => {
	const system = game.system.id.toLowerCase();
	const route = foundry.utils.getRoute("/");

	/* Загрузка особых CSS стилей для систем */
	const systemCSS = document.createElement("link");
	systemCSS.rel = "stylesheet";
	systemCSS.href = `${route}modules/ru-ru/styles/${system}.css`;
	document.head.appendChild(systemCSS);

	/* Пол прилагательных по умолчанию */
	CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

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

	/* Настройка шрифта для подписей на сцене */
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

	CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
		game.settings.get("ru-ru", "sceneLabelFont")
	];

	/* Системные скрипты */
	for (const path in scripts) {
		scripts[path]().then((mod) => {
			if (path.includes(`${system}.js`)) {
				mod.init();
			}
		});
	}

	if (system === "dnd5e") {
		INIT_DND5E_ALT();
	}

	/* Исправление для QUICK INSERT */
	if (game.modules.get("quick-insert")?.active) {
		Hooks.on("ready", () => {
			game.settings.set("quick-insert", "embeddedIndexing", true);
		});
	}
});

/* Выбор пола для случайных прилагательных */
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
