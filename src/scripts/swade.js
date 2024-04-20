import { setupBabele, translateValue } from "../shared.js";

let error;

export function init() {
	registerBabele();
	registerConverters();

	Hooks.on("ready", () => {
		if (error) {
			ui.notifications.error(error);
		}
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
	if (typeof Babele === "undefined") return;

	Babele.get().registerConverters({
		convertCategory: (category) => {
			if (!category) return;
			return translateValue(category, CATEGORIES);
		},

		convertRequirements: (requirements) => {
			if (!requirements) return;

			const { packs } = Babele.get();
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
	Weird: "Мистические",
	Leadership: "Лидерские",
	Power: "Сверхъестественные",
	Legendary: "Легендарные",
};
