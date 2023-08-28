import "../styles/_main.css";
import "../styles/_fonts.css";
import "../styles/_custom.css";

import { Dnd5eAltInit } from "./systems/dnd5e-alt.js";

Hooks.once("init", async () => {
	const system = game.system.id.toLowerCase();

	/* Загрузка особых CSS стилей для систем */
	const systemCSS = document.createElement("link");
	systemCSS.rel = "stylesheet";
	systemCSS.href = `/modules/ru-ru/styles/${system}.css`;
	document.head.appendChild(systemCSS);

	/* Пол прилагательных по умолчанию */
	CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";

	/* Добавление шрифтов с кириллицей */
	const cyrillicFonts = {
		"Beaufort": { editor: true, fonts: [] },
		"Exocet": { editor: true, fonts: [] },
		"Fira Sans Extra Condensed": { editor: true, fonts: [] },
		"GWENT": { editor: true, fonts: [] },
		"Manuskript": { editor: true, fonts: [] },
		"Marck Script": { editor: true, fonts: [] },
		"Montserrat": { editor: true, fonts: [] },
		"Noto Sans Mono": { editor: true, fonts: [] },
		"Noto Sans": { editor: true, fonts: [] },
		"Noto Serif": { editor: true, fonts: [] },
		"OCR-A": { editor: true, fonts: [] }
	};

	CONFIG.fontDefinitions = foundry.utils.mergeObject(CONFIG.fontDefinitions, cyrillicFonts);
	CONFIG.defaultFontFamily = "Noto Sans";

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
		}
	});

	CONFIG.canvasTextStyle.fontFamily = Object.keys(CONFIG.fontDefinitions)[
		game.settings.get("ru-ru", "sceneLabelFont")
	];

	const systems = [
		"alienrpg",
		"coc7",
		"deltagreen",
		"dnd5e",
		"dragonbane",
		"dungeonworld",
		"forbidden-lands",
		"investigator",
		"mouseguard",
		"pbta",
		"pf1",
		"sfrpgbb",
		"wfrp4e",
		"yzecoriolis"
	];

	/* Загрузка системных скриптов */
	if (systems.includes(system)) {
		if (system === "dnd5e") Dnd5eAltInit(); // This code need load synchronously! Any modularization is denied!
		(await import(`./systems/${system}.js`))?.init();
	}

	/* Исправление для QUICK INSERT */
	if (game.modules.get("quick-insert")?.active) {
		Hooks.on("ready", async function () {
			await game.settings.set("quick-insert", "embeddedIndexing", true);
		});
	}
});

/* Выбор пола для случайных прилагательных */
Hooks.on("getSceneControlButtons", getSceneControlButtons);

function getSceneControlButtons(controls) {
	if (game.version.startsWith("11") && game.user.isGM) {
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
			}
		});
	}
}
