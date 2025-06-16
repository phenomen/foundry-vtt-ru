import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("dragonbane");

	registerConverters();
}

function registerConverters() {
	let translationMap = null;

	const getTranslationMap = () => {
		if (translationMap) {
			return translationMap;
		}

		try {
			const translations = game.babele.translations;

			if (!translations || translations.length < 1) {
				console.warn("Dragonbane: No Babele translations found");
				return null;
			}

			// Create a simple key:value mapping
			const map = {};

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
						// Extract original:translation mapping from this pack
						Object.keys(packData.items).forEach((originalName) => {
							const item = packData.items[originalName];
							if (item?.name) {
								map[originalName] = item.name;
							}
						});
					}
				});
			});

			if (Object.keys(map).length === 0) {
				console.warn("Dragonbane: No translation mappings found in any Babele translations");
				return null;
			}

			console.log(
				`Dragonbane: Cached ${
					Object.keys(map).length
				} translation mappings from ${translations.length} translation packs`
			);
			translationMap = map;
			return map;
		} catch (error) {
			console.error("Dragonbane: Error creating translation map:", error);
			return null;
		}
	};

	game.babele.registerConverters({
		translateItemList(list) {
			if (!list || typeof list !== "string") {
				return list || "";
			}

			const map = getTranslationMap();
			if (!map) {
				return list;
			}

			return list
				.split(",")
				.map((item) => {
					const trimmedItem = item.trim();
					return map[trimmedItem] || trimmedItem;
				})
				.sort((a, b) => a.localeCompare(b))
				.join(", ");
		},
	});
}
