import { patchConfigReady, patchConfigSetup } from "./wfrp4-config";
import {
	translatedDuration,
	translatedHitLocation,
	translatedCareerClass,
	translatedGender,
	translatedSpecie,
	translatedSkillSpec,
	translatedSkillExceptions,
	translatedTalentSpec,
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
			/*
			convertSkill: (skills) => {
				if (!skills) return;
				return translateArray(skills, translatedSkill, translatedSpec);
			},
			*/

			/*
			convertTalent: (talents) => {
				if (!talents) return;
				return translateArray(talents, translatedTalent, translatedSpec);
			},
			*/

			/*
			convertActorSkill: (skills) => {
				if (!skills) return;
				return translateObjectNames(skills, translatedSkill, translatedSpec);
			},
			*/

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

			/*
			convertSpecification: (specification) => {
				if (!specification) return;
				return translateValue(specification, translatedSpecification);
			},
			*/

			/*
			convertGender: (gender) => {
				if (!gender) return;
				return translateValue(gender, translatedGender);
			},
			*/

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

			convertCareerSkills: (skills_list) => {
				let validCompendiums = game.wfrp4e.tags.getPacksWithTag("skill");
				if (skills_list) {
					let i;
					let len = skills_list.length;
					let re = /(.*)\((.*)\)/i;
					for (i = 0; i < len; i++) {
						skills_list[i] = skills_list[i].trim();
						for (let compData of validCompendiums) {
							let translItem = game.babele.translate(
								compData.metadata.id,
								{ name: skills_list[i], type: "skill" },
								true
							);
							let transl = translItem?.name || undefined;
							if (!transl) transl = skills_list[i];
							if (transl == skills_list[i]) {
								let res = re.exec(skills_list[i]);
								if (res) {
									let subword = translateValue(res[2].trim(), translatedSkillSpec);
									if (!subword) {
										subword = res[2];
									}
									let s1 = res[1].trim() + " ()";
									translItem = game.babele.translate(
										compData.metadata.id,
										{ name: s1, type: "skill" },
										true
									);
									let translw = translItem?.name || undefined;
									if (translw && translw != s1) {
										let res2 = re.exec(translw);
										if (res2) {
											transl = res2[1] + "(" + subword + ")";
										} else {
											break;
										}
									} else {
										s1 = res[1].trim() + " ( )";
										translItem = game.babele.translate(
											compData.metadata.id,
											{ name: s1, type: "skill" },
											true
										);
										translw = translItem?.name || undefined;
										let res2 = re.exec(translw);
										if (res2) {
											transl = res2[1] + "(" + subword + ")";
										} else {
											break;
										}
									}
								}
							}
							skills_list[i] = transl;
							if (translItem?.system) break;
						}
					}
				}
				return skills_list;
			},

			convertCareerTalents: (talents_list) => {
				let validCompendiums = game.wfrp4e.tags.getPacksWithTag("talent");
				let i;
				if (talents_list) {
					let len = talents_list.length;
					let re = /(.*)\((.*)\)/i;
					for (i = 0; i < len; i++) {
						for (let compData of validCompendiums) {
							let translItem = game.babele.translate(
								compData.metadata.id,
								{ name: talents_list[i], type: "talent" },
								true
							);
							let transl = translItem?.name || undefined;
							if (!transl) transl = talents_list[i];
							if (transl == talents_list[i]) {
								let res = re.exec(talents_list[i]);
								if (res) {
									let subword = translateValue(res[2].trim(), translatedTalentSpec);
									if (!subword) {
										subword = res[2];
									}
									let s1 = res[1].trim();
									translItem = game.babele.translate(
										compData.metadata.id,
										{ name: s1, type: "talent" },
										true
									);
									let translw = translItem?.name || undefined;
									if (translw && translw != s1) {
										transl = translw + " (" + subword + ")";
									}
								}
							}
							talents_list[i] = transl;
							if (translItem?.system) break;
						}
					}
				}
				return talents_list;
			},

			convertActorDetails: (details) => {
				let newDetails = duplicate(details);
				if (details.species?.value)
					newDetails.species.value = translateValue(details.species.value, translatedSpecie);
				if (details.gender?.value)
					newDetails.gender.value = translateValue(details.gender.value, translatedGender);
				if (details.class?.value)
					newDetails.class.value = translateValue(details.class.value, translatedCareerClass);
				return newDetails;
			},

			convertActorItems: (actor_items, translations) => {
				if (!actor_items) {
					return actor_items;
				}
				for (let item_en of actor_items) {
					let special = "";
					let nbt = "";
					let name_en = item_en.name.trim();
					if (!item_en.name || item_en.name.length == 0) {
						console.log("WARNING: Wrong item name found!");
						continue;
					}
					if (item_en.type == "trait") {
						if (name_en.includes("Tentacles")) {
							let re = /(.d*)x Tentacles/i;
							let res = re.exec(name_en);
							if (res && res[1]) nbt = res[1] + "x ";
							name_en = "Tentacles";
						} else if (name_en.includes("(") && name_en.includes(")")) {
							let re = /(.*) \((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1];
							special = " (" + translateValue(res[2].trim(), translatedTalentSpec) + ")";
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("trait");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || item_en.name;
								item_en.name = nbt + item_ru.name + special;

								item_en.system.description.value = item_ru.system.description.value;
								if (item_en.system?.specification && isNaN(item_en.system.specification.value)) {
									item_en.system.specification.value = translateValue(
										item_en.system.specification.value.trim(),
										translatedTalentSpec
									);
								}

								break;
							}
						}
					} else if (item_en.type == "skill") {
						if (name_en.includes("(") && name_en.includes(")")) {
							let re = /(.*) +\((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1].trim();
							special = " (" + translateValue(res[2].trim(), translatedSkillSpec) + ")";
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("skill");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;
								item_en.name = item_ru.name + special;
								item_en.system.description.value = item_ru.system.description.value;
								break;
							}
						}
					} else if (item_en.type == "prayer") {
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("prayer");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
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
							let re = /(.*) +\((.*)\)/i;
							let res = re.exec(name_en);
							name_en = res[1].trim();
							special = " (" + game.i18n.localize(res[2].trim()) + ")";
						}
						let validCompendiums = game.wfrp4e.tags.getPacksWithTag("talent");
						for (let compData of validCompendiums) {
							let item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;

								if (item_en.system?.tests?.value && isNaN(item_en.system.tests.value)) {
									item_en.system.tests.value = item_ru.system.tests.value;
								}

								if (item_ru.name && (item_ru.name == "Бегун" || item_ru.name != name_en)) {
									item_en.name = item_ru.name.trim() + special;
									if (item_ru.system?.description?.value) {
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
								//item_en.system = duplicate(career_ru.system);
								break;
							}
						}
					} else if (
						item_en.type == "trapping" ||
						item_en.type == "weapon" ||
						item_en.type == "armour" ||
						item_en.type == "container" ||
						item_en.type == "money"
					) {
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
								item_en.name = trapping_ru.name || item_en.name;
								if (trapping_ru.system?.description?.value) {
									item_en.system.description.value = trapping_ru.system.description.value;
								}
								break;
							}
						}
					}
				}

				return actor_items;
			}
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
