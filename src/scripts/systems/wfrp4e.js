import { patchConfigReady, patchConfigSetup } from "./wfrp4-config";
import {
	translatedCareerClass,
	translatedDuration,
	translatedExceptions,
	translatedGender,
	translatedHitLocation,
	translatedSkill,
	translatedSpec,
	translatedSpecification,
	translatedTalent,
	translatedSpellRange,
	translatedSpellDuration,
	translatedSpellTarget,
	translatedSpellDamage,
	translatedGods
} from "./wfrp4-data";

export function init() {
	if (typeof Babele === "undefined") {
		new Dialog({
			title: "Перевод WFRP4",
			content: `<p>Для перевода системы WFRP4 требуется установить и активировать модули <b>Babele и libWrapper</b><p>`,
			buttons: {
				done: {
					label: "Хорошо"
				}
			}
		}).render(true);
	} else {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: "compendium/wfrp4e"
		});

		Babele.get().registerConverters({
			convertSkill: (skills) => {
				if (!skills) return;
				return translateArray(skills, translatedSkill, translatedSpec);
			},

			convertTalent: (talents) => {
				if (!talents) return;
				return translateArray(talents, translatedTalent, translatedSpec);
			},

			convertDuration: (duration) => {
				if (!duration) return;
				return translateValue(duration, translatedDuration);
			},

			convertHitLocation: (hitLocation) => {
				if (!hitLocation) return;
				return translateValue(hitLocation, translatedHitLocation);
			},

			convertCareerClass: (careerClass) => {
				if (!careerClass) return;
				return translateValue(careerClass, translatedCareerClass);
			},

			convertSpecification: (specification) => {
				if (!specification) return;
				return translateValue(specification, translatedSpecification);
			},

			convertGender: (gender) => {
				if (!gender) return;
				return translateValue(gender, translatedGender);
			},

			convertSpellRange: (range) => {
				if (!range) return;
				return translateValue(range, translatedSpellRange);
			},

			convertSpellDuration: (duration) => {
				if (!duration) return;
				return translateValue(duration, translatedSpellDuration);
			},

			convertSpellTarget: (target) => {
				if (!target) return;
				return translateValue(target, translatedSpellTarget);
			},

			convertSpellDamage: (damage) => {
				if (!damage) return;
				return translateValue(damage, translatedSpellDamage);
			},

			convertGods: (gods) => {
				if (!gods) return;
				return translateList(gods, translatedGods);
			}

			//convertEffects: (effects, translations) => {
			//	// todo
			//}
		});

		Hooks.once("ready", () => {
			patchConfigReady();
		});

		Hooks.on("setup", () => {
			patchConfigSetup();
		});

		function translateValue(value, translations) {
			return translations[value] || value;
		}

		function translateCompoundString(
			value,
			termTranslations,
			detailTranslations
		) {
			if (translatedExceptions.hasOwnProperty(value)) {
				return translatedExceptions[value];
			}

			const [term, detail] = value.split(" (");

			if (detail) {
				const cleanedDetail = detail.slice(0, -1);
				const translatedTerm = termTranslations[term];
				const translatedDetail = detailTranslations[cleanedDetail];

				if (translatedTerm && translatedDetail) {
					return `${translatedTerm} (${translatedDetail})`;
				} else if (translatedTerm) {
					return `${translatedTerm} (${cleanedDetail})`;
				}
			} else {
				const translatedTerm = termTranslations[term];

				if (translatedTerm) {
					return translatedTerm;
				}
			}

			return value;
		}

		function translateArray(arr, termTranslations, detailTranslations) {
			return arr.map((value) =>
				translateCompoundString(value, termTranslations, detailTranslations)
			);
		}

		function translateList(value, translations) {
			return value
				.split(", ")
				.map((item) => {
					return translateValue(item, translations);
				})
				.join(", ");
		}

		// function translateObjectNames(arr) {
		// 	return arr.map((obj) => {
		// 		if (obj.hasOwnProperty("name")) {
		// 			obj.name = translateCompoundString(obj.name);
		// 		}
		// 		return obj;
		// 	});
		// }
	}
}
