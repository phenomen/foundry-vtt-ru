export function init() {
	/* Уведомление выбора перевода */
	game.settings.register("ru-ru", "altTranslationSelected", {
		type: Boolean,
		default: false,
		scope: "world",
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	/* Настройка Babele */
	game.settings.register("ru-ru", "compendiumTranslation", {
		name: "Перевод библиотек",
		hint: "(Требуется модуль Babele) Некоторые библиотеки системы D&D5e будут переведены.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	if (!game.settings.get("ru-ru", "altTranslationSelected")) {
		new Dialog({
			title: "Выбор перевода",
			content: `<p>Выберите предпочитаемый перевод системы D&D5. Вы можете изменить это позже в настройках модуля</p>`,
			buttons: {
				hw: {
					label: "Hobby World",
					callback: () => {
						game.settings.set("ru-ru", "altTranslation", false);
						game.settings.set("ru-ru", "altTranslationSelected", true);
					}
				},
				ph: {
					label: "Phantom Studio",
					callback: () => {
						game.settings.set("ru-ru", "altTranslation", true);
						game.settings.set("ru-ru", "altTranslationSelected", true);
					}
				}
			}
		}).render(true);
	}

	/* Регистрация Babele */
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ru-ru",
			lang: "ru",
			dir: game.settings.get("ru-ru", "altTranslation")
				? "compendium/dnd5e-alt"
				: "compendium/dnd5e"
		});

		game.settings.set("babele", "showOriginalName", true);
	} else {
		if (game.settings.get("ru-ru", "compendiumTranslation")) {
			new Dialog({
				title: "Перевод библиотек",
				content: `<p>Для перевода библиотек системы D&D5 требуется активировать модуль <b>Babele</b>. Вы можете отключить перевод библиотек в настройках модуля</p>`,
				buttons: {
					done: {
						label: "Хорошо"
					},
					never: {
						label: "Больше не показывать",
						callback: () => {
							game.settings.set("ru-ru", "compendiumTranslation", false);
						}
					}
				}
			}).render(true);
		}
	}

	/* Приключение HOUSE DIVIDED */
	if (game.modules.get("house-divided")?.active) {
		localizeHouseDivided();
	}

	/*  Настройка автоопределения анимаций AA  */
	Hooks.on("renderSettingsConfig", (app, html, data) => {
		if (!game.user.isGM) return;

		const lastMenuSetting = html
			.find(`input[name="ru-ru.compendiumTranslation"]`)
			.closest(".form-group");

		const updateAAButton = $(`
  <label>
    Перед переводом анимаций требуется включить модули Automated Animations, D&D5e Animations, JB2A Patreon
  </label>
  <div class="form-group">
      <button type="button">
          <i class="fas fa-cogs"></i>
          <label>Перевести анимации</label>
      </button>
  </div>
  `);
		updateAAButton.find("button").click((e) => {
			e.preventDefault();
			updateAA();
		});

		lastMenuSetting.after(updateAAButton);
	});
}

async function updateAA() {
	const translatedSettings = await foundry.utils.fetchJsonWithTimeout(
		"/modules/ru-ru/i18n/modules/aa-autorec.json"
	);

	const currentSettings = AutomatedAnimations.AutorecManager.getAutorecEntries();

	const newSettings = {
		melee: mergeArrays(currentSettings.melee, translatedSettings.melee),
		range: mergeArrays(currentSettings.range, translatedSettings.range),
		ontoken: mergeArrays(currentSettings.ontoken, translatedSettings.ontoken),
		templatefx: mergeArrays(currentSettings.templatefx, translatedSettings.templatefx),
		aura: mergeArrays(currentSettings.aura, translatedSettings.aura),
		preset: mergeArrays(currentSettings.preset, translatedSettings.preset),
		aefx: mergeArrays(currentSettings.aefx, translatedSettings.aefx),
		version: "5"
	};

	AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify(newSettings), {
		submitAll: true
	});
}

function localizeHouseDivided() {
	/* Поддержка кириллицы в стилях */
	const moduleCSS = document.createElement("link");
	moduleCSS.rel = "stylesheet";
	moduleCSS.href = `/modules/ru-ru/styles/house-divided.css`;
	document.head.appendChild(moduleCSS);

	/* Изменения в журнале */
	class HouseDividedRussianJournalSheet extends JournalSheet {
		constructor(doc, options) {
			super(doc, options);
			this.options.classes.push("house-divided", doc.getFlag("house-divided", "realm"));
			this.sidebarSections = doc.getFlag("house-divided", "sidebar-sections") ?? false;
		}

		async _renderInner(...args) {
			const html = await super._renderInner(...args);
			if (this.sidebarSections) this._insertSidebarSections(html);
			return html;
		}

		_insertSidebarSections(html) {
			const toc = html[0].querySelector(".pages-list .directory-list");
			if (!toc.children.length) return;
			const sections = { overview: false, quests: false, events: false };
			const divider = document.createElement("li");
			divider.classList.add("directory-section", "level1");
			for (const li of Array.from(toc.children)) {
				if (!sections.overview) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>Обзор</h2>";
					li.before(d);
					sections.overview = true;
					continue;
				}

				const title = li.querySelector(".page-title").innerText;
				if (!sections.events && title.startsWith("Событие:")) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>События</h2>";
					li.before(d);
					sections.events = true;
					continue;
				}

				if (!sections.quests && title.startsWith("Задание:")) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>Задания</h2>";
					li.before(d);
					sections.quests = true;
				}
			}
		}
	}

	/* Регистрация шаблона журнала */
	DocumentSheetConfig.registerSheet(
		JournalEntry,
		"house-divided",
		HouseDividedRussianJournalSheet,
		{
			types: ["base"],
			label: "Разделённый дом",
			makeDefault: false
		}
	);
}

function mergeArrays(array1, array2) {
	const mergedArray = array1.map((item1) => {
		const matchingItem = array2.find((item2) => item2.metaData.label === item1.metaData.label);
		if (matchingItem) {
			return { ...item1, ...matchingItem };
		}
		return item1;
	});

	return mergedArray;
}
