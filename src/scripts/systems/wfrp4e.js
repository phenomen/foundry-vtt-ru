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

			convertActorSkill: (skills) => {
				if (!skills) return;
				return translateObjectNames(skills, translatedSkill, translatedSpec);
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
			},

			convertActorItems: (actor_items, translations) => {
				if (!actor_items) {
					console.log("No traits found here ...");
					return actor_items;
				}
				console.log("TRANS:", actor_items);
				for (let item_en of actor_items) {
					let special = "";
					let nbt = "";
					let name_en = item_en.name.trim(); // strip \r in some traits name
					if (!item_en.name || item_en.name.length == 0) {
						console.log("Wrong item name found!");
						continue;
					}
					//console.log(">>>>>>>> Parsing", item_en.name);
					if (item_en.type == "trait") {
						//console.log("Trait translation", compmod, item_en)
						if (name_en.includes("Tentacles")) {
							// Process specific Tentacles case
							let re = /(.d*)x Tentacles/i;
							let res = re.exec(name_en);
							if (res && res[1]) nbt = res[1] + "x ";
							name_en = "Tentacles";
						} else if (name_en.includes("(") && name_en.includes(")")) {
							// Then process specific traits name with (xxxx) inside
							let re = /(.*) \((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1]; // Get the root traits name
							special = " (" + game.i18n.localize(res[2].trim()) + ")"; // And the special keyword
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("trait");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || item_en.name;
								item_en.name = nbt + item_ru.name + special;
								item_en.system.description.value = item_ru.system.description.value;
								if (item_en.system?.specification && isNaN(item_en.system.specification.value)) {
									// This is a string, so translate it
									//console.log("Translating : ", item_en.system.specification.value);
									item_en.system.specification.value = game.i18n.localize(
										item_en.system.specification.value.trim()
									);
								}
								break; // Translation has been found, skip other compendiums
							}
						}
					} else if (item_en.type == "skill") {
						if (name_en.includes("(") && name_en.includes(")")) {
							// Then process specific skills name with (xxxx) inside
							let re = /(.*) +\((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1].trim(); // Get the root skill name
							special = " (" + game.i18n.localize(res[2].trim()) + ")"; // And the special keyword
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("skill");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								//console.log(">>>>> Skill ?", name_en, special, item_ru.name, item_ru);
								item_ru.name = item_ru.name || name_en;
								item_en.name = item_ru.name + special;
								item_en.system.description.value = item_ru.system.description.value;
								break; // Translation has been found, skip other compendiums
							}
						}
					} else if (item_en.type == "prayer") {
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("prayer");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								//DEBUG : console.log(">>>>> Prayer ?", name_en, special, item_ru.name );
								item_ru.name = item_ru.name || name_en;
								item_en.name = item_ru.name + special;
								if (item_ru.system?.description?.value) {
									item_en.system.description.value = item_ru.system.description.value;
								}

								if (item_en.system?.range?.value) {
									item_en.system.range.value = translateValue(
										item_en.system.range.value,
										translatedSpellRange
									);
								}

								if (item_en.system?.duration?.value) {
									item_en.system.duration.value = translateValue(
										item_en.system.duration.value,
										translatedSpellDuration
									);
								}

								if (item_en.system?.target?.value) {
									item_en.system.target.value = translateValue(
										item_en.system.target.value,
										translatedSpellTarget
									);
								}

								if (item_en.system?.damage?.value) {
									item_en.system.damage.value = translateValue(
										item_en.system.damage.value,
										translatedSpellDamage
									);
								}

								if (item_en.system?.god?.value) {
									item_en.system.god.value = translateValue(
										item_en.system.god.value,
										translatedGods
									);
								}

								break;
							}
						}
					} else if (item_en.type == "spell") {
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("spell");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;
								//DEBUG : console.log(">>>>> Spell ?", name_en, special, item_ru.name );
								item_en.name = item_ru.name + special;
								if (item_ru.system?.description?.value) {
									item_en.system.description.value = item_ru.system.description.value;
								}

								if (item_en.system?.range?.value) {
									item_en.system.range.value = translateValue(
										item_en.system.range.value,
										translatedSpellRange
									);
								}

								if (item_en.system?.duration?.value) {
									item_en.system.duration.value = translateValue(
										item_en.system.duration.value,
										translatedSpellDuration
									);
								}

								if (item_en.system?.target?.value) {
									item_en.system.target.value = translateValue(
										item_en.system.target.value,
										translatedSpellTarget
									);
								}

								if (item_en.system?.damage?.value) {
									item_en.system.damage.value = translateValue(
										item_en.system.damage.value,
										translatedSpellDamage
									);
								}

								break;
							}
						}
					} else if (item_en.type == "talent") {
						if (name_en.includes("(") && name_en.includes(")")) {
							// Then process specific skills name with (xxxx) inside
							let re = /(.*) +\((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1].trim(); // Get the root talent name, no parenthesis this time...
							special = " (" + game.i18n.localize(res[2].trim()) + ")"; // And the special keyword
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("talent");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en; // Security since babele v10
								//console.log(">>>>> Talent ?", item_ru, name_en, special, item_ru.name);
								if (item_ru.name && (item_ru.name == "Sprinter" || item_ru.name != name_en)) {
									// Talent translated!
									item_en.name = item_ru.name.trim() + special;
									if (item_ru.system?.description?.value) {
										// Why ???
										item_en.system.description.value = item_ru.system.description.value;
									}
								}
								break;
							}
						}
					} else if (item_en.type == "career") {
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("career");
						for (let compData of validCompendiums) {
							let career_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (career_ru?.system) {
								item_en.name = career_ru.name || item_en.name;
								// DEBG: console.log(">>>>> Career ?", career_ru.name );
								item_en.system = duplicate(career_ru.system);
								break;
							}
						}
					} else {
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag(
							["trapping"],
							["weapon", "armour", "container", "money"]
						);
						for (let compData of validCompendiums) {
							let trapping_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true
							);
							if (trapping_ru?.system) {
								console.log(">>>>> Trapping ?", name_en, trapping_ru.name);
								item_en.name = trapping_ru.name || item_en.name;
								if (trapping_ru.system?.description?.value) {
									item_en.system.description.value = trapping_ru.system.description.value;
								}
								break;
							}
						}
					}
				}
				console.log(">>>>>>>><OUTPUT", actor_items);
				return actor_items;
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

		function translateCompoundString(value, termTranslations, detailTranslations) {
			if (value && typeof value === "string") {
				// if (translatedExceptions.hasOwnProperty(value)) {
				// 	return translatedExceptions[value];
				// }

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

		function translateObjectNames(arr, termTranslations, detailTranslations) {
			if (!arr) return;
			return arr.map((obj) => {
				if (obj.hasOwnProperty("flags.babele.translated")) return obj;

				if (obj.hasOwnProperty("name")) {
					obj.name = translateCompoundString(obj.name, termTranslations, detailTranslations);
				}
				return obj;
			});
		}
	}
}
