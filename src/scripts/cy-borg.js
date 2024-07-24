import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("cy-borg");

	CONFIG.CY.appBacklashesTable = "Противодействие программ";
	/*
	libWrapper.register(
		"ru-ru",
		"CONFIG.Item.documentClass.prototype.createLinkedInfestation",
		async (wrapped, ...args) => {
		
			const infestation = await drawDocument(
				TABLES_PACK,
				"Заражения",
			);
			if (!infestation) {
				console.error("Не удалось получить заражение");
				return;
			}
			const data = dupeData(infestation);
			data.system.nanoId = this.id;
			await this.parent.createEmbeddedDocuments("Item", [data]);
	
		},
		"OVERRIDE",
	);
		*/
}
