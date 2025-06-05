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
			const translations = game.babele.translations;

			if (!translations || translations.length < 1) {
				console.warn("Dragonbane: No Babele translations found");
				return null;
			}

			// Dynamically discover and merge all translation packs
			let allItems = {};

			translations.forEach((translation, index) => {
				if (!translation.entries) {
					console.log(`Dragonbane: Translation ${index} has no entries`);
					return;
				}

				// Iterate through all entries in this translation
				Object.keys(translation.entries).forEach((packName) => {
					const packData = translation.entries[packName];

					if (packData?.items) {
						console.log(`Dragonbane: Found items in pack "${packName}"`);
						// Merge items from this pack
						allItems = foundry.utils.mergeObject(allItems, packData.items);
					}
				});
			});

			if (Object.keys(allItems).length === 0) {
				console.warn("Dragonbane: No items found in any Babele translations");
				return null;
			}

			console.log(
				`Dragonbane: Cached ${
					Object.keys(allItems).length
				} translation entries from ${translations.length} translation packs`,
			);
			cachedEntries = allItems;
			return allItems;
		} catch (error) {
			console.error("Dragonbane: Error accessing translation entries:", error);
			return null;
		}
	};

	game.babele.registerConverters({
		translateItemList(list) {
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
