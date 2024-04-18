import { init as INIT_ALIENRPG } from "./scripts/alienrpg.js";
import { init as INIT_BLADES_IN_THE_DARK } from "./scripts/blades-in-the-dark.js";
import { init as INIT_CITY_OF_MIST } from "./scripts/city-of-mist.js";
import { init as INIT_COC7 } from "./scripts/coc7.js";
import { init as INIT_DELTAGREEN } from "./scripts/deltagreen.js";
import { init as INIT_DND5E } from "./scripts/dnd5e.js";
import { init as INIT_DRAGONBANE } from "./scripts/dragonbane.js";
import { init as INIT_DUNGEONWORLD } from "./scripts/dungeonworld.js";
import { init as INIT_FORBIDDEN_LANDS } from "./scripts/forbidden-lands.js";
import { init as INIT_INVESTIGATOR } from "./scripts/investigator.js";
import { init as INIT_MAUSSRITTER } from "./scripts/mausritter.js";
import { init as INIT_MOUSEGUARD } from "./scripts/mouseguard.js";
import { init as INIT_PBTA } from "./scripts/pbta.js";
import { init as INIT_SWADE } from "./scripts/swade.js";
import { init as INIT_WFRP4E } from "./scripts/wfrp4e.js";
import { init as INIT_YZECORIOLIS } from "./scripts/yzecoriolis.js";

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
		Beaufort: { editor: true, fonts: [] },
		Exocet: { editor: true, fonts: [] },
		"Fira Sans Extra Condensed": { editor: true, fonts: [] },
		GWENT: { editor: true, fonts: [] },
		Manuskript: { editor: true, fonts: [] },
		"Marck Script": { editor: true, fonts: [] },
		Montserrat: { editor: true, fonts: [] },
		"Noto Sans Mono": { editor: true, fonts: [] },
		"Noto Sans": { editor: true, fonts: [] },
		"Noto Serif": { editor: true, fonts: [] },
		"OCR-A": { editor: true, fonts: [] },
	};

	CONFIG.fontDefinitions = foundry.utils.mergeObject(
		CONFIG.fontDefinitions,
		cyrillicFonts,
	);
	CONFIG.defaultFontFamily = "Noto Sans";

	/* Настройка шрифта для подписей на сцене */
	game.settings.register("ru-ru", "sceneLabelFont", {
		name: "Шрифт подписей на сцене",
		hint: "Шрифт, используемый для имён токенов и названий заметок на сцене.",
		type: Number,
		default: Object.keys(CONFIG.fontDefinitions).indexOf(
			CONFIG.defaultFontFamily,
		),
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
	const systemHandlers = {
		alientrpg: INIT_ALIENRPG,
		"blades-in-the-dark": INIT_BLADES_IN_THE_DARK,
		"city-of-mist": INIT_CITY_OF_MIST,
		coc7: INIT_COC7,
		deltagreen: INIT_DELTAGREEN,
		dnd5e: INIT_DND5E,
		dragonbane: INIT_DRAGONBANE,
		dungeonworld: INIT_DUNGEONWORLD,
		"forbidden-lands": INIT_FORBIDDEN_LANDS,
		investigator: INIT_INVESTIGATOR,
		mausritter: INIT_MAUSSRITTER,
		mouseguard: INIT_MOUSEGUARD,
		pbta: INIT_PBTA,
		swade: INIT_SWADE,
		wfrp4e: INIT_WFRP4E,
		yzecoriolis: INIT_YZECORIOLIS,
	};

	const systemHandler = systemHandlers[system];

	if (systemHandler) {
		systemHandler();
	}

	/* Исправление для QUICK INSERT */
	if (game.modules.get("quick-insert")?.active) {
		Hooks.on("ready", async () => {
			await game.settings.set("quick-insert", "embeddedIndexing", true);
		});
	}
});

/* Выбор пола для случайных прилагательных */
Hooks.on("getSceneControlButtons", getSceneControlButtons);

function getSceneControlButtons(controls) {
	if (
		game.user.isGM &&
		game.settings.get("ru-ru", "displayAdjectiveControls")
	) {
		const tokens = controls.find((c) => c.name === "token");

		tokens.tools.push({
			name: "adjectives-mode",
			title: "Переключение рода прилагательных",
			icon: "fas fa-female",
			active: CONFIG.Token.adjectivesPrefix === "TOKEN.RussianAdjectivesF",
			toggle: true,
			onClick: (active) => {
				if (active) {
					ui.notifications.notify(
						"Для случайных прилагательных используется женский род",
					);
					CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesF";
				} else {
					ui.notifications.notify(
						"Для случайных прилагательных используется мужской род",
					);
					CONFIG.Token.adjectivesPrefix = "TOKEN.RussianAdjectivesM";
				}
			},
		});
	}
}
