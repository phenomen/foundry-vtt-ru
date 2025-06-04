import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("dragonbane");

	registerConverters();
}

function registerConverters() {
	let cachedEntries = null;

	const getTranslationEntries = () => {
		if (cachedEntries) {
			return cachedEntries;
		}

		try {
			const translations = game.babele?.translations?.[0];
			if (!translations) {
				console.warn("Dragonbane: No Babele translations found");
				return null;
			}

			const entries = translations.entries?.["Dragonbane - Rules"]?.items;
			if (!entries) {
				console.warn("Dragonbane: No entries found in Babele translations");
				return null;
			}

			cachedEntries = entries;
			return entries;
		} catch (error) {
			console.error("Dragonbane: Error accessing translation entries:", error);
			return null;
		}
	};

	game.babele.registerConverters({
		translateListCore(list) {
			if (!list || typeof list !== "string") {
				return list || "";
			}

			const entries = getTranslationEntries();
			if (!entries) {
				return list;
			}

			return list
				.split(",")
				.map((item) => {
					const trimmedItem = item.trim();
					return entries[trimmedItem]?.name || trimmedItem;
				})
				.sort((a, b) => a.localeCompare(b))
				.join(", ");
		},
	});
}
