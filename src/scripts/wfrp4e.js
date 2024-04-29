import { setupBabele, translateList, translateValue } from "../shared.js";
import { patchConfigReady, patchConfigSetup } from "./wfrp4-config.js";

import {
	translatedCareerClass,
	translatedDuration,
	translatedExceptions,
	translatedGender,
	translatedGods,
	translatedHitLocation,
	translatedSkillSpec,
	translatedSpecies,
	translatedSpellDamage,
	translatedSpellDuration,
	translatedSpellRange,
	translatedSpellTarget,
	translatedTalentSpec,
} from "./wfrp4-data.js";

export function init() {
	setupBabele("wfrp4e");

	if (typeof Babele !== "undefined") {
		Babele.get().registerConverters({
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

			convertCareerSkills: (originalSkillsList) => {
				const skillPacks = game.wfrp4e.tags.getPacksWithTag("skill");

				if (originalSkillsList) {
					let index;
					const skillsListLength = originalSkillsList.length;
					const skillRegex = /(.*)\((.*)\)/i;

					for (index = 0; index < skillsListLength; index++) {
						originalSkillsList[index] = originalSkillsList[index].trim();

						for (const skillPack of skillPacks) {
							let translatedItem = game.babele.translate(
								skillPack.metadata.id,
								{ name: originalSkillsList[index], type: "skill" },
								true,
							);

							let translatedSkill = translatedItem?.name || undefined;

							if (!translatedSkill) {
								translatedSkill = originalSkillsList[index];
							}

							if (translatedSkill === originalSkillsList[index]) {
								const result = skillRegex.exec(originalSkillsList[index]);

								if (result) {
									let subword = translateValue(
										result[2].trim(),
										translatedSkillSpec,
									);

									if (!subword) {
										subword = result[2];
									}

									let skillPart1 = `${result[1].trim()} ()`;

									translatedItem = game.babele.translate(
										skillPack.metadata.id,
										{ name: skillPart1, type: "skill" },
										true,
									);

									let translatedWithSubword = translatedItem?.name || undefined;

									if (
										translatedWithSubword &&
										translatedWithSubword !== skillPart1
									) {
										const result2 = skillRegex.exec(translatedWithSubword);

										if (result2) {
											translatedSkill = `${result2[1]}(${subword})`;
										} else {
											console.log("WARNING: Wrong skill name found!");
											break;
										}
									} else {
										skillPart1 = `${result[1].trim()} ( )`;

										translatedItem = game.babele.translate(
											skillPack.metadata.id,
											{ name: skillPart1, type: "skill" },
											true,
										);

										translatedWithSubword = translatedItem?.name || undefined;

										const result2 = skillRegex.exec(translatedWithSubword);

										if (result2) {
											translatedSkill = `${result2[1]}(${subword})`;
										} else {
											console.log("WARNING: Wrong skill name found!");
											break;
										}
									}
								}
							}

							originalSkillsList[index] = translatedSkill;

							if (translatedItem?.system) break;
						}
					}
				}

				return originalSkillsList;
			},

			convertCareerTalents: (originalTalentsList) => {
				const talentPacks = game.wfrp4e.tags.getPacksWithTag("talent");
				let index;

				if (originalTalentsList) {
					const talentsListLength = originalTalentsList.length;
					const talentRegex = /(.*)\((.*)\)/i;

					for (index = 0; index < talentsListLength; index++) {
						for (const talentPack of talentPacks) {
							let translatedItem = game.babele.translate(
								talentPack.metadata.id,
								{ name: originalTalentsList[index], type: "talent" },
								true,
							);

							let translatedTalent = translatedItem?.name || undefined;

							if (!translatedTalent) {
								translatedTalent = originalTalentsList[index];
							}

							if (translatedTalent === originalTalentsList[index]) {
								const result = talentRegex.exec(originalTalentsList[index]);

								if (result) {
									let subword = translateValue(
										result[2].trim(),
										translatedTalentSpec,
									);

									if (!subword) {
										subword = result[2];
									}

									const talentPart1 = result[1].trim();

									translatedItem = game.babele.translate(
										talentPack.metadata.id,
										{ name: talentPart1, type: "talent" },
										true,
									);

									const translatedWithSubword =
										translatedItem?.name || undefined;

									if (
										translatedWithSubword &&
										translatedWithSubword !== talentPart1
									) {
										translatedTalent = `${translatedWithSubword} (${subword})`;
									}
								}
							}

							originalTalentsList[index] = translatedTalent;

							if (translatedItem?.system) break;
						}
					}
				}

				return originalTalentsList;
			},

			convertActorGender: (gender) => {
				if (!gender) return;
				return translateValue(gender, translatedGender);
			},

			convertActorSpecies: (species) => {
				if (!species) return;
				return translateValue(species, translatedSpecies);
			},

			convertActorCareerClass: (careerClass) => {
				if (!careerClass) return;
				return translateValue(careerClass, translatedCareerClass);
			},

			convertActorItems: (actor_items, translations) => {
				if (!actor_items) {
					return actor_items;
				}
				for (const item_en of actor_items) {
					let special = "";
					let name_en = item_en.name.trim();
					if (!item_en.name || item_en.name.length === 0) {
						console.log("WARNING: Wrong item name found!");
						continue;
					}
					if (item_en.type === "trait") {
						if (name_en.includes("(") && name_en.includes(")")) {
							const re = /(.*) \((.*)\)/i;
							const res = re.exec(name_en);
							name_en = res[1];
							special = ` (${translateValue(
								res[2].trim(),
								translatedTalentSpec,
							)})`;
						}
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("trait");
						for (const compData of validCompendiums) {
							const item_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || item_en.name;
								item_en.name = item_ru.name + special;
								item_en.system.description.value =
									item_ru.system.description.value;

								if (
									item_en.system?.specification &&
									Number.isNaN(item_en.system.specification.value)
								) {
									item_en.system.specification.value = translateValue(
										item_en.system.specification.value.trim(),
										translatedTalentSpec,
									);
								}
								break;
							}
						}
					} else if (item_en.type === "skill") {
						if (name_en.includes("(") && name_en.includes(")")) {
							const re = /(.*) +\((.*)\)/i;
							const res = re.exec(name_en);
							name_en = res[1].trim();
							special = ` (${translateValue(
								res[2].trim(),
								translatedSkillSpec,
							)})`;
						}

						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("skill");
						for (const compData of validCompendiums) {
							const item_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);

							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;
								if (Object.hasOwn(translatedExceptions, item_en.name)) {
									item_en.name = translatedExceptions[value];
								} else {
									item_en.name = item_ru.name + special;
								}

								item_en.system.description.value =
									item_ru.system.description.value;
								break;
							}
						}
					} else if (item_en.type === "prayer") {
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("prayer");
						for (const compData of validCompendiums) {
							const item_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;
								item_en.name = item_ru.name + special;
								if (item_ru.system?.description?.value) {
									item_en.system.description.value =
										item_ru.system.description.value;
								}

								if (item_en.system?.range?.value) {
									item_en.system.range.value = translateValue(
										item_en.system.range.value,
										translatedSpellRange,
									);
								}

								if (item_en.system?.duration?.value) {
									item_en.system.duration.value = translateValue(
										item_en.system.duration.value,
										translatedSpellDuration,
									);
								}

								if (item_en.system?.target?.value) {
									item_en.system.target.value = translateValue(
										item_en.system.target.value,
										translatedSpellTarget,
									);
								}

								if (item_en.system?.damage?.value) {
									item_en.system.damage.value = translateValue(
										item_en.system.damage.value,
										translatedSpellDamage,
									);
								}

								if (item_en.system?.god?.value) {
									item_en.system.god.value = translateValue(
										item_en.system.god.value,
										translatedGods,
									);
								}
								break;
							}
						}
					} else if (item_en.type === "spell") {
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("spell");
						for (const compData of validCompendiums) {
							const item_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);
							if (item_ru?.system) {
								item_ru.name = item_ru.name || name_en;
								item_en.name = item_ru.name + special;
								if (item_ru.system?.description?.value) {
									item_en.system.description.value =
										item_ru.system.description.value;
								}

								if (item_en.system?.range?.value) {
									item_en.system.range.value = translateValue(
										item_en.system.range.value,
										translatedSpellRange,
									);
								}

								if (item_en.system?.duration?.value) {
									item_en.system.duration.value = translateValue(
										item_en.system.duration.value,
										translatedSpellDuration,
									);
								}

								if (item_en.system?.target?.value) {
									item_en.system.target.value = translateValue(
										item_en.system.target.value,
										translatedSpellTarget,
									);
								}

								if (item_en.system?.damage?.value) {
									item_en.system.damage.value = translateValue(
										item_en.system.damage.value,
										translatedSpellDamage,
									);
								}
								break;
							}
						}
					} else if (item_en.type === "talent") {
						if (name_en.includes("(") && name_en.includes(")")) {
							const re = /(.*) +\((.*)\)/i;
							const res = re.exec(name_en);
							name_en = res[1].trim();
							special = ` (${translateValue(
								res[2].trim(),
								translatedTalentSpec,
							)})`;
						}
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("talent");
						for (const compData of validCompendiums) {
							const item_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);
							if (item_ru?.system) {
								item_en.name = item_ru.name || name_en;

								if (
									item_ru?.system?.tests?.value &&
									item_en?.system?.tests?.value
								) {
									item_en.system.tests.value = item_ru.system.tests.value;
								}
								break;
							}
						}
					} else if (item_en.type === "career") {
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag("career");
						for (const compData of validCompendiums) {
							const career_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);

							if (career_ru?.system) {
								item_en.name = career_ru.name || item_en.name;
								//item_en.system = duplicate(career_ru.system);
								break;
							}
						}
					} else if (
						item_en.type === "trapping" ||
						item_en.type === "weapon" ||
						item_en.type === "armour" ||
						item_en.type === "container" ||
						item_en.type === "money"
					) {
						const validCompendiums = game.wfrp4e.tags.getPacksWithTag(
							["trapping"],
							["weapon", "armour", "container", "money"],
						);
						for (const compData of validCompendiums) {
							const trapping_ru = game.babele.translate(
								compData.metadata.id,
								{ name: name_en },
								true,
							);
							if (trapping_ru?.system) {
								item_en.name = trapping_ru.name || item_en.name;
								if (trapping_ru.system?.description?.value) {
									item_en.system.description.value =
										trapping_ru.system.description.value;
								}
								break;
							}
						}
					}
				}

				return actor_items;
			},
		});

		Hooks.once("ready", () => {
			patchConfigReady();
		});

		Hooks.on("setup", () => {
			patchConfigSetup();
		});
	}
}
