import {
	setupBabele,
	translateList,
	translateValue,
	parseParentheses,
} from "../shared.js";
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
		libWrapper.register(
			"ru-ru",
			"Babele.prototype.loadTranslations",
			patchBabele,
			"OVERRIDE",
		);

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

			convertCareerSkills: (list) => {
				const packs = game.wfrp4e.tags.getPacksWithTag("skill");

				if (list) {
					for (let i = 0; i < list.length; i++) {
						list[i] = list[i].trim();

						for (const pack of packs) {
							const translation = translateParentheses(
								list[i],
								translatedSkillSpec,
								"skill",
								pack.metadata.id,
							);

							list[i] = translation.name || list[i];
							if (translation?.system) break;
						}
					}
				}

				return list;
			},

			convertCareerTalents: (list) => {
				const packs = game.wfrp4e.tags.getPacksWithTag("talent");

				if (list) {
					for (let i = 0; i < list.length; i++) {
						list[i] = list[i].trim();

						for (const pack of packs) {
							const translation = translateParentheses(
								list[i],
								translatedTalentSpec,
								"talent",
								pack.metadata.id,
							);

							list[i] = translation.name || list[i];
							if (translation?.system) break;
						}
					}
				}

				return list;
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
							const regex = /^(\w+)\s*\(([^)]+)\)$/;
							const parsed = name_en.match(regex);
							if (parsed) {
								name_en = parsed[1];
								special = ` (${translateValue(
									parsed[2],
									translatedTalentSpec,
								)})`;
							} else {
								console.log(
									`Trait ${name_en} does not match the expected format.`,
								);
							}
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
									item_ru.system.description.value ||
									item_en.system.description.value;

								if (
									item_en.system?.specification &&
									typeof item_en.system.specification.value === "string"
								) {
									const translatedSpec = translateValue(
										item_en.system.specification.value.trim(),
										translatedTalentSpec,
									);

									item_en.system.specification.value =
										translatedSpec || item_en.system.specification.value;
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
									item_en.name = translatedExceptions[item_en.name];
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

async function patchBabele(wrapped, ...args) {
	const files = await getTranslationsFiles(this);

	console.log("ru-ru: Patching Babele");

	if (files.length === 0) {
		console.log(
			`Babele | no compendium translation files found for ${game.settings.get(
				"core",
				"language",
			)} language.`,
		);

		return [];
	}

	const allTranslations = [];
	const loadTranslations = async (collection, urls) => {
		if (urls.length === 0) {
			console.log(`Babele | no translation file found for ${collection} pack`);
		} else {
			const [translations] = await Promise.all([
				Promise.all(
					urls.map((url) =>
						fetch(url)
							.then((r) => r.json())
							.catch((e) => {}),
					),
				),
			]);

			let translation;
			for (const t of translations) {
				if (t) {
					if (translation) {
						translation.label = t.label ?? translation.label;
						if (t.entries) {
							translation.entries = {
								...translation.entries,
								...t.entries,
							};
						}
						if (t.mapping) {
							translation.mapping = {
								...translation.mapping,
								...t.mapping,
							};
						}
					} else {
						translation = t;
					}
				}
			}

			if (translation) {
				console.log(
					`Babele | translation for ${collection} pack successfully loaded`,
				);
				allTranslations.push(
					mergeObject(translation, { collection: collection }),
				);
			}
		}
	};

	for (const metadata of game.data.packs) {
		if (this.supported(metadata)) {
			const collection = this.getCollection(metadata);
			const collectionFileName = encodeURI(`${collection}.json`);
			const urls = files.filter((file) => file.endsWith(collectionFileName));

			await loadTranslations(collection, urls);
		}
	}

	// Handle specific files for pack folders
	for (const file of files.filter((file) =>
		file.endsWith("_packs-folders.json"),
	)) {
		const fileName = file.split("/").pop();

		await loadTranslations(fileName.replace(".json", ""), [file]);
	}

	return allTranslations;
}

async function getTranslationsFiles() {
	if (!game.user.hasPermission("FILES_BROWSE")) {
		return game.settings.get("babele", "translationFiles");
	}

	const directories = [
		"/modules/ru-ru/compendium/wfrp4e",
		"/modules/ru-ru/compendium/wfrp4e/altdorf",
		"/modules/ru-ru/compendium/wfrp4e/archives1",
		"/modules/ru-ru/compendium/wfrp4e/archives2",
		"/modules/ru-ru/compendium/wfrp4e/core",
		"/modules/ru-ru/compendium/wfrp4e/dotr",
		"/modules/ru-ru/compendium/wfrp4e/eis",
		"/modules/ru-ru/compendium/wfrp4e/empire-ruins",
		"/modules/ru-ru/compendium/wfrp4e/gm-toolkit",
		"/modules/ru-ru/compendium/wfrp4e/horned-rat",
		"/modules/ru-ru/compendium/wfrp4e/middenheim",
		"/modules/ru-ru/compendium/wfrp4e/owb1",
		"/modules/ru-ru/compendium/wfrp4e/pbtt",
		"/modules/ru-ru/compendium/wfrp4e/rnhd",
		"/modules/ru-ru/compendium/wfrp4e/salzenmund",
		"/modules/ru-ru/compendium/wfrp4e/starter-set",
		"/modules/ru-ru/compendium/wfrp4e/ua1",
		"/modules/ru-ru/compendium/wfrp4e/ua2",
		"/modules/ru-ru/compendium/wfrp4e/up-in-arms",
		"/modules/ru-ru/compendium/wfrp4e/wom",
		"/modules/ru-ru/compendium/wfrp4e/zoo",
	];

	const files = [];

	for (let i = 0; i < directories.length; i++) {
		try {
			const result = await FilePicker.browse("data", directories[i]);
			for (const file of result.files) {
				files.push(file);
			}
		} catch (err) {
			console.warn(`Babele: ${err}`);
		}
	}

	if (game.user.isGM) {
		game.settings.set("babele", "translationFiles", files);
	}

	return files;
}

function translateParentheses(str, specs, category, pack) {
	let translation = game.babele.translate(
		pack,
		{ name: str, type: category },
		true,
	);

	if (translation?.name) {
		return translation;
	}

	const words = parseParentheses(str);

	translation = game.babele.translate(
		pack,
		{ name: words.main, type: category },
		true,
	);

	if (translation?.name) {
		translation.name = words.sub
			? `${translation.name} (${translateValue(words.sub, specs)})`
			: translation.name;
		return translation;
	}

	return undefined;
}
