import { setupBabele } from "../shared.js";

export async function init() {
	registerSettings();

	if (game.settings.get("ru-ru", "compendiumTranslation")) {
		if (game.babele) {
			registerConverters();

			game.settings.get("ru-ru", "altTranslation")
				? setupBabele("dnd5e/ds")
				: setupBabele("dnd5e/ag");

			if (game.modules.get("chris-premades") && game.settings.get("ru-ru", "translateCPR")) {
				setupBabele("dnd5e/chris");
			}
		}
	}

	registerHooks();

	Hooks.once("i18nInit", async () => {
		await loadAltTranslation();
	});
}

/* Регистрация настроек */
function registerSettings() {
	game.settings.register("ru-ru", "compendiumTranslation", {
		name: "(D&D5E) Перевод библиотек 5e SRD",
		hint: "Библиотеки системы D&D5E будут переведены. Перевод библиотек требуется для корректного перевода типов оружия, брони, языков и других элементов (требуется модуль Babele)",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: () => {
			window.location.reload();
		},
	});

	game.settings.register("ru-ru", "altTranslation", {
		name: "(D&D5E) Альтернативный перевод",
		hint: "Использовать альтернативный перевод от Dungeons.ru. Иначе будет использоваться официальный перевод Hobby World и Adventure Guys (требуется модуль libWrapper)",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		},
	});

	game.settings.register("ru-ru", "translateCPR", {
		name: "(D&D5E) Перевод библиотек Cauldron of Plentiful Resources",
		hint: "Перевод библиотек модуля Cauldron of Plentiful Resources. Отключите, если у вас возникли проблемы с работой модуля.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: () => {
			window.location.reload();
		},
	});
}

/* Регистрация дополнительных хуков */
function registerHooks() {
	/*  Настройка автоопределения анимаций AA  */
	Hooks.on("renderSettingsConfig", (app, html, data) => {
		if (!game.user.isGM) return;

		const lastMenuSetting = html.find(`input[name="ru-ru.translateCPR"]`).closest(".form-group");

		const updateAAButton = $(`
  <label>
    Перед переводом анимаций требуется включить модули Automated Animations, D&D5E Animations, JB2A Patreon
  </label>
  <div class="form-group">
      <button type="button">
          <i class="fas fa-cogs"></i>
          <label>Перевести анимации</label>
      </button>
  </div>
  `);
		updateAAButton.find("button").click(async (e) => {
			e.preventDefault();
			await updateAA();
		});

		lastMenuSetting.after(updateAAButton);
	});
}

/* Регистрация конвертеров Babele */
function registerConverters() {
	game.babele.registerConverters({
		dndpages(pages, translations) {
			return pages.map((data) => {
				if (!translations) {
					return data;
				}

				let translation;

				if (Array.isArray(translations)) {
					translation = translations.find((t) => t.id === data._id || t.id === data.name);
				} else {
					translation = translations[data.name];
				}

				if (!translation) {
					return data;
				}

				return foundry.utils.mergeObject(data, {
					name: translation.name,
					image: { caption: translation.caption ?? data.image.caption },
					src: translation.src ?? data.src,
					text: { content: translation.text ?? data.text.content },
					video: {
						width: translation.width ?? data.video.width,
						height: translation.height ?? data.video.height,
					},
					system: { tooltip: translation.tooltip ?? data.system.tooltip },
					translated: true,
				});
			});
		},
	});
}

/* Обновление базы AA */
async function updateAA() {
	if (!game.modules.get("autoanimations")?.active) {
		ui.notifications.error("Модуль Automated Animations не активен");
		return;
	}

	try {
		const translatedSettings = await foundry.utils.fetchJsonWithTimeout(
			"/modules/ru-ru/i18n/modules/aa-autorec.json",
		);

		const currentSettings = AutomatedAnimations.AutorecManager.getAutorecEntries();
		if (!currentSettings) {
			throw new Error(
				"Не удалось получить текущие настройки анимаций. Убедитесь, что модуль D&D5E Animations активен и анимации установлены.",
			);
		}

		const newSettings = {
			melee: mergeArraysByLabel(currentSettings.melee, translatedSettings.melee),
			range: mergeArraysByLabel(currentSettings.range, translatedSettings.range),
			ontoken: mergeArraysByLabel(currentSettings.ontoken, translatedSettings.ontoken),
			templatefx: mergeArraysByLabel(currentSettings.templatefx, translatedSettings.templatefx),
			aura: mergeArraysByLabel(currentSettings.aura, translatedSettings.aura),
			preset: mergeArraysByLabel(currentSettings.preset, translatedSettings.preset),
			aefx: mergeArraysByLabel(currentSettings.aefx, translatedSettings.aefx),
			version: "5",
		};

		await AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify(newSettings), {
			submitAll: true,
		});

		ui.notifications.info("Настройки анимаций обновлены");
	} catch (error) {
		console.error("Не удалось обновить настройки анимаций:", error);
		ui.notifications.error("Не удалось обновить настройки анимаций");
	}
}

function mergeArraysByLabel(array1, array2) {
	const labelMap = new Map(array2.map((item) => [item.metaData.label, item]));

	return array1.map((item) => {
		const matchingItem = labelMap.get(item.metaData.label);
		return matchingItem ? { ...item, ...matchingItem } : item;
	});
}

/* Загрузка JSON с альтернативным переводом */
async function loadAltTranslation() {
	if (!game.settings.get("ru-ru", "altTranslation")) return;

	const route = foundry.utils.getRoute("/");

	const modulePath = "modules/ru-ru/i18n/modules/alt/";
	const systemPath = "modules/ru-ru/i18n/systems/alt/";

	const systemFiles = ["dnd5e.json", "dnd5e-plural.json"];
	const moduleFiles = [
		"action-pack.json",
		"activeauras.json",
		"always-hp.json",
		"arbron-hp-bar.json",
		"autoanimations.json",
		"bossbar.json",
		"combat-utility-belt.json",
		"combatbooster.json",
		"compendium-browser.json",
		"damage-log.json",
		"dnd5e-system-customizer.json",
		"enhancedcombathud-dnd5e.json",
		"enhancedcombathud.json",
		"epic-rolls-5e.json",
		"gatherer.json",
		"health-monitor.json",
		"healthestimate.json",
		"lmrtfy.json",
		"midi-qol.json",
		"ready-set-roll-5e.json",
		"splatter.json",
		"tidy5e-sheet.json",
		"token-action-hud-dnd5e.json",
		"vision-5e.json",
	];

	const files = [
		...systemFiles.map((file) => `${route}${systemPath}${file}`),
		...moduleFiles.map((file) => `${route}${modulePath}${file}`),
	];

	const altTranslations = {};

	for (const file of files) {
		try {
			const altJson = await foundry.utils.fetchJsonWithTimeout(file);
			foundry.utils.mergeObject(altTranslations, altJson, { inplace: true });
		} catch (error) {
			console.warn(`Не удалось загрузить перевод: ${file}`, error);
		}
	}

	game.i18n.translations = foundry.utils.mergeObject(game.i18n.translations, altTranslations);

	console.log("MERGED ALT TRANSLATIONS");
}
