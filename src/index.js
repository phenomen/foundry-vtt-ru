const scripts = import.meta.glob("./systems/*.js");

import { init as dnd5eAlt } from "./systems/alt/dnd5e.js";

Hooks.once("init", async () => {
	const system = game.system.id.toLowerCase();
	const route = foundry.utils.getRoute("/");

	/* Загрузка особых CSS стилей для систем */
	if (game.modules.get("ru-ru").flags.styles.includes(system)) {
		const systemCSS = document.createElement("link");
		systemCSS.rel = "stylesheet";
		systemCSS.href = `${route}modules/ru-ru/styles/${system}.css`;
		document.head.appendChild(systemCSS);
	}

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
		onChange: (_value) => {
			window.location.reload();
		},
	});

	/* Шрифт для подписей на сцене */
	CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
		game.settings.get("ru-ru", "sceneLabelFont")
	];

	/* Случайные прилагательные для токенов */
	CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

	/* D&D5 альтернативный перевод */
	if (system === "dnd5e") {
		dnd5eAlt();
	}

	/* Инициализация системного скрипта, если он существует */
	const systemScriptPath = `./systems/${system}.js`;
	if (scripts[systemScriptPath]) {
		const mod = await scripts[systemScriptPath]();
		mod.init();
	}
});
