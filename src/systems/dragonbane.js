import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("dragonbane");

	registerConverters();
}

function registerConverters() {
	let itemTranslationsCache = null;
	const count = 0;

	const getItemTranslations = () => {
		if (itemTranslationsCache) {
			// console.log("CACHE HIT", count++);
			return itemTranslationsCache;
		}

		try {
			const allTranslations = game.babele?.translations;
			if (!allTranslations || allTranslations.length === 0) {
				console.warn("Dragonbane + ru-ru: No Babele translations found");
				return null;
			}

			itemTranslationsCache = {};
			let totalItems = 0;
			let processedPacks = 0;

			for (let i = 0; i < allTranslations.length; i++) {
				const translation = allTranslations[i];
				if (!translation.entries) continue;

				for (const [packName, packData] of Object.entries(translation.entries)) {
					if (packData?.items && typeof packData.items === "object") {
						Object.assign(itemTranslationsCache, packData.items);

						const itemCount = Object.keys(packData.items).length;
						totalItems += itemCount;
						processedPacks++;

						console.log(`Dragonbane + ru-ru: Loaded ${itemCount} items from pack "${packName}"`);
					}
				}
			}

			if (totalItems === 0) {
				console.warn("Dragonbane + ru-ru: No item translations found in any pack");
				itemTranslationsCache = null;
				return null;
			}

			console.log(
				`Dragonbane + ru-ru: Translation cache created with ${totalItems} items from ${processedPacks} pack(s)`,
			);
			return itemTranslationsCache;
		} catch (error) {
			console.error("Dragonbane + ru-ru: Error accessing translation entries:", error);
			return null;
		}
	};

	game.babele.registerConverters({
		translateItemList(list) {
			if (!list || typeof list !== "string") {
				return list || "";
			}

			const entries = getItemTranslations();
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
