const scripts = import.meta.glob("./systems/*.js");

import { init as dnd5eAlt } from "./systems/alt/dnd5e.js";

Hooks.once("init", async () => {
	const system = game.system.id.toLowerCase();
	const route = foundry.utils.getRoute("/");

	/* Загрузка особых CSS стилей для систем */
	const systemCSS = document.createElement("link");
	systemCSS.rel = "stylesheet";
	systemCSS.href = `${route}modules/ru-ru/styles/${system}.css`;
	document.head.appendChild(systemCSS);

	/* Добавление шрифтов с кириллицей */
	const cyrillicFonts = {
		Beaufort: { editor: true, fonts: [] },
		Exocet: { editor: true, fonts: [] },
		GWENT: { editor: true, fonts: [] },
		Manuskript: { editor: true, fonts: [] },
		"Marck Script": { editor: true, fonts: [] },
		"OCR-A": { editor: true, fonts: [] },
		"Roboto Condensed": { editor: true, fonts: [] },
		"Roboto Serif": { editor: true, fonts: [] },
		Roboto: { editor: true, fonts: [] },
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

	/* Случайные прилагательные для токенов */
	CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

	if (system === "dnd5e") {
		dnd5eAlt();
	}

	/* Системные скрипты */
	for (const path in scripts) {
		scripts[path]().then((mod) => {
			if (path.includes(`${system}.js`)) {
				mod.init();
			}
		});
	}
});
