export function InitWFRP4() {
    if (typeof Babele === "undefined") {
        new Dialog({
            title: "Перевод библиотек",
            content: `<p>Для перевода библиотек системы WFRP4 требуется установить и активировать модуль Babele.<p>`,
            buttons: {
                done: {
                    label: "Хорошо",
                },
            },
        }).render(true);
    }

    let compendium = "wfrp4e";
    game.modules.forEach((module, name) => {
        if (name === "wfrp4e-core" && module.active) {
            compendium = "wfrp4e-core";
        }
    });

    if (game.system.id === "wfrp4e") {
        Babele.get().register({
            module: "ru-ru",
            lang: "ru",
            dir: "compendium/wfrp4e",
        });

        Babele.get().registerConverters({
            talent_effects: (
                effects,
                translations,
                data,
                translatedCompendium,
                translatedTalent
            ) => {
                if (effects) {
                    return effects.map((effect) => {
                        effect.label = translatedTalent.name;
                        return effect;
                    });
                }
            },
            npc_characteristics: (chars) => {
                for (let key in chars) {
                    let char = chars[key];
                    let abrev = char.abrev;

                    // Some of NPCs have localization keys in their characteristics, meanwhile others don't
                    // This will patch NPCs that don't utilize translation keys
                    if (!abrev.includes("CHARAbbrev.")) {
                        char.label = "CHAR." + abrev;
                        char.abrev = "CHARAbbrev." + abrev;
                    }
                }

                return chars;
            },
            npc_traits: (npcTraits) => {
                if (!npcTraits) {
                    return;
                }

                const fullTraits = game.packs.get("wfrp4e-core.traits") || {};
                const fullSkills = game.packs.get(
                    compendium === "wfrp4e" ? "wfrp4e.basic" : "wfrp4e-core.skills"
                );
                const fullTalents = game.packs.get("wfrp4e-core.talents") || {};
                const fullCareers = game.packs.get("wfrp4e-core.careers") || {};
                const fullTrappings = game.packs.get(
                    compendium === "wfrp4e" ? "wfrp4e.basic" : "wfrp4e-core.trappings"
                );
                const fullSpells = game.packs.get("wfrp4e-core.spells") || {};
                const fullPrayers = game.packs.get("wfrp4e-core.prayers") || {};

                for (let originalTrait of npcTraits) {
                    let parsedTrait = parseTraitName(originalTrait.name);

                    if (originalTrait.type === "trait" && fullTraits.index) {
                        let translatedTrait = fullTraits.index.find(
                            (trait) => trait.originalName === parsedTrait.baseName
                        );
                        if (!translatedTrait) {
                            continue;
                        }

                        originalTrait.name = translatedTrait.name + parsedTrait.special;
                        if (typeof originalTrait.type !== "undefined") {
                            originalTrait.name = originalTrait.name.replace(
                                "#",
                                parsedTrait.tentacles
                            );
                        }
                        if (
                            translatedTrait.data &&
                            translatedTrait.data.description &&
                            translatedTrait.data.description.value
                        ) {
                            originalTrait.data.description.value =
                                translatedTrait.data.description.value;
                        }

                        if (isNaN(originalTrait.data.specification.value)) {
                            // This is a string, so translate it
                            let specificationKey =
                                "SPEC." + originalTrait.data.specification.value.trim();
                            let specification = game.i18n.localize(
                                "SPEC." + originalTrait.data.specification.value.trim()
                            );
                            specification =
                                specification !== specificationKey ?
                                specification :
                                originalTrait.data.specification.value.trim();

                            originalTrait.data.specification.value = specification;
                        }
                    } else if (originalTrait.type === "skill" && fullSkills.index) {
                        let translatedSkill = translateSkill(parsedTrait, fullSkills);

                        if (translatedSkill) {
                            originalTrait.name = translatedSkill.name.replace(
                                / \( ?\)/,
                                parsedTrait.special
                            );
                            originalTrait.data.description.value =
                                translatedSkill.data.description.value;
                        }
                    } else if (originalTrait.type === "prayer" && fullPrayers.index) {
                        let translatedTrait = fullPrayers.index.find(
                            (prayer) => prayer.originalName === parsedTrait.baseName
                        );
                        originalTrait.name = translatedTrait.name + parsedTrait.special;

                        if (
                            translatedTrait.data &&
                            translatedTrait.data.description &&
                            translatedTrait.data.description.value
                        )
                            originalTrait.data.description.value =
                            translatedTrait.data.description.value;
                    } else if (originalTrait.type === "spell" && fullSpells.index) {
                        let translatedTrait = fullSpells.index.find(
                            (spell) => spell.originalName === parsedTrait.baseName
                        );
                        originalTrait.name = translatedTrait.name + parsedTrait.special;

                        if (
                            translatedTrait.data &&
                            translatedTrait.data.description &&
                            translatedTrait.data.description.value
                        )
                            originalTrait.data.description.value =
                            translatedTrait.data.description.value;
                    } else if (originalTrait.type === "talent" && fullTalents.index) {
                        let translatedTrait = fullTalents.index.find(
                            (talent) => talent.originalName === parsedTrait.baseName
                        );

                        if (translatedTrait) {
                            originalTrait.name = translatedTrait.name + parsedTrait.special;
                            originalTrait.data.description.value =
                                translatedTrait.data.description.value;
                            originalTrait.data.tests = translatedTrait.data.tests;
                        }
                    } else if (originalTrait.type === "career" && fullCareers.index) {
                        originalTrait = fullCareers.index.find(
                            (career) => career.originalName === originalTrait.name
                        );
                    } else if (
                        originalTrait.type === "trapping" ||
                        originalTrait.type === "weapon" ||
                        originalTrait.type === "armour" ||
                        originalTrait.type === "container" ||
                        (originalTrait.type === "money" && fullTrappings.index)
                    ) {
                        let translatedTrapping = fullTrappings.index.find(
                            (trapping) => trapping.originalName === originalTrait.name
                        );
                        if (!translatedTrapping) {
                            continue;
                        }

                        originalTrait.name = translatedTrapping.name;
                        originalTrait.data.description =
                            translatedTrapping.data ?.description;
                    }
                }
                return npcTraits;
            },
            skills: (skills) => {
                const fullSkills = game.packs.get(
                    compendium === "wfrp4e" ? "wfrp4e.basic" : "wfrp4e-core.skills"
                );
                return skills.map((skill) => {
                    let parsedSkill = parseTraitName(skill);
                    let translatedSkill = translateSkill(parsedSkill, fullSkills);

                    if (translatedSkill) {
                        return translatedSkill.name.replace(/ \( ?\)/, parsedSkill.special);
                    }

                    return skill;
                });
            },
            talents: (talents) => {
                const fullTalents = game.packs.get("wfrp4e-core.talents");
                return talents.map((talent) => {
                    let parsedTalent = parseTraitName(talent);
                    let translatedTalent = fullTalents.index.find(
                        (talent) => talent.originalName === parsedTalent.baseName
                    );

                    if (translatedTalent) {
                        return translatedTalent.name + parsedTalent.special;
                    }

                    return talent;
                });
            },
        });
    }

    function translateSkill(parsedSkill, fullSkills) {
        if (parsedSkill.special) {
            let translatedSkill = fullSkills.index.find(
                (skill) =>
                skill.originalName === parsedSkill.baseName + parsedSkill.special
            );
            if (translatedSkill) {
                return translatedSkill;
            }
        }

        return (
            fullSkills.index.find(
                (skill) => skill.originalName === parsedSkill.baseName
            ) ||
            fullSkills.index.find((skill) =>
                skill.originalName.match(new RegExp(parsedSkill.baseName + " \\( ?\\)"))
            )
        );
    }

    function parseTraitName(traitName) {
        traitName = traitName.trim();
        let parsedTrait = {
            baseName: traitName,
            special: "",
            tentacles: "",
        };

        // Process specific Tentacles case
        if (traitName.includes("Tentacles")) {
            let res = /(?<tentacles>\d+)x Tentacles/i.exec(traitName);
            parsedTrait.baseName = "# Tentacles";
            parsedTrait.tentacles = res.groups.tentacles;
        }

        // Process specific skills name with (xxxx) inside
        if (traitName.includes("(") && traitName.includes(")")) {
            let res = /(.*) *\((.*)\)/i.exec(traitName);
            parsedTrait.baseName = res[1].trim();
            parsedTrait.special = " (" + game.i18n.localize(res[2].trim()) + ")";
        }

        return parsedTrait;
    }
    //END

    Hooks.once("ready", () => {
        patchWfrpConfig();
        loadTables();

        function patchWfrpConfig() {
            const WFRP4E = {};

            WFRP4E.weaponTypes = {
                melee: "Оружие ближнего боя",
                ranged: "Дистанционное оружие",
            };

            // Armor Qualities
            WFRP4E.armorQualities = {
                flexible: "Гибкая",
                impenetrable: "Непробиваемая",
            };

            // Armor Flaws
            WFRP4E.armorFlaws = {
                partial: "Неполная",
                weakpoints: "Уязвимые места",
            };

            // Difficulty Labels
            WFRP4E.difficultyLabels = {
                veasy: "Элементарная (+60)",
                easy: "Лёгкая (+40)",
                average: "Заурядная (+20)",
                challenging: "Серьёзная (+0)",
                difficult: "Трудная (-10)",
                hard: "Тяжёлая (-20)",
                vhard: "Безумная (-30)",
            };

            WFRP4E.locations = {
                head: "Голова",
                body: "Туловище",
                rArm: "Правая рука",
                lArm: "Левая рука",
                rLeg: "Правая нога",
                lLeg: "Левая нога",
            };

            WFRP4E.magicLores = {
                petty: "Простейшие заклинания",
                beasts: "Школа Зверей",
                death: "Школа Смерти",
                fire: "Школа Огня",
                heavens: "Школа Небес",
                metal: "Школа Металла",
                life: "Школа Жизни",
                light: "Школа Света",
                shadow: "Школа Тени",
                hedgecraft: "Школа Знахарства",
                witchcraft: "Школа Ведьмовства",
                daemonology: "Школа Демонологии",
                necromancy: "Школа Некромантии",
                nurgle: "Школа Нургла",
                slaanesh: "Школа Слаанеша",
                tzeentch: "Школа Тзинча",
            };

            WFRP4E.magicWind = {
                petty: "Нет",
                beasts: "Гарр",
                death: "Шаиш",
                fire: "Акши",
                heavens: "Азир",
                metal: "Шамон",
                life: "Гайран",
                light: "Хиш",
                shadow: "Улгу",
                hedgecraft: "Нет",
                witchcraft: "Нет",
                daemonology: "Дхар",
                necromancy: "Дхар",
                nurgle: "Дхар",
                slaanesh: "Дхар",
                tzeentch: "Дхар",
            };

            WFRP4E.prayerTypes = {
                blessing: "Благословение",
                miracle: "Чудо",
            };

            WFRP4E.mutationTypes = {
                physical: "Тело",
                mental: "Разум",
            };

            WFRP4E.hitLocationTables = {
                hitloc: "Стандартная",
                snake: "Змееподобная",
                spider: "Паукоподобная",
            };

            // Species
            WFRP4E.species = {
                human: "Человек",
                dwarf: "Гном",
                halfling: "Полурослик",
                helf: "Высший эльф",
                welf: "Лесной эльф",
            };

            WFRP4E.subspecies = {
                human: {
                    reiklander: {
                        name: "Рейкландец",
                        skills: [
                            "Обращение с животными",
                            "Обаяние",
                            "Хладнокровие",
                            "Оценка",
                            "Сплетничество",
                            "Торговля",
                            "Язык (бретонский)",
                            "Язык (вестерландский)",
                            "Лидерство",
                            "Знание (Рейкланд)",
                            "Рукопашный бой (основное)",
                            "Стрельба (луки)",
                        ],
                        talents: ["Роковое Пророчество", "Смекалка, Учтивость", 3],
                    },
                },
            };

            WFRP4E.speciesSkills = {
                human: [
                    "Обращение с животными",
                    "Обаяние",
                    "Хладнокровие",
                    "Оценка",
                    "Сплетничество",
                    "Торговля",
                    "Язык (бретонский)",
                    "Язык (вестерландский)",
                    "Лидерство",
                    "Знание (Рейкланд)",
                    "Рукопашный бой (основное)",
                    "Стрельба (луки)",
                ],
                dwarf: [
                    "Кутёж",
                    "Хладнокровие",
                    "Стойкость",
                    "Артистизм (сказительство)",
                    "Оценка",
                    "Запугивание",
                    "Язык (кхазалид)",
                    "Знание (гномы)",
                    "Знание (геология)",
                    "Знание (металлургия)",
                    "Рукопашный бой (основное)",
                    "Ремесло (любое)",
                ],
                halfling: [
                    "Обаяние",
                    "Кутёж",
                    "Уклонение",
                    "Азартные игры",
                    "Торговля",
                    "Интуиция",
                    "Язык (мутландский)",
                    "Знание (Рейкланд)",
                    "Наблюдательность",
                    "Ловкость рук",
                    "Скрытность (любая)",
                    "Ремесло (повар)",
                ],
                helf: [
                    "Хладнокровие",
                    "Артистизм (пение)",
                    "Оценка",
                    "Язык (эльтарин)",
                    "Лидерство",
                    "Рукопашный бой (основное)",
                    "Ориентирование",
                    "Наблюдательность",
                    "Музицирование (любое)",
                    "Стрельба (луки)",
                    "Хождение под парусом",
                    "Плавание",
                ],
                welf: [
                    "Атлетика",
                    "Лазание",
                    "Стойкость",
                    "Артистизм (пение)",
                    "Запугивание",
                    "Язык (эльтарин)",
                    "Рукопашный бой (основное)",
                    "Выживание",
                    "Наблюдательность",
                    "Стрельба (луки)",
                    "Скрытность (дикая природа)",
                    "Выслеживание",
                ],
            };

            WFRP4E.speciesTalents = {
                human: ["Роковое Пророчество", "Смекалка, Учтивость", 3],
                dwarf: [
                    "Устойчивость к магии",
                    "Сумеречное зрение",
                    "Грамотность, Непреклонность",
                    "Целеустремлённость, Твёрдость духа",
                    "Бугай",
                    0,
                ],
                halfling: [
                    "Обострённое восприятие (Вкус)",
                    "Сумеречное зрение",
                    "Устойчивость (Хаос)",
                    "Небольшой",
                    2,
                ],
                helf: [
                    "Обострённое восприятие (Зрение)",
                    "Самообладание, Смекалка",
                    "Сумеречное зрение",
                    "Второе зрение, Шестое чувство",
                    "Грамотность",
                    0,
                ],
                welf: [
                    "Обострённое восприятие (Зрение)",
                    "Здоровяк, Второе зрение",
                    "Сумеречное зрение",
                    "Грамотность, Закалка",
                    "Скиталец",
                    0,
                ],
            };

            // Weapon Group Descriptions
            WFRP4E.weaponGroupDescriptions = {
                basic: "основное",
                cavalry: "WFRP4E.GroupDescription.Cavalry",
                fencing: "фехтовальное",
                brawling: "кулачное",
                flail: "WFRP4E.GroupDescription.Flail",
                parry: "WFRP4E.GroupDescription.Parry",
                polearm: "древковое",
                twohanded: "двуручное",
                blackpowder: "WFRP4E.GroupDescription.Blackpowder",
                bow: "лук",
                crossbow: "WFRP4E.GroupDescription.Crossbow",
                entangling: "ловчее",
                engineering: "WFRP4E.GroupDescription.Engineering",
                explosives: "WFRP4E.GroupDescription.Explosives",
                sling: "праща",
                throwing: "WFRP4E.GroupDescription.Throwing",
            };

            WFRP4E.symptoms = {
                blight: "Летальный исход",
                buboes: "Бубоны",
                convulsions: "Судороги",
                coughsAndSneezes: "Чихание и кашель",
                fever: "Жар",
                flux: "Понос",
                gangrene: "Гангрена",
                lingering: "Осложнения",
                malaise: "Слабость",
                nausea: "Тошнота",
                pox: "Сыпь",
                wounded: "Незаживающая рана",
                delirium: "Delirium",
                swelling: "Swelling",
            };

            for (let obj in WFRP4E) {
                for (let el in WFRP4E[obj]) {
                    if (typeof WFRP4E[obj][el] === "string") {
                        WFRP4E[obj][el] = game.i18n.localize(WFRP4E[obj][el]);
                    }
                }
            }

            mergeObject(game.wfrp4e.config, WFRP4E);

            // Patching system items/effects/statuses
            game.wfrp4e.config.systemItems.improv.name = "Импровизированное оружие";
            game.wfrp4e.config.systemItems.stomp.name = "Затаптывание";
            game.wfrp4e.config.systemItems.unarmed.name = "Безоружная атака";

            game.wfrp4e.config.systemItems.fear.name = "Страх";
            game.wfrp4e.config.systemItems.fear.data.test.value = "Хладнокровие";
            game.wfrp4e.config.systemItems.fear.effects[0].label = "Страх";

            game.wfrp4e.config.systemItems.terror.label = "Ужас";
            game.wfrp4e.config.systemItems.terror.flags.wfrp4e.script =
                game.wfrp4e.config.systemItems.terror.flags.wfrp4e.script.replace(
                    "Cool",
                    "Хладнокровие"
                );

            game.wfrp4e.config.systemEffects.enc1.label = "Перегруженность 1";
            game.wfrp4e.config.systemEffects.enc2.label = "Перегруженность 2";
            game.wfrp4e.config.systemEffects.enc3.label = "Перегруженность 3";

            game.wfrp4e.config.systemEffects.cold1.label = "Холод 1";
            game.wfrp4e.config.systemEffects.cold2.label = "Холод 2";
            game.wfrp4e.config.systemEffects.cold3.label = "Холод 3";

            game.wfrp4e.config.systemEffects.heat1.label = "Жара 1";
            game.wfrp4e.config.systemEffects.heat2.label = "Жара 2";
            game.wfrp4e.config.systemEffects.heat3.label = "Жара 3";

            game.wfrp4e.config.systemEffects.thirst1.label = "Жажда 1";
            game.wfrp4e.config.systemEffects.thirst2.label = "Жажда 2+";

            game.wfrp4e.config.systemEffects.starvation1.label = "Голод 1";
            game.wfrp4e.config.systemEffects.starvation2.label = "Голод 2";

            game.wfrp4e.config.systemEffects.defensive.label =
                "Уход в защиту [название навыка]";
            game.wfrp4e.config.systemEffects.defensive.flags.wfrp4e.script =
                game.wfrp4e.config.systemEffects.defensive.flags.wfrp4e.script
                .replace("Language (Magick)", "Язык (магический)")
                .replace("Prayer", "Молитва");

            game.wfrp4e.config.systemEffects.dualwielder.label = "Двойная атака";

            game.wfrp4e.config.systemEffects.consumealcohol1.label = "Кутёж 1";
            game.wfrp4e.config.systemEffects.consumealcohol2.label = "Кутёж 3";
            game.wfrp4e.config.systemEffects.consumealcohol3.label = "Кутёж 2";
            game.wfrp4e.config.systemEffects.stinkingdrunk1.label =
                "Мариенбуржская отвага";

            game.wfrp4e.config.symptomEffects.blight.label = "Летальный исход";
            game.wfrp4e.config.symptomEffects.buboes.label = "Бубоны";
            game.wfrp4e.config.symptomEffects.convulsions.label = "Судороги";
            game.wfrp4e.config.symptomEffects.coughsAndSneezes.label =
                "Чихание и кашель";
            game.wfrp4e.config.symptomEffects.fever.label = "Жар";
            game.wfrp4e.config.symptomEffects.flux.label = "Понос";
            game.wfrp4e.config.symptomEffects.gangrene.label = "Гангрена";
            game.wfrp4e.config.symptomEffects.lingering.label = "Осложнения";
            game.wfrp4e.config.symptomEffects.malaise.label = "Слабость";
            game.wfrp4e.config.symptomEffects.nausea.label = "Тошнота";
            game.wfrp4e.config.symptomEffects.pox.label = "Сыпь";
            game.wfrp4e.config.symptomEffects.wounded.label = "Незаживающая рана";
        }

        function loadTables() {
            // load tables from system folder
            FilePicker.browse("data", "modules/ru-ru/tables/wfrp4e").then((resp) => {
                try {
                    if (resp.error) {
                        throw "";
                    }
                    for (var file of resp.files) {
                        try {
                            if (!file.includes(".json")) continue;
                            let filename = file.substring(
                                file.lastIndexOf("/") + 1,
                                file.indexOf(".json")
                            );
                            fetch(file)
                                .then((r) => r.json())
                                .then(async(records) => {
                                    game.wfrp4e.tables[filename] = records;
                                });
                        } catch (error) {
                            console.error("Error reading " + file + ": " + error);
                        }
                    }
                } catch {
                    // Do nothing
                }
            });
        }
    });
}