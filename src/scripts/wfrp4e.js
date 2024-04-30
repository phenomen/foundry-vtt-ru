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

						if (Object.hasOwn(translatedExceptions, list[i])) {
							list[i] = translatedExceptions[list[i]];
						} else {
							for (const pack of packs) {
								const translation = translateItem(
									list[i],
									"skill",
									pack.metadata.id,
									translatedSkillSpec,
								);

								list[i] = translation.name || list[i];

								if (translation?.system) break;
							}
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

						if (Object.hasOwn(translatedExceptions, list[i])) {
							list[i] = translatedExceptions[list[i]];
						} else {
							for (const pack of packs) {
								const translation = translateItem(
									list[i],
									"talent",
									pack.metadata.id,
									translatedTalentSpec,
								);

								list[i] = translation.name || list[i];
								if (translation?.system) break;
							}
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

			convertActorItems: (items) => {
				if (!items) return;

				return items.map((item) => {
					if (item.name) {
						switch (item.type) {
							case "skill":
								return translateSkill(item);
							case "trait":
								return translateTrait(item);
							case "talent":
								return translateTalent(item);
							case "spell":
							case "prayer":
								return translateSpell(item);
							case "career":
								return translateCareer(item);
							case "trapping":
							case "weapon":
							case "armour":
							case "container":
							case "money":
								return translateTrapping(item);
							default:
								return item;
						}
					}
					return item;
				});
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

function translateItem(name, type, pack, specs) {
	let translation = game.babele.translate(
		pack,
		{ name: name, type: type },
		true,
	);

	if (translation?.name) {
		return translation;
	}

	const words = parseParentheses(name);

	translation = game.babele.translate(
		pack,
		{ name: words.main, type: type },
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

function translateSkill(item) {
	const packs = game.wfrp4e.tags.getPacksWithTag("skill");
	let translation;

	for (const pack of packs) {
		translation = translateItem(
			item.name,
			"skill",
			pack.metadata.id,
			translatedSkillSpec,
		);

		if (translation?.system) {
			foundry.utils.mergeObject(item, translation);
			break;
		}
	}

	if (Object.hasOwn(translatedExceptions, item.name)) {
		item.name = translatedExceptions[item.name];
	}

	return item;
}

function translateTrait(item) {
	return item;
}

function translateTalent(item) {
	return item;
}

function translateCareer(item) {
	return item;
}

function translateSpell(item) {
	return item;
}

function translateTrapping(item) {
	return item;
}
