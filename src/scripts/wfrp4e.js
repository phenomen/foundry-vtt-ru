import { patchConfigReady, patchConfigSetup } from "./wfrp4-config.js";
import {
	translatedDuration,
	translatedHitLocation,
	translatedCareerClass,
	translatedGender,
	translatedSpecies,
	translatedSkillSpec,
	translatedSkillExceptions,
	translatedTalentSpec,
	translatedSpellRange,
	translatedSpellDuration,
	translatedSpellTarget,
	translatedSpellDamage,
	translatedGods
} from "./wfrp4-data.js";

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
			convertDuration: translateValue(translatedDuration),
			convertHitLocation: translateValue(translatedHitLocation),
			convertCareerClass: translateValue(translatedCareerClass),
			convertSpellRange: translateValue(translatedSpellRange),
			convertSpellDuration: translateValue(translatedSpellDuration),
			convertSpellTarget: translateValue(translatedSpellTarget),
			convertSpellDamage: translateValue(translatedSpellDamage),
			convertGods: translateList(translatedGods),
			convertCareerSkills: translateSkills,
			convertCareerTalents: translateTalents,
			convertActorGender: translateValue(translatedGender),
			convertActorSpecie: translateValue(translatedSpecies),
			convertActorCareerClass: translateValue(translatedCareerClass),
			convertActorItems: translateItems
		});

		Hooks.once("ready", patchConfigReady);
		Hooks.on("setup", patchConfigSetup);
	}
}

function translateValue(translations) {
	return (value) => translations[value] || value;
}

function translateList(translations) {
	return (value) => value.split(", ").map(translateValue(translations)).join(", ");
}

function translateSkills(originalSkillsList) {
	if (!originalSkillsList) return;

	const skillPacks = game.wfrp4e.tags.getPacksWithTag("skill");
	const skillRegex = /(.*)\((.*)\)/i;

	return originalSkillsList.map((skill) => {
		skill = skill.trim();

		for (const skillPack of skillPacks) {
			const translatedItem = game.babele.translate(
				skillPack.metadata.id,
				{ name: skill, type: "skill" },
				true
			);

			let translatedSkill = translatedItem?.name;

			if (translatedSkill && translatedSkill !== skill) {
				return translatedSkill;
			}

			const result = skillRegex.exec(skill);

			if (result) {
				const [, skillName, subword] = result;
				const translatedSubword = translateValue(translatedSkillSpec)(subword.trim()) || subword;
				const skillTranslation = translateSkillName(skillPack, skillName.trim(), translatedSubword);

				if (skillTranslation) {
					return skillTranslation;
				}
			}
		}

		return skill;
	});
}

function translateSkillName(skillPack, skillName, translatedSubword) {
	const skillTemplates = [`${skillName} ()`, `${skillName} ( )`];

	for (const template of skillTemplates) {
		const translatedItem = game.babele.translate(
			skillPack.metadata.id,
			{ name: template, type: "skill" },
			true
		);

		const translatedSkill = translatedItem?.name;

		if (translatedSkill && translatedSkill !== template) {
			const result = /(.*)\(\)/i.exec(translatedSkill);

			if (result) {
				const [, translatedName] = result;
				return `${translatedName}(${translatedSubword})`;
			}
		}
	}

	return null;
}

function translateTalents(originalTalentsList) {
	if (!originalTalentsList) return;

	const talentPacks = game.wfrp4e.tags.getPacksWithTag("talent");
	const talentRegex = /(.*)\((.*)\)/i;

	return originalTalentsList.map((talent) => {
		for (const talentPack of talentPacks) {
			const translatedItem = game.babele.translate(
				talentPack.metadata.id,
				{ name: talent, type: "talent" },
				true
			);

			let translatedTalent = translatedItem?.name;

			if (translatedTalent && translatedTalent !== talent) {
				return translatedTalent;
			}

			const result = talentRegex.exec(talent);

			if (result) {
				const [, talentName, subword] = result;
				const translatedSubword = translateValue(translatedTalentSpec)(subword.trim()) || subword;
				const translatedItem = game.babele.translate(
					talentPack.metadata.id,
					{ name: talentName.trim(), type: "talent" },
					true
				);

				const translatedWithSubword = translatedItem?.name;

				if (translatedWithSubword && translatedWithSubword !== talentName) {
					return `${translatedWithSubword} (${translatedSubword})`;
				}
			}
		}

		return talent;
	});
}

function translateItems(actor_items) {
	if (!actor_items) return actor_items;

	const itemTranslators = {
		trait: translateTrait,
		skill: translateSkill,
		prayer: translatePrayer,
		spell: translateSpell,
		talent: translateTalent,
		career: translateCareer,
		trapping: translateTrapping,
		weapon: translateTrapping,
		armour: translateTrapping,
		container: translateTrapping,
		money: translateTrapping
	};

	return actor_items.map((item) => {
		const translator = itemTranslators[item.type];
		return translator ? translator(item) : item;
	});
}

function translateTrait(item) {
	let special = "";
	let nbt = "";
	const name_en = item.name.trim();

	if (!name_en || name_en.length === 0) {
		console.log("WARNING: Wrong item name found!");
		return item;
	}

	if (name_en.includes("Tentacles")) {
		const re = /(.d*)x Tentacles/i;
		const res = re.exec(name_en);
		if (res && res[1]) nbt = res[1] + "x ";
		name_en = "Tentacles";
	} else if (name_en.includes("(") && name_en.includes(")")) {
		const re = /(.*) \((.*)\)/i;
		const res = re.exec(name_en);
		name_en = res[1];
		special = " (" + translateValue(translatedTalentSpec)(res[2].trim()) + ")";
	}

	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("trait");
	for (const compData of validCompendiums) {
		const item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
		if (item_ru?.system) {
			item.name = nbt + (item_ru.name || item.name) + special;
			item.system.description.value = item_ru.system.description.value;
			if (item.system?.specification && isNaN(item.system.specification.value)) {
				item.system.specification.value = translateValue(translatedTalentSpec)(
					item.system.specification.value.trim()
				);
			}
			break;
		}
	}

	return item;
}

function translateSkill(item) {
	let special = "";
	const name_en = item.name.trim();

	if (name_en.includes("(") && name_en.includes(")")) {
		const re = /(.*) +\((.*)\)/i;
		const res = re.exec(name_en);
		const [, skillName, specialization] = res;
		special = " (" + translateValue(translatedSkillSpec)(specialization.trim()) + ")";
	}

	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("skill");
	for (const compData of validCompendiums) {
		const item_ru = game.babele.translate(compData.metadata.id, { name: name_en }, true);
		if (item_ru?.system) {
			item.name = (item_ru.name || name_en) + special;
			item.system.description.value = item_ru.system.description.value;
			break;
		}
	}

	return item;
}

function translatePrayer(item) {
	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("prayer");
	for (const compData of validCompendiums) {
		const item_ru = game.babele.translate(compData.metadata.id, { name: item.name }, true);
		if (item_ru?.system) {
			item.name = item_ru.name || item.name;
			if (item_ru.system?.description?.value) {
				item.system.description.value = item_ru.system.description.value;
			}

			if (item.system?.range?.value) {
				item.system.range.value = translateValue(translatedSpellRange)(item.system.range.value);
			}

			if (item.system?.duration?.value) {
				item.system.duration.value = translateValue(translatedSpellDuration)(
					item.system.duration.value
				);
			}

			if (item.system?.target?.value) {
				item.system.target.value = translateValue(translatedSpellTarget)(item.system.target.value);
			}

			if (item.system?.damage?.value) {
				item.system.damage.value = translateValue(translatedSpellDamage)(item.system.damage.value);
			}

			if (item.system?.god?.value) {
				item.system.god.value = translateValue(translatedGods)(item.system.god.value);
			}

			break;
		}
	}

	return item;
}

function translateSpell(item) {
	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("spell");
	for (const compData of validCompendiums) {
		const item_ru = game.babele.translate(compData.metadata.id, { name: item.name }, true);
		if (item_ru?.system) {
			item.name = item_ru.name || item.name;
			if (item_ru.system?.description?.value) {
				item.system.description.value = item_ru.system.description.value;
			}

			if (item.system?.range?.value) {
				item.system.range.value = translateValue(translatedSpellRange)(item.system.range.value);
			}

			if (item.system?.duration?.value) {
				item.system.duration.value = translateValue(translatedSpellDuration)(
					item.system.duration.value
				);
			}

			if (item.system?.target?.value) {
				item.system.target.value = translateValue(translatedSpellTarget)(item.system.target.value);
			}

			if (item.system?.damage?.value) {
				item.system.damage.value = translateValue(translatedSpellDamage)(item.system.damage.value);
			}

			break;
		}
	}

	return item;
}

function translateTalent(item) {
	let special = "";

	if (item.name.includes("(") && item.name.includes(")")) {
		const re = /(.*) +\((.*)\)/i;
		const res = re.exec(item.name);
		const [, talentName, specialization] = res;
		item.name = talentName.trim();
		special = " (" + game.i18n.localize(specialization.trim()) + ")";
	}

	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("talent");
	for (const compData of validCompendiums) {
		const item_ru = game.babele.translate(compData.metadata.id, { name: item.name }, true);
		if (item_ru?.system) {
			if (item.system?.tests?.value && isNaN(item.system.tests.value)) {
				item.system.tests.value = item_ru.system.tests.value;
			}

			break;
		}
	}

	return item;
}

function translateCareer(item) {
	const validCompendiums = game.wfrp4e.tags.getPacksWithTag("career");
	for (const compData of validCompendiums) {
		const career_ru = game.babele.translate(compData.metadata.id, { name: item.name }, true);
		if (career_ru?.system) {
			item.name = career_ru.name || item.name;
			break;
		}
	}

	return item;
}

function translateTrapping(item) {
	const validCompendiums = game.wfrp4e.tags.getPacksWithTag(
		["trapping"],
		["weapon", "armour", "container", "money"]
	);
	for (const compData of validCompendiums) {
		const trapping_ru = game.babele.translate(compData.metadata.id, { name: item.name }, true);
		if (trapping_ru?.system) {
			item.name = trapping_ru.name || item.name;
			if (trapping_ru.system?.description?.value) {
				item.system.description.value = trapping_ru.system.description.value;
			}
			break;
		}
	}

	return item;
}
