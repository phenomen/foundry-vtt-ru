import { setupBabele, translateValue } from "../shared.js";

let error;

export function init() {
	game.settings.register("ru-ru", "setupRules", {
		name: "(SWADE) Перевод настроек системы",
		hint: "Автоматический перевод стандартных навыков и других настроек системы SWADE. Отключите, если желаете внести изменения вручную.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
	});

	setupBabele("swade");
	registerConverters();

	Hooks.on("ready", () => {
		if (error) {
			ui.notifications.error(error);
		}

		setupRules();
	});
}

function registerConverters() {
	if (!game.babele) return;

	game.babele.registerConverters({
		convertCategory: (value) => {
			if (!value) return;
			return translateValue(value, CATEGORIES);
		},

		convertRank: (value) => {
			if (!value) return;
			return translateValue(value, RANKS);
		},

		convertRange: (value) => {
			if (!value) return;
			return translateValue(value, RANGES);
		},

		convertDuration: (value) => {
			if (!value) return;
			return translateValue(value, DURATIONS);
		},

		convertRequirements: (requirements) => {
			if (!requirements) return;

			let packEdges = "swade.edges";
			let packHindrances = "swade.hindrances";
			let packSkills = "swade.skills";

			if (game.modules.get("swade-core-rules")?.active) {
				packEdges = "swade-core-rules.swade-edges";
				packHindrances = "swade-core-rules.swade-hindrances";
				packSkills = "swade-core-rules.swade-skills";
			}

			if (game.modules.get("swpf-core-rules")?.active) {
				packEdges = "swpf-core-rules.swpf-edges";
				packHindrances = "swpf-core-rules.swpf-hindrances";
				packSkills = "swpf-core-rules.swpf-skills";
			}

			const { packs } = game.babele;
			const translatedEdges = packs.find((pack) => pack.metadata.id === packEdges).translations;
			const translatedHindrances = packs.find(
				(pack) => pack.metadata.id === packHindrances,
			).translations;
			const translatedSkills = packs.find((pack) => pack.metadata.id === packSkills).translations;

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
		// SWADE Core
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

		// SWADE Core
		if (game.modules.get("swade-core-rules")?.active) {
			game.settings.set("swade", "coreSkillsCompendium", "swade-core-rules.swade-skills");
		}

		// Savage Pathfinder
		if (game.modules.get("swpf-core-rules")?.active) {
			game.settings.set("swade", "coreSkillsCompendium", "swpf-core-rules.swpf-skills");
			game.settings.set("swade", "currencyName", "зм");
		}

		// Deadlands
		if (game.modules.get("deadlands-core-rules")?.active) {
			game.settings.set("swade", "currencyName", "$");
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
	"Arcane Background (Weird Science)": "Сверхъестественный дар (безумная наука)",
	"arcane skill": "сверхъестественный навык",
	"Tough as Nails": "Несгибаемый",
	"Work the Room": "Заводила",
	"Professional in affected Trait": "Профессионал в выбранном параметре",
	"Expert in affected Trait": "Профессионал+ в выбранном параметре",
	"maximum die type possible in affected Trait": "максимальное значение выбранного параметра",
};

const CATEGORIES = {
	"Background": "Предыстории",
	"Combat": "Боевые",
	"Professional": "Профессиональные",
	"Social": "Социальные",
	"Weird": "Потусторонние",
	"Leadership": "Лидерские",
	"Power": "Сверхъестественные",
	"Legendary": "Легендарные",
};

const RANKS = {
	"Novice": "Новичок",
	"Seasoned": "Закалённый",
	"Veteran": "Ветеран",
	"Heroic": "Герой",
};

const RANGES = {
	"Self": "на себя",
	"Touch": "касание",
	"Cone Template": "конусный шаблон",
	"Small Blast Template": "малый шаблон",
	"Medium Blast Template": "средний шаблон",
	"Large Blast Template": "большой шаблон",
	"Sm": "СМК",
	"Sm x 2": "СМК×2",
	"Smarts x5 (Sound); Smarts (Silence)": "СМК×5 (звук); СМК (тишина)",
};

const DURATIONS = {
	"Instant": "мгновенное",
	"Special": "особое",
	"One Round": "1 раунд",
	"One Minute": "1 минута",
	"5": "5 минут",
	"5 minutes": "5 минут",
	"10 minutes": "10 минут",
	"30 Minutes": "30 минут",
	"One hour": "1 час",
	"One day": "1 день",
	"Until the end of the victim's next turn": "до конца следующего хода цели",
	"5 (detect), one hour (conceal)": "5 (обнаружение); 1 час (скрытие)",
	"Instant (Sound); 5 (Silence)": "мгновенное (звук); 5 (тишина)",
	"5 (boost); Instant (lower)": "5 (усилить); мгновенное (ослабить)",
	"Instant (slot); 5 (speed)": "мгновенное (замедление); 5 (ускорение)",
	"A brief conversation of about five minutes": "до 5 минут (короткая беседа)",
};
