import { setupBabele, translateValue } from "../shared.js";

let error;

export function init() {
	game.settings.register("ru-ru", "setupRules", {
		name: "(SWADE) Перевод настроек системы",
		hint: "Автоматический перевод навыков и других настроек системы SWADE. Отключите, если желаете внести изменения вручную.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		},
	});

	registerBabele();
	registerConverters();

	Hooks.on("ready", () => {
		if (error) {
			ui.notifications.error(error);
		}

		setupRules();
	});
}

function registerBabele() {
	if (
		game.modules.get("swade-core-rules")?.active &&
		game.modules.get("swpf-core-rules")?.active
	) {
		error =
			"Для <b>Savage Pathfinder</b> не требуется модуль <b>SWADE Core Rules</b>. Отключите его, иначе перевод не будет работать.";
	} else if (
		!game.modules.get("swade-core-rules")?.active &&
		game.modules.get("deadlands-core-rules")?.active
	) {
		error =
			"Для <b>Deadlands</b> требуется модуль <b>SWADE Core Rules</b>. Активируйте его, иначе перевод не будет работать.";
	} else if (game.modules.get("swpf-core-rules")?.active) {
		setupBabele("swade/swpf");
	} else if (game.modules.get("swade-core-rules")?.active) {
		setupBabele("swade/core");
	} else {
		setupBabele("swade/basic");
	}
}

function registerConverters() {
	if (game.babele) return;

	game.babele.registerConverters({
		convertCategory: (category) => {
			if (!category) return;
			return translateValue(category, CATEGORIES);
		},

		convertRequirements: (requirements) => {
			if (!requirements) return;

			const { packs } = game.babele;
			const translatedEdges = packs.find(
				(pack) => pack.metadata.id === "swade.edges",
			).translations;
			const translatedHindrances = packs.find(
				(pack) => pack.metadata.id === "swade.hindrances",
			).translations;
			const translatedSkills = packs.find(
				(pack) => pack.metadata.id === "swade.skills",
			).translations;

			return requirements.map((data) => {
				if (!data.label) return data;

				const translatedLabel =
					EXCEPTIONS[data.label] ||
					translatedEdges[data.label]?.name ||
					translatedHindrances[data.label]?.name ||
					translatedSkills[data.label]?.name;

				if (translatedLabel) data.label = translatedLabel;

				return data;
			});
		},
	});
}

function setupRules() {
	if (game.settings.get("ru-ru", "setupRules")) {
		// SWADE Basic
		game.settings.set(
			"swade",
			"coreSkills",
			"Атлетика, Внимание, Осведомлённость, Скрытность, Убеждение",
		);
		game.settings.set(
			"swade",
			"vehicleSkills",
			"Верховая езда, Вождение, Пилотирование, Судовождение",
		);
		game.settings.set("swade", "currencyName", "$");

		// SWADE Core
		if (game.modules.get("swade-core-rules")?.active) {
			game.settings.set(
				"swade",
				"coreSkillsCompendium",
				"swade-core-rules.swade-skills",
			);
		}

		// Savage Pathfinder
		if (game.modules.get("swpf-core-rules")?.active) {
			game.settings.set(
				"swade",
				"coreSkillsCompendium",
				"swpf-core-rules.swpf-skills",
			);
			game.settings.set("swade", "currencyName", "зм");
		}
	}
}

/* Data */

const EXCEPTIONS = {
	"Arcane Background (Any)": "Сверхъестественный дар (любой)",
	"Arcane Background (Gifted)": "Сверхъестественный дар (феномен)",
	"Arcane Background (Miracles)": "Сверхъестественный дар (чудеса)",
	"Arcane Background (Magic)": "Сверхъестественный дар (магия)",
	"Arcane Background (Psionics)": "Сверхъестественный дар (псионика)",
	"Arcane Background (Weird Science)":
		"Сверхъестественный дар (безумная наука)",
	"arcane skill": "сверхъестественный навык",
	"Tough as Nails": "Несгибаемый",
	"Work the Room": "Заводила",
	"Professional in affected Trait": "Профессионал в выбранном параметре",
	"Expert in affected Trait": "Профессионал+ в выбранном параметре",
	"maximum die type possible in affected Trait":
		"максимальное значение выбранного параметра",
};

const CATEGORIES = {
	Background: "Предыстории",
	Combat: "Боевые",
	Professional: "Профессиональные",
	Social: "Социальные",
	Weird: "Потусторонние",
	Leadership: "Лидерские",
	Power: "Сверхъестественные",
	Legendary: "Легендарные",
};
